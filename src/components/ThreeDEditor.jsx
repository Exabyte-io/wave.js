/* eslint-disable react/sort-comp */
// import "../MuiClassNameSetup";

import { DarkMaterialUITheme } from "@mat3ra/cove/dist/theme";
import ThemeProvider, { AlertProvider } from "@mat3ra/cove/dist/theme/provider";
import { exportToDisk } from "@mat3ra/cove/dist/utils/downloader";
import { Made } from "@mat3ra/made";
import { PERIODIC_TABLE } from "@mat3ra/periodic-table";
import Article from "@mui/icons-material/Article";
import Autorenew from "@mui/icons-material/Autorenew";
import CameraAlt from "@mui/icons-material/CameraAlt";
import CloudDownload from "@mui/icons-material/CloudDownload";
import ControlCameraRounded from "@mui/icons-material/ControlCameraRounded";
import Dehaze from "@mui/icons-material/Dehaze";
import DeleteIcon from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import FormatShapes from "@mui/icons-material/FormatShapes";
import GpsFixed from "@mui/icons-material/GpsFixed";
import HeightIcon from "@mui/icons-material/Height";
import Image from "@mui/icons-material/Image";
import ImportExport from "@mui/icons-material/ImportExport";
import LooksIcon from "@mui/icons-material/Looks";
import PictureInPicture from "@mui/icons-material/PictureInPicture";
import Redo from "@mui/icons-material/Redo";
import RemoveRedEye from "@mui/icons-material/RemoveRedEye";
import Replay from "@mui/icons-material/Replay";
import Settings from "@mui/icons-material/Settings";
import Spellcheck from "@mui/icons-material/Spellcheck";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import SwitchCamera from "@mui/icons-material/SwitchCamera";
import ThreeDRotation from "@mui/icons-material/ThreeDRotation";
import Undo from "@mui/icons-material/Undo";
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";
import Stack from "@mui/material/Stack";
import PropTypes from "prop-types";
import React from "react";

import { LABEL_TYPES, MEASUREMENT_MODES } from "../enums";
import {
    defaultMeasurementsSettings,
    MeasurementSettingsHandler,
} from "../mixins/measurements/MeasurementSettingsHandler";
import settings from "../settings";
import { describeEditCommit, EDIT_HINT_TIMEOUT_MS } from "../utils/editActions";
import { matchesEditorKey } from "../utils/keyBindings";
import { formatMeasurementValue } from "../utils/measurementReadout";
import EditToolbar from "./EditToolbar";
import FigureExportDialog from "./FigureExportDialog";
import IconsToolbar from "./IconsToolbar";
import KeyboardSheet from "./KeyboardSheet";
import ModePill from "./ModePill";
import ParametersMenu from "./ParametersMenu";
import QuickToggles from "./QuickToggles";
import SelectionInspector from "./SelectionInspector";
import StatusBar, { normalizeElement } from "./StatusBar";
import ToggleIndicator from "./ToggleIndicator";
import { ViewerErrorBoundary } from "./ViewerErrorBoundary";
import ViewerStatus from "./ViewerStatus";
import { WaveComponent } from "./WaveComponent";

/**
 * Maximum number of undo/redo entries retained. Each entry is a full Material clone, so this
 * bounds the editor's memory footprint over a long session; older entries fall off the back.
 */
const MAX_HISTORY_ENTRIES = 50;

/**
 * Wrapper component containing 3D visualization through `WaveComponent` and the associated controls
 */
export class ThreeDEditor extends React.Component {
    /**
     * Create a ThreeDEditor component
     * @param props Properties as explained below
     */
    constructor(props) {
        super(props);
        const {
            boundaryConditions,
            isConventionalCellShown,
            material,
            initialViewSettings = {},
        } = this.props;
        // TODO : overloading a bunch of props and state attributes here..
        this.state = {
            // on/off switch for the component
            isInteractive: false,
            activeToolbarMenu: null,
            isEditModeActive: false,
            activeTransformMode: "translate",
            historyStack: [material],
            historyPointer: 0,
            // Array of atomicIndex, per the mixin's multi-select onSelectionChanged contract
            // (D-4); empty = nothing selected, one entry = the common single-atom case.
            selectedAtomIndices: [],
            // Local draft strings for the X/Y/Z coordinate fields, indexed by axis; null means
            // "show the committed value". Lets a field be cleared or start with "-" while
            // focused without committing (and rebuilding the scene) on every keystroke (D18).
            coordinateDrafts: [null, null, null],
            // Local draft string for the element field while focused; null means "show the
            // committed value". Mirrors coordinateDrafts (D18) - no commit/history entry until
            // blur/Enter.
            elementDraft: null,
            // isDistanceAndAnglesShown: false,
            measurementsSettings: defaultMeasurementsSettings,
            // Keyboard sheet (`?`) visibility - it is help, so available whenever interactive.
            isKeyboardSheetOpen: false,
            // Figure export dialog (U-12) visibility.
            isFigureExportOpen: false,
            // Units the inspector *shows*. Independent of material.basis.units, which is what
            // the material stores and the only thing edits write to.
            displayUnits: null,
            // Transient "what just happened" hint, from onEditCommit's own {source} enum.
            lastActionHint: null,
            // Set when the viewer subtree throws; cleared by a retry, which also bumps
            // viewerResetKey to remount the boundary's children.
            viewerError: null,
            viewerResetKey: 0,
            // TODO: remove the need for `viewerTriggerResize`
            // whether to trigger resize
            viewerTriggerResize: false,
            // Settings of the wave viewer, merged with any initial overrides from URL params
            viewerSettings: {
                isViewAdjustable: initialViewSettings.isViewAdjustable ?? settings.isViewAdjustable,
                atomRadiiScale: initialViewSettings.atomRadiiScale ?? settings.atomRadiiScale,
                repetitionsAlongLatticeVectorA:
                    initialViewSettings.repetitionsAlongLatticeVectorA ?? settings.repetitions,
                repetitionsAlongLatticeVectorB:
                    initialViewSettings.repetitionsAlongLatticeVectorB ?? settings.repetitions,
                repetitionsAlongLatticeVectorC:
                    initialViewSettings.repetitionsAlongLatticeVectorC ?? settings.repetitions,
                chemicalConnectivityFactor:
                    initialViewSettings.chemicalConnectivityFactor ??
                    settings.chemicalConnectivityFactor,
            },
            // Toggle settings from URL to apply after Wave instance mounts
            _initialToggleSettings: {
                orthographicCamera: initialViewSettings.orthographicCamera,
                bonds: initialViewSettings.bonds,
                axes: initialViewSettings.axes,
                autoRotate: initialViewSettings.autoRotate,
                elementLabels: initialViewSettings.elementLabels,
                coordinateLabels: initialViewSettings.coordinateLabels,
            },
            boundaryConditions,
            isConventionalCellShown:
                initialViewSettings.conventionalCell ?? isConventionalCellShown,
            // material as originally passed in by the host, before any in-editor modification.
            originalMaterial: material,
            // material that is passed to WaveComponent to be visualized and may have repetition and radius adjusted.
            material: props.material.clone(),
        };
        this.handleCellRepetitionsChange = this.handleCellRepetitionsChange.bind(this);
        this.handleSphereRadiusChange = this.handleSphereRadiusChange.bind(this);
        this.handleDownloadClick = this.handleDownloadClick.bind(this);
        this.handleToggleInteractive = this.handleToggleInteractive.bind(this);
        this.handleToggleToolbarMenu = this.handleToggleToolbarMenu.bind(this);
        this.handleToggleBonds = this.handleToggleBonds.bind(this);
        this.handleToggleEditMode = this.handleToggleEditMode.bind(this);
        this.handleToggleOrthographicCamera = this.handleToggleOrthographicCamera.bind(this);
        this.handleToggleElementLabels = this.handleToggleElementLabels.bind(this);
        this.handleToggleCoordinateLabels = this.handleToggleCoordinateLabels.bind(this);
        this.handleToggleConventionalCell = this.handleToggleConventionalCell.bind(this);
        this.handleToggleIsViewAdjustable = this.handleToggleIsViewAdjustable.bind(this);
        this.handleResetViewer = this.handleResetViewer.bind(this);
        this.handleTakeScreenshot = this.handleTakeScreenshot.bind(this);
        this.handleToggleOrbitControls = this.handleToggleOrbitControls.bind(this);
        this.handleToggleOrbitControlsAnimation =
            this.handleToggleOrbitControlsAnimation.bind(this);
        this.handleToggleAxes = this.handleToggleAxes.bind(this);
        this.handleStructureModified = this.handleStructureModified.bind(this);
        this.handleUndo = this.handleUndo.bind(this);
        this.handleRedo = this.handleRedo.bind(this);
        this.handleCoordinateChange = this.handleCoordinateChange.bind(this);
        this.handleCoordinateDraftChange = this.handleCoordinateDraftChange.bind(this);
        this.handleCoordinateCommit = this.handleCoordinateCommit.bind(this);
        this.handleSetTransformMode = this.handleSetTransformMode.bind(this);
        this.handleAddAtom = this.handleAddAtom.bind(this);
        this.handleRemoveSelectedAtom = this.handleRemoveSelectedAtom.bind(this);
        this.handleCloneSelectedAtoms = this.handleCloneSelectedAtoms.bind(this);
        this.handleFocusCameraOnSelection = this.handleFocusCameraOnSelection.bind(this);
        this.handleElementDraftChange = this.handleElementDraftChange.bind(this);
        this.handleElementCommit = this.handleElementCommit.bind(this);
        this.handleSelectionChanged = this.handleSelectionChanged.bind(this);
        this.handleSelectElement = this.handleSelectElement.bind(this);
        this.handleToggleKeyboardSheet = this.handleToggleKeyboardSheet.bind(this);
        this.handleCloseKeyboardSheet = this.handleCloseKeyboardSheet.bind(this);
        this.handleOpenFigureExport = this.handleOpenFigureExport.bind(this);
        this.handleCloseFigureExport = this.handleCloseFigureExport.bind(this);
        this.handleExportFigure = this.handleExportFigure.bind(this);
        this.handleViewerError = this.handleViewerError.bind(this);
        this.handleDisplayUnitsChange = this.handleDisplayUnitsChange.bind(this);
        this.handleViewAlongAxis = this.handleViewAlongAxis.bind(this);
        this.handleRetryViewer = this.handleRetryViewer.bind(this);
        this.handleEditModeKeyDown = this.handleEditModeKeyDown.bind(this);
        this.canUndo = this.canUndo.bind(this);
        this.canRedo = this.canRedo.bind(this);
        this.undo = this.undo.bind(this);
        this.redo = this.redo.bind(this);
        this.renderEditSurface = this.renderEditSurface.bind(this);
        this.handleChemicalConnectivityFactorChange =
            this.handleChemicalConnectivityFactorChange.bind(this);
        this.handleToggleMeasurement = this.handleToggleMeasurement.bind(this);
        this.handleSetState = this.handleSetState.bind(this);
        this.handleSetMeasurementSettingsForTypeInState =
            this.handleSetMeasurementSettingsForTypeInState.bind(this);
        this.handleDeleteConnection = this.handleDeleteConnection.bind(this);
        this.handleResetMeasurements = this.handleResetMeasurements.bind(this);
        this.addHotKeyListener = this.addHotKeyListener.bind(this);
        this.removeHotKeyListener = this.removeHotKeyListener.bind(this);
        this.handleStartGifRecording = this.handleStartGifRecording.bind(this);
    }

    componentDidMount() {
        this.addHotKeyListener();
        document.addEventListener("keydown", this.handleEditModeKeyDown);
        this._applyInitialToggleSettings();
    }

    /**
     * Apply toggle-based view settings from URL params after the Wave instance is mounted.
     * These settings are imperative (they toggle state on the Wave class instance),
     * so they must be applied after componentDidMount when WaveComponent.wave exists.
     */
    _applyInitialToggleSettings() {
        const { _initialToggleSettings } = this.state;
        if (!_initialToggleSettings) return;
        // These settings arrive from URL params and are applied imperatively to the Wave
        // instance, so they need one to exist. Returning early used to drop them permanently
        // whenever the instance was not ready yet, silently losing every toggle in a shared
        // view link; retry on the next tick instead, once the child's own componentDidMount
        // has constructed it.
        if (!this.WaveComponent?.wave) {
            if (this._initialToggleSettingsRetried) return;
            this._initialToggleSettingsRetried = true;
            this._initialToggleSettingsTimeout = setTimeout(
                () => this._applyInitialToggleSettings(),
                0,
            );
            return;
        }

        if (_initialToggleSettings.orthographicCamera) {
            this.handleToggleOrthographicCamera();
        }
        if (_initialToggleSettings.bonds) {
            this.handleToggleBonds();
        }
        if (_initialToggleSettings.axes) {
            this.handleToggleAxes();
        }
        if (_initialToggleSettings.autoRotate) {
            this.handleToggleOrbitControlsAnimation();
        }
        if (_initialToggleSettings.elementLabels) {
            this.handleToggleElementLabels();
        }
        if (_initialToggleSettings.coordinateLabels) {
            this.handleToggleCoordinateLabels();
        }
    }

    componentWillUnmount() {
        this.removeHotKeyListener();
        document.removeEventListener("keydown", this.handleEditModeKeyDown);
        if (this._initialToggleSettingsTimeout) {
            clearTimeout(this._initialToggleSettingsTimeout);
            this._initialToggleSettingsTimeout = null;
        }
        if (this._editHintTimeout) {
            clearTimeout(this._editHintTimeout);
            this._editHintTimeout = null;
        }
    }

    /**
     * Delete/Backspace/Ctrl(Cmd)+Z/Ctrl(Cmd)+Shift+Z don't fire the "keypress" event the rest of
     * this component's hotkeys rely on (keypress only fires for character-producing keys), so
     * they're handled separately here on "keydown". Guarded the same way as handleKeyPress:
     * only while interactive and not while a form field has focus.
     */
    handleEditModeKeyDown(event) {
        const { isInteractive, isEditModeActive } = this.state;
        if (!isInteractive || ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.nodeName)) {
            return;
        }

        // Matched against settings.editorKeysConfig rather than inline comparisons, so these keys
        // reach the keyboard sheet (U-3) from the same declaration the handler uses. Escape is
        // declared there too but implemented in the mixin, which owns cancel-drag-versus-deselect.
        const { undo, redo, removeSelected } = settings.editorKeysConfig;

        // Undo/redo are deliberately NOT gated on edit mode (F6): leaving edit mode does not clear
        // historyStack, so gating them made a surviving history unreachable. They are gated on
        // there being something to do instead - which also keeps the viewer from swallowing a key
        // an embedding host may want for its own undo when our stack is empty.
        //
        // Redo is checked first: it is undo's binding plus Shift, and matchesEditorKey treats
        // Shift as significant, so order only matters if a future binding relaxes that.
        if (matchesEditorKey(event, redo)) {
            if (!this.canRedo()) return;
            event.preventDefault();
            this.handleRedo();
        } else if (matchesEditorKey(event, undo)) {
            if (!this.canUndo()) return;
            event.preventDefault();
            this.handleUndo();
        } else if (isEditModeActive && matchesEditorKey(event, removeSelected)) {
            // Removing an atom is an edit-mode action; outside it there is no selection to remove.
            this.handleRemoveSelectedAtom();
        }
    }

    // TODO: update component to fully controlled or fully uncontrolled with a key?
    // https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops
    // eslint-disable-next-line no-unused-vars
    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        const { material } = nextProps;
        if (!material) return;

        const { material: currentMaterial } = this.state;
        // A host that stores every onUpdate(material) and passes it straight back down (the
        // common "lift state up" pattern) must not have its own echo wipe our undo history and
        // selection - only reset when the incoming material's actual content differs from what
        // we're already showing (D16). calculateHash() is a real content hash (not a stored,
        // possibly-absent prop), so this can't false-positive on two materials that both happen
        // to lack a cached hash.
        let isSameContent = false;
        try {
            isSameContent =
                !!currentMaterial && material.calculateHash() === currentMaterial.calculateHash();
        } catch (error) {
            isSameContent = false;
        }
        if (isSameContent) return;

        const clonedMaterial = material.clone();
        this.setState({
            material: clonedMaterial,
            originalMaterial: material,
            boundaryConditions: nextProps.boundaryConditions || {},
            isConventionalCellShown: nextProps.isConventionalCellShown || false,
            // Undo/redo history is scoped to the material currently being edited.
            historyStack: [clonedMaterial],
            historyPointer: 0,
            selectedAtomIndices: [],
            coordinateDrafts: [null, null, null],
            elementDraft: null,
        });
        this.handleResetMeasurements();
    }

    _resetStateWaveComponent() {
        // eslint-disable-next-line react/no-unused-state
        this.setState({ wave: this.WaveComponent.wave });
    }

    handleSetSetting = (setting) => {
        const { viewerSettings } = this.state;
        this.setState({
            viewerSettings: {
                ...viewerSettings,
                ...setting,
            },
        });
    };

    // map of hotkeys to their handlers
    getKeyConfig() {
        return {
            [settings.hotKeysConfig.toggleKeyboardSheet]: this.handleToggleKeyboardSheet,
            [settings.hotKeysConfig.toggleOrbitControls]: this.handleToggleOrbitControls,
            [settings.hotKeysConfig.toggleInteractive]: this.handleToggleInteractive,
            [settings.hotKeysConfig.toggleBonds]: this.handleToggleBonds,
            [settings.hotKeysConfig.toggleElementLabels]: this.handleToggleElementLabels,
            [settings.hotKeysConfig.toggleCoordinateLabels]: this.handleToggleCoordinateLabels,
            [settings.hotKeysConfig.resetViewer]: this.handleResetViewer,
            [settings.hotKeysConfig.toggleEditMode]: this.handleToggleEditMode,
            [settings.hotKeysConfig.toggleDistanceShown]: this.handleToggleMeasurement.bind(
                this,
                MEASUREMENT_MODES.DISTANCE,
            ),
            [settings.hotKeysConfig.toggleAnglesShown]: this.handleToggleMeasurement.bind(
                this,
                MEASUREMENT_MODES.ANGLE,
            ),
            [settings.hotKeysConfig.toggleCopyCoordinatesShown]: this.handleToggleMeasurement.bind(
                this,
                MEASUREMENT_MODES.COORDINATE,
            ),
            [settings.hotKeysConfig.deleteConnection]: this.handleDeleteConnection,
        };
    }

    addHotKeyListener() {
        document.addEventListener("keypress", this.handleKeyPress, true);
    }

    handleKeyPress = (e) => {
        const { isInteractive } = this.state;
        const { editable } = this.props;

        // Check if interactive mode is off, or if the event originated from an input-like element
        if (!isInteractive || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.nodeName)) {
            return;
        }

        // Removing the toggleEditMode key from the keyConfig if the editor is not editable
        const keyConfigAdjusted = { ...this.getKeyConfig() };
        if (!editable) {
            delete keyConfigAdjusted[settings.hotKeysConfig.toggleEditMode];
        }

        const handler = keyConfigAdjusted[e.key.toLowerCase()];
        if (handler) {
            handler.call(this);
        }
    };

    removeHotKeyListener() {
        document.removeEventListener("keypress", this.handleKeyPress, true);
    }

    handleCellRepetitionsChange(e) {
        this.handleSetSetting({ [e.target.id]: parseFloat(e.target.value) });
    }

    handleSphereRadiusChange(e) {
        this.handleSetSetting({ atomRadiiScale: parseFloat(e.target.value) });
    }

    handleToggleOrthographicCamera() {
        this.WaveComponent.wave.toggleOrthographicCamera();
        this._resetStateWaveComponent();
    }

    handleToggleElementLabels() {
        this.WaveComponent.wave.toggleLabelsVisibilityByType(LABEL_TYPES.ELEMENT);
        this._resetStateWaveComponent();
    }

    handleToggleCoordinateLabels() {
        this.WaveComponent.wave.toggleLabelsVisibilityByType(LABEL_TYPES.COORDINATE);
        this._resetStateWaveComponent();
    }

    handleChemicalConnectivityFactorChange(e) {
        this.handleSetSetting({ chemicalConnectivityFactor: parseFloat(e.target.value) });
    }

    // eslint-disable-next-line class-methods-use-this
    getPrimitiveOrConventionalMaterial(material, isConventionalCellShown = false) {
        return isConventionalCellShown ? material.getACopyWithConventionalCell() : material.clone();
    }

    handleToggleConventionalCell() {
        const { isConventionalCellShown, originalMaterial } = this.state;
        this.handleResetMeasurements();
        this.setState({
            isConventionalCellShown: !isConventionalCellShown,
            originalMaterial: this.getPrimitiveOrConventionalMaterial(
                originalMaterial,
                !isConventionalCellShown,
            ),
        });
    }

    handleToggleIsViewAdjustable() {
        const {
            viewerSettings: { isViewAdjustable },
        } = this.state;
        this.handleSetSetting({ isViewAdjustable: !isViewAdjustable });
    }

    handleDownloadClick(format = "poscar") {
        // Exports the current working material, not originalMaterial (the pre-edit snapshot) -
        // otherwise a download taken after any edit silently returns the old structure (D8).
        const { material } = this.state;
        let content;
        switch (format) {
            case "poscar":
                content = material.getAsPOSCAR();
                break;
            default:
                content = JSON.stringify(material.toJSON());
        }
        exportToDisk(content, material.name, format);
    }

    handleToggleInteractive() {
        const { isInteractive } = this.state;
        this.setState({ isInteractive: !isInteractive });
    }

    handleToggleToolbarMenu(toolbarMenuName) {
        this.setState((prevState) => ({
            activeToolbarMenu:
                prevState.activeToolbarMenu === toolbarMenuName ? null : toolbarMenuName,
        }));
    }

    handleToggleBonds() {
        const { wave } = this.WaveComponent;
        wave.isDrawBondsEnabled = !wave.isDrawBondsEnabled; // toggle value;
        this._resetStateWaveComponent();
    }

    handleToggleEditMode() {
        const { isEditModeActive: wasEditModeActive } = this.state;
        const { onEditModeChanged } = this.props;
        const isEditModeActive = !wasEditModeActive;
        // Edit mode and measurement modes interpret the same clicks differently (select-atom vs.
        // measure); letting both be active at once double-handles every click (D20). Entering
        // edit mode force-disables any active measurement mode.
        if (isEditModeActive) {
            this.handleResetMeasurements();
        }
        this.setState({ isEditModeActive }, () => {
            if (this.WaveComponent && this.WaveComponent.wave) {
                this.WaveComponent.wave.enableEditMode(isEditModeActive);
            }
            if (onEditModeChanged) onEditModeChanged(isEditModeActive);
        });
    }

    /**
     * Pushes a material to the viewer via the official setStructure()/rebuildScene() path and
     * notifies the parent. Used as the setState callback for every history-affecting change
     * (edit, undo, redo) once bypassReloadViewer has already been set so WaveComponent's own
     * prop-driven reload doesn't race with it. `source` is spec Sec6.2's onEditCommit contract
     * (`drag`/`gizmo`/`coordinate-input`/`element-input`/`add`/`remove`/`clone`/`undo`/`redo`) -
     * forwarded alongside the back-compat `onUpdate` channel so a host can record history without
     * double-counting instead of having to re-infer what kind of edit just happened.
     */
    /**
     * Shows a transient hint describing the edit that just committed, then clears it. The handle is
     * retained so unmount can cancel it - an uncleared setTimeout calling setState on an unmounted
     * component is the same defect class as S-2.
     */
    _showEditHint(source) {
        this._showHint(describeEditCommit(source));
    }

    /** Shared timer behind every transient status-bar hint, edit or otherwise. */
    _showHint(text) {
        if (!text) return;
        if (this._editHintTimeout) clearTimeout(this._editHintTimeout);
        this.setState({ lastActionHint: text });
        this._editHintTimeout = setTimeout(() => {
            this._editHintTimeout = null;
            this.setState({ lastActionHint: null });
        }, EDIT_HINT_TIMEOUT_MS);
    }

    _applyMaterialToViewer(material, source) {
        const { onUpdate, onEditCommit } = this.props;
        this._showEditHint(source);
        if (this.WaveComponent && this.WaveComponent.wave) {
            this.WaveComponent.wave.bypassReloadViewer = false;
            this.WaveComponent.wave.setStructure(material);
            this.WaveComponent.wave.rebuildScene();
        }
        if (onUpdate) {
            onUpdate(material);
        }
        if (onEditCommit) {
            onEditCommit(material, { source });
        }
    }

    handleStructureModified(newMaterial, source) {
        const { material, historyStack, historyPointer } = this.state;
        if (this.WaveComponent && this.WaveComponent.wave) {
            this.WaveComponent.wave.bypassReloadViewer = true;
        }

        newMaterial.lattice = {
            ...newMaterial.Lattice.toJSON(),
            type: material.Lattice.type,
        };

        const clonedMaterial = newMaterial.clone();
        const newStack = historyStack.slice(0, historyPointer + 1);
        newStack.push(clonedMaterial);

        // Every entry is a full Material clone, so an unbounded stack grows without limit for
        // as long as the session lasts - material to worry about on structures with thousands
        // of atoms. Drop the oldest entries past the cap; the pointer moves with them.
        const overflow = Math.max(0, newStack.length - MAX_HISTORY_ENTRIES);
        const cappedStack = overflow ? newStack.slice(overflow) : newStack;

        this.setState(
            {
                material: clonedMaterial,
                historyStack: cappedStack,
                historyPointer: cappedStack.length - 1,
            },
            () => this._applyMaterialToViewer(clonedMaterial, source),
        );
    }

    handleUndo() {
        const { historyStack, historyPointer } = this.state;
        if (historyPointer <= 0) return;

        const previousPointer = historyPointer - 1;
        const previousMaterial = historyStack[previousPointer];

        if (this.WaveComponent && this.WaveComponent.wave) {
            this.WaveComponent.wave.bypassReloadViewer = true;
        }
        this.setState(
            {
                material: previousMaterial,
                historyPointer: previousPointer,
            },
            () => this._applyMaterialToViewer(previousMaterial, "undo"),
        );
    }

    handleRedo() {
        const { historyStack, historyPointer } = this.state;
        if (historyPointer >= historyStack.length - 1) return;

        const nextPointer = historyPointer + 1;
        const nextMaterial = historyStack[nextPointer];

        if (this.WaveComponent && this.WaveComponent.wave) {
            this.WaveComponent.wave.bypassReloadViewer = true;
        }
        this.setState(
            {
                material: nextMaterial,
                historyPointer: nextPointer,
            },
            () => this._applyMaterialToViewer(nextMaterial, "redo"),
        );
    }

    /**
     * Public, ref-accessible undo-availability check (part of the host embedding API - a host
     * can drive undo/redo via a ref to this component instead of only through this toolbar).
     */
    canUndo() {
        const { historyPointer } = this.state;
        return historyPointer > 0;
    }

    canRedo() {
        const { historyStack, historyPointer } = this.state;
        return historyPointer < historyStack.length - 1;
    }

    /**
     * Spec §6.3's documented ref API names these undo()/redo() (canUndo/canRedo already matched);
     * thin aliases so `ref.current.undo()` works as documented instead of only the internal
     * handleUndo/handleRedo names.
     */
    undo() {
        this.handleUndo();
    }

    redo() {
        this.handleRedo();
    }

    /**
     * Commits a single axis of the selected atom's coordinate. Only called once per field edit
     * (on blur/Enter, via handleCoordinateCommit below) rather than per keystroke, so this is
     * naturally one history entry per edit (D18). Mutates a clone's basis in place via
     * Basis/setBasis rather than reconstructing via fromElementsAndCoordinates, so labels and
     * constraints on every atom (including the one being edited) survive untouched (D7). Only
     * meaningful for exactly one selected atom - the coordinate panel itself is hidden for 0 or
     * 2+ selected (see renderEditSurface), so this is a defensive guard, not the primary gate.
     */
    handleCoordinateChange(axisIndex, value) {
        const { selectedAtomIndices, material } = this.state;
        if (selectedAtomIndices.length !== 1) return;
        const [selectedAtomIndex] = selectedAtomIndices;

        const floatValue = parseFloat(value);
        if (Number.isNaN(floatValue)) return;

        const newMaterial = material.clone();
        const basis = newMaterial.Basis;
        const { coordinates } = basis;
        if (!coordinates[selectedAtomIndex]) return;

        const currentValue = coordinates[selectedAtomIndex].value;
        const updatedValue = [...currentValue];
        updatedValue[axisIndex] = floatValue;
        coordinates[selectedAtomIndex] = { ...coordinates[selectedAtomIndex], value: updatedValue };
        basis.coordinates = coordinates;
        newMaterial.setBasis(basis.toJSON());

        // Fast in-place scene update for immediate visual feedback before state propagates.
        // Three.js mesh positions are always Cartesian, so this only makes sense when the
        // material's own coordinates are too; for crystal-unit materials, skip straight to the
        // full rebuild below rather than briefly snapping the mesh to the wrong (fractional) spot.
        if (basis.units === "cartesian" && this.WaveComponent?.wave?.selectedMesh_) {
            this.WaveComponent.wave.selectedMesh_.position.setComponent(axisIndex, floatValue);
            this.WaveComponent.wave.render();
        }

        this.handleStructureModified(newMaterial, "coordinate-input");
    }

    /**
     * Updates only the local draft string for one coordinate field while it's focused - no
     * commit, no history entry, no scene rebuild. Lets the field be cleared or start with "-"
     * without the browser's number-input semantics dropping the keystroke (D18).
     */
    handleCoordinateDraftChange(axisIndex, value) {
        this.setState((prevState) => {
            const coordinateDrafts = [...prevState.coordinateDrafts];
            coordinateDrafts[axisIndex] = value;
            return { coordinateDrafts };
        });
    }

    /**
     * Commits the draft for one coordinate field (on blur/Enter) if it parses to a real number,
     * then clears the draft so the field reverts to showing the committed value.
     */
    handleCoordinateCommit(axisIndex) {
        const { coordinateDrafts } = this.state;
        const draftValue = coordinateDrafts[axisIndex];
        if (draftValue !== null && draftValue !== "" && !Number.isNaN(parseFloat(draftValue))) {
            this.handleCoordinateChange(axisIndex, draftValue);
        }
        this.setState((prevState) => {
            const nextDrafts = [...prevState.coordinateDrafts];
            nextDrafts[axisIndex] = null;
            return { coordinateDrafts: nextDrafts };
        });
    }

    /**
     * Selection changes are a visual-only, wave-internal concern (highlight + gizmo, already
     * handled inside the mixin) - the only reason React needs to know the indices at all is to
     * drive the coordinate panel/toolbar. Without the bypass guard, this setState triggers a
     * WaveComponent re-render with a freshly cloned structure prop, which componentDidUpdate
     * sees as "changed" and reloads/rebuilds the entire scene on every single click or hover-driven
     * selection - orphaning an in-progress drag's mesh reference (D3) and making selection
     * sluggish on larger structures (R17).
     *
     * indices is an array of atomicIndex (D-4: multi-select) - empty for none, one entry for a
     * single atom, 2+ for a group selection.
     */
    handleSelectionChanged(indices) {
        const { activeTransformMode } = this.state;
        const { onSelectionChanged } = this.props;
        if (this.WaveComponent?.wave) {
            this.WaveComponent.wave.bypassReloadViewer = true;
        }
        if (onSelectionChanged) onSelectionChanged(indices);
        // Rotate only makes sense for a group (it spins the selection about its centroid) - if
        // the selection drops below 2 while rotate is active (e.g. a Shift-click deselect, or
        // Delete removing atoms down to one), fall back to translate rather than leaving the
        // toolbar showing a mode the gizmo can no longer meaningfully perform.
        const nextTransformMode =
            activeTransformMode === "rotate" && indices.length < 2 ? "translate" : null;
        this.setState(
            {
                selectedAtomIndices: indices,
                coordinateDrafts: [null, null, null],
                elementDraft: null,
                ...(nextTransformMode ? { activeTransformMode: nextTransformMode } : {}),
            },
            () => {
                if (nextTransformMode && this.WaveComponent?.wave) {
                    this.WaveComponent.wave.setTransformMode(nextTransformMode);
                }
                if (this.WaveComponent?.wave) {
                    this.WaveComponent.wave.bypassReloadViewer = false;
                }
            },
        );
    }

    handleSetTransformMode(mode) {
        this.setState({ activeTransformMode: mode });
        if (this.WaveComponent?.wave) {
            this.WaveComponent.wave.setTransformMode(mode);
        }
    }

    /**
     * Places a new atom at the true center of the cell - (a+b+c)/2, the vector sum of the three
     * lattice vectors halved - not the component-wise (ax/2, by/2, cz/2), which lands off-center
     * or outside the cell entirely for non-orthogonal lattices (D22). If that position is
     * already occupied (e.g. a second click with nothing else changed), nudges the candidate
     * along the diagonal until it clears every existing atom by OCCUPIED_TOLERANCE, so repeated
     * clicks don't silently stack coincident duplicates.
     */
    handleAddAtom() {
        const { material } = this.state;
        const { editSessionOptions } = this.props;
        if (!this.WaveComponent?.wave || !material?.Lattice?.unitCell) return;

        const {
            ax = 0,
            ay = 0,
            az = 0,
            bx = 0,
            by = 0,
            bz = 0,
            cx = 0,
            cy = 0,
            cz = 0,
        } = material.Lattice.unitCell;
        const trueCenter = [(ax + bx + cx) / 2, (ay + by + cy) / 2, (az + bz + cz) / 2];

        const basis = material.Basis;
        basis.toCartesian();
        const existingPositions = basis.coordinatesAsArray;

        const OCCUPIED_TOLERANCE = 0.5; // Å; below any realistic bond length
        const OFFSET_STEP = [0.3, 0.3, 0.3];
        const MAX_OFFSET_ATTEMPTS = 10;
        const isOccupied = (position) =>
            existingPositions.some((existing) => {
                const dx = existing[0] - position[0];
                const dy = existing[1] - position[1];
                const dz = existing[2] - position[2];
                return Math.sqrt(dx * dx + dy * dy + dz * dz) < OCCUPIED_TOLERANCE;
            });

        const candidate = [...trueCenter];
        let attempts = 0;
        while (isOccupied(candidate) && attempts < MAX_OFFSET_ATTEMPTS) {
            attempts += 1;
            for (let axis = 0; axis < 3; axis += 1) {
                candidate[axis] = trueCenter[axis] + OFFSET_STEP[axis] * attempts;
            }
        }

        const element = editSessionOptions?.defaultElement || "Si";
        this.WaveComponent.wave.addAtom(element, candidate);
    }

    handleRemoveSelectedAtom() {
        if (this.WaveComponent?.wave) {
            this.WaveComponent.wave.removeSelectedAtom();
        }
    }

    handleCloneSelectedAtoms() {
        if (this.WaveComponent?.wave) {
            this.WaveComponent.wave.cloneSelectedAtoms();
        }
    }

    handleFocusCameraOnSelection() {
        if (this.WaveComponent?.wave) {
            this.WaveComponent.wave.focusCameraOnSelection();
        }
    }

    /**
     * Updates only the local draft string for the element field while it's focused - no commit,
     * no history entry, no scene rebuild. Mirrors handleCoordinateDraftChange (D18).
     */
    handleElementDraftChange(value) {
        this.setState({ elementDraft: value });
    }

    /**
     * Commits the element draft (on blur/Enter) if it names a real element that differs from the
     * current one, then clears the draft so the field reverts to showing the committed value.
     * Operates directly on state.material like handleCoordinateChange, rather than through the
     * mixin - this is a panel-typed edit, not a scene-gesture-driven one. Symbol casing is
     * normalized (e.g. "si"/"SI" -> "Si") so the field isn't case-sensitive to use, then checked
     * against PERIODIC_TABLE so a typo silently reverts instead of writing a bogus element.
     */
    handleElementCommit() {
        const { elementDraft, selectedAtomIndices, material } = this.state;
        if (elementDraft !== null) {
            const trimmed = elementDraft.trim();
            const symbol = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();

            if (selectedAtomIndices.length === 1 && symbol in PERIODIC_TABLE) {
                const [selectedAtomIndex] = selectedAtomIndices;
                const basis = material.Basis;
                const { elements } = basis;
                const currentEntry = elements[selectedAtomIndex];
                const currentSymbol =
                    typeof currentEntry === "string" ? currentEntry : currentEntry?.value;
                if (currentEntry && currentSymbol !== symbol) {
                    const newMaterial = material.clone();
                    const newBasis = newMaterial.Basis;
                    const newElements = newBasis.elements;
                    newElements[selectedAtomIndex] = {
                        ...newElements[selectedAtomIndex],
                        value: symbol,
                    };
                    newBasis.elements = newElements;
                    newMaterial.setBasis(newBasis.toJSON());
                    this.handleStructureModified(newMaterial, "element-input");
                }
            }
        }
        this.setState({ elementDraft: null });
    }

    // TODO: reset the colors for other buttons in the panel on call to the function below
    handleResetViewer() {
        this.WaveComponent.initViewer();
        this._resetStateWaveComponent();
    }

    handleTakeScreenshot() {
        this.WaveComponent.wave.takeScreenshot();
    }

    handleToggleOrbitControls() {
        this.WaveComponent.wave.toggleOrbitControls();
        this._resetStateWaveComponent();
    }

    handleToggleOrbitControlsAnimation() {
        this.WaveComponent.wave.toggleOrbitControlsAnimation();
        this._resetStateWaveComponent();
    }

    handleToggleAxes() {
        this.WaveComponent.wave.toggleAxes();
        this._resetStateWaveComponent();
    }

    _getWaveProperty(name) {
        return this.WaveComponent && this.WaveComponent.wave[name];
    }

    handleSetState(newState) {
        this.setState(newState);
    }

    handleSetMeasurementSettingsForTypeInState(newMeasurementSettingsForType) {
        const { measurementsSettings } = this.state;
        const measurementSettingsHandler = new MeasurementSettingsHandler(measurementsSettings);
        measurementSettingsHandler.updateMeasurementSettingsByType(newMeasurementSettingsForType);
        const newMeasurementsSettings = measurementSettingsHandler.measurementsSettings;
        this.setState({ measurementsSettings: newMeasurementsSettings });
    }

    handleDeleteConnection() {
        this.WaveComponent.wave.deleteConnection();
    }

    handleResetMeasurements() {
        if (this.WaveComponent?.wave) {
            this.WaveComponent.wave.resetAllMeasurements();
        }
    }

    handleToggleMeasurement(measurementMode) {
        this.WaveComponent.wave.toggleMeasurementByType(
            measurementMode,
            this.handleSetMeasurementSettingsForTypeInState,
        );
        const newMeasurementsSettings = this.WaveComponent.wave.getMeasurementsSettings();
        this.setState({ measurementsSettings: newMeasurementsSettings });

        // Mirror of the edit-mode-entry guard in handleToggleEditMode (D20): activating a
        // measurement mode force-exits edit mode.
        const { isEditModeActive } = this.state;
        const measurementsSettingsHandler = new MeasurementSettingsHandler(newMeasurementsSettings);
        const isAnyMeasurementActive = [
            MEASUREMENT_MODES.DISTANCE,
            MEASUREMENT_MODES.ANGLE,
            MEASUREMENT_MODES.COORDINATE,
        ].some((mode) => measurementsSettingsHandler.isMeasurementActiveByType(mode));
        if (isAnyMeasurementActive && isEditModeActive) {
            this.handleToggleEditMode();
        }
    }

    handleViewerError(error) {
        // Keep the message rather than only the fact of failure: a blank canvas with no reason is
        // exactly what F8 was about.
        this.setState({ viewerError: error?.message || String(error) });
    }

    handleRetryViewer() {
        const { viewerResetKey } = this.state;
        this.setState({ viewerError: null, viewerResetKey: viewerResetKey + 1 });
    }

    /**
     * Which overlay state the canvas is in, or null for "showing a structure". Error wins over
     * empty: if the build threw, the atom count is not evidence of anything.
     */
    getViewerStatusKind() {
        const { viewerError, material } = this.state;
        if (viewerError) return "error";
        if (!material) return "empty";
        const atomCount = material.basis?.elements?.length;
        if (!atomCount) return "empty";
        return null;
    }

    /**
     * Points the camera down a lattice vector. Reset View was the only camera command the viewer
     * had (F12); axis views are a primary control in VESTA and CrystalMaker.
     */
    handleViewAlongAxis(axis) {
        this.WaveComponent?.wave?.setCameraAlongCellVector?.(axis);
    }

    handleToggleKeyboardSheet() {
        const { isKeyboardSheetOpen } = this.state;
        this.setState({ isKeyboardSheetOpen: !isKeyboardSheetOpen });
    }

    handleCloseKeyboardSheet() {
        this.setState({ isKeyboardSheetOpen: false });
    }

    handleOpenFigureExport() {
        this.setState({ isFigureExportOpen: true });
    }

    handleCloseFigureExport() {
        this.setState({ isFigureExportOpen: false });
    }

    /**
     * Renders and downloads a figure (U-12).
     *
     * Reported either way through the status bar's live region. A download is one of the few actions
     * with no visible effect inside the app at all - the browser may put the file somewhere the user
     * never sees - and an over-large request can exhaust the GL context, where "nothing happened" is
     * the least useful possible outcome. Deliberately not routed through handleViewerError: the
     * viewer is still fine, and blanking it behind an error card would be a worse lie than the
     * failure itself.
     */
    handleExportFigure(options) {
        try {
            const fileName = this.WaveComponent.wave.exportFigure(options);
            this._showHint(`Saved ${fileName}`);
        } catch (error) {
            this._showHint(`Figure export failed: ${error?.message || error}`);
        }
    }

    /**
     * Canvas size in pixels, for the export dialog's "On-screen" preset and to keep every other
     * preset at the canvas aspect ratio. Zeroes are a valid answer (a not-yet-measured container);
     * getFigureResolution falls back to 4:3 rather than dividing by zero.
     */
    getViewportSize() {
        const wave = this.WaveComponent?.wave;
        return { width: wave?.WIDTH || 0, height: wave?.HEIGHT || 0 };
    }

    /** GL-reported render limit, or undefined so the dialog uses its own conservative default. */
    getMaxFigureDimension() {
        return this.WaveComponent?.wave?.getMaxFigureDimension?.();
    }

    handleDisplayUnitsChange(displayUnits) {
        this.setState({ displayUnits });
    }

    /**
     * The selected atom's coordinates expressed in `displayUnits`, or null when that is already the
     * material's own unit (in which case the stored values are shown as-is).
     *
     * Converts the single touched point through `basis.cell`, the same primitive the delta-based
     * edit path uses - never `Basis.toCartesian()/toCrystal()`, which rewrites every atom.
     */
    getDisplayCoordinates() {
        const { material, selectedAtomIndices, displayUnits } = this.state;
        if (selectedAtomIndices.length !== 1 || !displayUnits) return null;
        const nativeUnits = material?.basis?.units === "cartesian" ? "cartesian" : "crystal";
        if (displayUnits === nativeUnits) return null;
        const point = material?.basis?.coordinates?.[selectedAtomIndices[0]]?.value;
        if (!Array.isArray(point)) return null;
        try {
            const { cell } = material.Basis;
            return displayUnits === "cartesian"
                ? cell.convertPointToCartesian([...point])
                : cell.convertPointToCrystal([...point]);
        } catch (error) {
            // A cell that cannot convert is not worth breaking the panel over; fall back to
            // showing the stored values.
            return null;
        }
    }

    /**
     * The armed measurement mode, or null. Read straight off the state the managers already push
     * through updateState on every click, so the mode pill and the status-bar readout follow the
     * measurement without any new callback out of the mixin.
     */
    getActiveMeasurement() {
        const { measurementsSettings } = this.state;
        return new MeasurementSettingsHandler(measurementsSettings).getActiveMeasurement();
    }

    /**
     * Element symbol of the single selected atom, or "" for none/multiple. The status bar and the
     * edit panel both need it, and the basis stores an element as either a bare symbol or a
     * `{ value }` cell depending on the fixture - hence the shared normalizer.
     */
    getSelectedElementSymbol() {
        const { selectedAtomIndices, material } = this.state;
        if (selectedAtomIndices.length !== 1) return "";
        const [index] = selectedAtomIndices;
        return normalizeElement(material?.basis?.elements?.[index]);
    }

    /**
     * Selects every atom of one element - the status bar's composition chips double as a
     * select-all control. Routed through the mixin's reselectAtomsByIndices so it goes through
     * the same single source of truth for onSelectionChanged as every other selection path.
     */
    handleSelectElement(elementSymbol) {
        const wave = this.WaveComponent?.wave;
        const { material } = this.state;
        if (!wave?.reselectAtomsByIndices) return;
        const elements = material?.basis?.elements;
        if (!Array.isArray(elements)) return;
        const indices = elements.reduce((accumulated, entry, index) => {
            if (normalizeElement(entry) === elementSymbol) accumulated.push(index);
            return accumulated;
        }, []);
        if (!indices.length) return;
        wave.reselectAtomsByIndices(indices);
        wave.render();
    }

    /**
     * Returns a cover div to cover the area and prevent user interaction with component
     */
    renderCoverDiv() {
        const style = {
            position: "absolute",
            height: "100%",
            width: "100%",
        };
        const { isInteractive } = this.state;
        if (isInteractive) style.display = "none";
        return <div className="atom-view-cover" style={style} />;
    }

    renderWaveComponent() {
        const {
            isConventionalCellShown,
            viewerSettings,
            viewerTriggerResize,
            boundaryConditions,
            material,
        } = this.state;
        const materialCopy = this.getPrimitiveOrConventionalMaterial(
            material,
            isConventionalCellShown,
        );
        const isDrawBondsEnabled = this._getWaveProperty("isDrawBondsEnabled") || false;
        return (
            <WaveComponent
                ref={(el) => {
                    this.WaveComponent = el;
                }}
                triggerHandleResize={viewerTriggerResize}
                isConventionalCellShown={isConventionalCellShown}
                isDrawBondsEnabled={isDrawBondsEnabled}
                isViewAdjustable={viewerSettings.isViewAdjustable}
                structure={materialCopy}
                boundaryConditions={boundaryConditions}
                cell={materialCopy.Lattice.unitCell}
                name={materialCopy.name}
                settings={{
                    ...viewerSettings,
                    onStructureModified: this.handleStructureModified,
                    onSelectionChanged: this.handleSelectionChanged,
                }}
            />
        );
    }

    // TODO: move in the toolbar component when it's created
    /**
     * On/off state for a menu toggle, plus its hotkey in a fixed slot. Replaces the previous
     * grey-checkmark-means-off rendering, which used one shape for both answers (F2), and takes
     * the key out of the label text so every row advertises it the same way (F3).
     */
    // eslint-disable-next-line class-methods-use-this
    getToggleIndicator(isActive, hotKey) {
        return <ToggleIndicator isActive={Boolean(isActive)} hotKey={hotKey} />;
    }

    getViewSettingsActions = () => {
        const { viewerSettings, isConventionalCellShown } = this.state;
        const areLabelsVisibleByType = (type) =>
            this.WaveComponent?.wave?.areLabelsVisibleByType(type);
        return [
            {
                id: "rotate-zoom",
                disabled: false,
                content: "Rotate/Zoom",
                leftIcon: <ThreeDRotation />,
                rightIcon: this.getToggleIndicator(
                    this._getWaveProperty("areOrbitControlsEnabled"),
                    settings.hotKeysConfig.toggleOrbitControls,
                ),
                onClick: this.handleToggleOrbitControls,
                shouldMenuStayOpened: true,
            },
            {
                id: "auto-rotate",
                disabled: false,
                content: "Auto Rotate",
                leftIcon: <Autorenew />,
                rightIcon: this.getToggleIndicator(
                    this._getWaveProperty("isOrbitControlsAnimationEnabled"),
                ),
                onClick: this.handleToggleOrbitControlsAnimation,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-axes",
                disabled: false,
                content: "Axes",
                leftIcon: <GpsFixed />,
                rightIcon: this.getToggleIndicator(this._getWaveProperty("areAxesEnabled")),
                onClick: this.handleToggleAxes,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-camera",
                disabled: false,
                content: "Orthographic Camera",
                leftIcon: <SwitchCamera />,
                rightIcon: this.getToggleIndicator(this._getWaveProperty("isCameraOrthographic")),
                onClick: this.handleToggleOrthographicCamera,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-bonds",
                disabled: false,
                content: "Bonds",
                leftIcon: <Dehaze />,
                rightIcon: this.getToggleIndicator(
                    this._getWaveProperty("isDrawBondsEnabled"),
                    settings.hotKeysConfig.toggleBonds,
                ),
                onClick: this.handleToggleBonds,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-cell",
                disabled: false,
                content: "Conventional Cell",
                leftIcon: <FormatShapes />,
                rightIcon: this.getToggleIndicator(isConventionalCellShown),
                onClick: this.handleToggleConventionalCell,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-element-labels",
                disabled: false,
                content: "Elements",
                leftIcon: <Spellcheck />,
                rightIcon: this.getToggleIndicator(
                    areLabelsVisibleByType && areLabelsVisibleByType("element"),
                    settings.hotKeysConfig.toggleElementLabels,
                ),
                onClick: this.handleToggleElementLabels,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-coordinate-labels",
                disabled: false,
                content: "Coordinates",
                leftIcon: <Spellcheck />,
                rightIcon: this.getToggleIndicator(
                    areLabelsVisibleByType && areLabelsVisibleByType("coordinate"),
                    settings.hotKeysConfig.toggleCoordinateLabels,
                ),
                onClick: this.handleToggleCoordinateLabels,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-view-adjustment",
                disabled: false,
                content: "Auto-center on change",
                leftIcon: <ControlCameraRounded />,
                rightIcon: this.getToggleIndicator(viewerSettings.isViewAdjustable),
                onClick: this.handleToggleIsViewAdjustable,
                shouldMenuStayOpened: true,
            },
            {
                id: "divider-camera",
                isDivider: true,
            },
            ...[
                { axis: "a", label: "View along a" },
                { axis: "b", label: "View along b" },
                { axis: "c", label: "View along c" },
                { axis: "111", label: "View along [111]" },
            ].map(({ axis, label }) => ({
                id: `view-along-${axis}`,
                disabled: false,
                content: label,
                leftIcon: <CameraAlt />,
                onClick: () => this.handleViewAlongAxis(axis),
                shouldMenuStayOpened: true,
            })),
            {
                id: "divider-2",
                isDivider: true,
            },
            {
                id: "reset-view",
                disabled: false,
                content: "Reset View",
                leftIcon: <Replay />,
                onClick: this.handleResetViewer,
                shouldMenuStayOpened: true,
            },
        ];
    };

    getMeasurementsActions = () => {
        const { measurementsSettings } = this.state;
        const measurementsSettingsHandler = new MeasurementSettingsHandler(measurementsSettings);
        return [
            {
                id: "Distances",
                content: "Distances",
                rightIcon: this.getToggleIndicator(
                    measurementsSettingsHandler.isMeasurementActiveByType(
                        MEASUREMENT_MODES.DISTANCE,
                    ),
                    settings.hotKeysConfig.toggleDistanceShown,
                ),
                leftIcon: <HeightIcon />,
                onClick: () => this.handleToggleMeasurement(MEASUREMENT_MODES.DISTANCE),
                shouldMenuStayOpened: true,
            },
            {
                id: "Angles",
                content: "Angles",
                rightIcon: this.getToggleIndicator(
                    measurementsSettingsHandler.isMeasurementActiveByType(MEASUREMENT_MODES.ANGLE),
                    settings.hotKeysConfig.toggleAnglesShown,
                ),
                leftIcon: <LooksIcon />,
                onClick: () => this.handleToggleMeasurement(MEASUREMENT_MODES.ANGLE),
                shouldMenuStayOpened: true,
            },
            {
                id: "Coordinates",
                content: "Copy Coordinates",
                rightIcon: this.getToggleIndicator(
                    measurementsSettingsHandler.isMeasurementActiveByType(
                        MEASUREMENT_MODES.COORDINATE,
                    ),
                    settings.hotKeysConfig.toggleCopyCoordinatesShown,
                ),
                leftIcon: <GpsFixed />,
                onClick: () => this.handleToggleMeasurement(MEASUREMENT_MODES.COORDINATE),
                shouldMenuStayOpened: true,
            },
            {
                id: "Delete",
                content: "Delete connection",
                leftIcon: <DeleteIcon />,
                onClick: this.handleDeleteConnection,
                shouldMenuStayOpened: true,
            },
            {
                id: "divider-actions",
                isDivider: true,
            },
            {
                id: "Reset measurements",
                content: "Reset measurements",
                leftIcon: <Replay />,
                onClick: this.handleResetMeasurements,
                shouldMenuStayOpened: true,
            },
        ];
    };

    getExportActions = () => {
        const downloadActions = [
            {
                id: "JSON",
                title: "JSON",
                content: "JSON",
                leftIcon: <Article />,
                onClick: () => this.handleDownloadClick("json"),
            },
            {
                id: "POSCAR",
                title: "POSCAR",
                content: "POSCAR",
                leftIcon: <Article />,
                onClick: () => this.handleDownloadClick("poscar"),
            },
        ];
        return [
            {
                id: "StartGif",
                title: "Auto Rotate GIF",
                content: "Auto Rotate GIF",
                leftIcon: <PictureInPicture />,
                onClick: () => this.handleStartGifRecording(),
            },
            {
                id: "Screenshot",
                title: "Screenshot",
                content: "Screenshot",
                leftIcon: <PictureInPicture />,
                onClick: this.handleTakeScreenshot,
            },
            {
                // Kept alongside Screenshot rather than replacing it: one-click capture of exactly
                // what is on screen is still the common case, and a dialog in front of it would be
                // a tax on it. This is the publication case (U-12) - chosen resolution, chosen
                // background, scale bar - which the canvas readback structurally cannot do.
                id: "Figure",
                title: "Export figure",
                content: "Figure (PNG)…",
                leftIcon: <Image />,
                onClick: this.handleOpenFigureExport,
            },
            {
                id: "Download",
                title: "Download",
                content: "Download",
                leftIcon: <CloudDownload />,
                actions: downloadActions,
                paperPlacement: "right-start",
            },
        ];
    };

    getParametersActions = () => {
        const { viewerSettings, material } = this.state;
        return (
            <ParametersMenu
                viewerSettings={viewerSettings}
                // Lets the menu state what a repetition will cost instead of leaving the user to
                // discover it by waiting (F7).
                atomCountInCell={material?.basis?.elements?.length || 0}
                // One value-based callback in place of three event-shaped ones: sliders report a
                // value, not an event, and handleSetSetting already takes a settings patch.
                onSettingChange={this.handleSetSetting}
            />
        );
    };

    /**
     * The View items people flip repeatedly rather than set once, promoted out of a dropdown that
     * closes on every choice (U-7). Same state and same handlers as the menu entries - this is a
     * shortcut, not a move, so the menu keeps working exactly as before.
     */
    getQuickToggleItems() {
        const areLabelsVisibleByType = (type) =>
            this.WaveComponent?.wave?.areLabelsVisibleByType?.(type);
        const keys = settings.hotKeysConfig;
        return [
            {
                id: "bonds",
                title: "Bonds",
                hotKey: keys.toggleBonds,
                isActive: Boolean(this._getWaveProperty("isDrawBondsEnabled")),
                icon: <Dehaze />,
                onToggle: this.handleToggleBonds,
            },
            {
                id: "element-labels",
                title: "Element labels",
                hotKey: keys.toggleElementLabels,
                isActive: Boolean(areLabelsVisibleByType && areLabelsVisibleByType("element")),
                icon: <Spellcheck />,
                onToggle: this.handleToggleElementLabels,
            },
            {
                id: "axes",
                title: "Axes",
                isActive: Boolean(this._getWaveProperty("areAxesEnabled")),
                icon: <GpsFixed />,
                onToggle: this.handleToggleAxes,
            },
            {
                id: "orthographic",
                title: "Orthographic camera",
                isActive: Boolean(this._getWaveProperty("isCameraOrthographic")),
                icon: <SwitchCamera />,
                onToggle: this.handleToggleOrthographicCamera,
            },
            {
                id: "orbit",
                title: "Rotate / zoom",
                hotKey: keys.toggleOrbitControls,
                isActive: Boolean(this._getWaveProperty("areOrbitControlsEnabled")),
                icon: <ThreeDRotation />,
                onToggle: this.handleToggleOrbitControls,
            },
        ];
    }

    getToolbarConfig() {
        const toolbarConfig = [
            {
                id: "View",
                title: "View",
                header: "View",
                leftIcon: <RemoveRedEye />,
                actions: this.getViewSettingsActions(),
                onClick: () => this.handleToggleToolbarMenu("view-settings"),
            },
            {
                id: "Parameters",
                title: "Parameters",
                header: "Parameters",
                leftIcon: <Settings />,
                contentObject: this.getParametersActions(),
                onClick: () => this.handleToggleToolbarMenu("parameters"),
            },
            {
                id: "measurements",
                title: "Measurements",
                header: "Measurements",
                leftIcon: <SquareFootIcon />,
                actions: this.getMeasurementsActions(),
                onClick: () => this.handleToggleToolbarMenu("measurements"),
            },
            {
                id: "Export",
                title: "Export",
                header: "Export",
                leftIcon: <ImportExport />,
                actions: this.getExportActions(),
                onClick: () => this.handleToggleToolbarMenu("export"),
            },
        ];

        const { editable } = this.props;
        const { isEditModeActive } = this.state;

        // History outlives edit mode (F6), so undo/redo need to be reachable outside it. Inside
        // edit mode the edit toolbar already carries them, so they are not duplicated here.
        if (!isEditModeActive && (this.canUndo() || this.canRedo())) {
            toolbarConfig.push(
                {
                    id: "Undo",
                    title: "Undo",
                    leftIcon: <Undo />,
                    disabled: !this.canUndo(),
                    onClick: this.handleUndo,
                },
                {
                    id: "Redo",
                    title: "Redo",
                    leftIcon: <Redo />,
                    disabled: !this.canRedo(),
                    onClick: this.handleRedo,
                },
            );
        }

        if (editable) {
            toolbarConfig.splice(4, 0, {
                id: "3DEdit",
                title: isEditModeActive
                    ? "Exit Edit"
                    : `Edit [${settings.hotKeysConfig.toggleEditMode.toUpperCase()}]`,
                leftIcon: <Edit color={isEditModeActive ? "primary" : "inherit"} />,
                onClick: this.handleToggleEditMode,
            });
        }

        return toolbarConfig;
    }

    async handleStartGifRecording(downloadPath, rotationSpeed = 60, frameDuration = 0.05) {
        await this.WaveComponent.wave.takeGifScreenshot({
            downloadPath,
            rotationSpeed,
            frameDuration,
        });
        console.log("Recorded gif");
    }

    /**
     * The edit surface: an icon strip of tools plus a selection inspector, side by side.
     *
     * The container is bounded top and bottom (`bottom` clears the status bar) and the inspector
     * scrolls inside it. That is the structural half of the F1 fix - the previous single 84 px
     * column was ~600 px tall with no scroll, so on a short viewer the coordinate fields were cut
     * off and unreachable rather than merely cramped.
     */
    renderEditSurface() {
        const {
            activeTransformMode,
            selectedAtomIndices,
            material,
            coordinateDrafts,
            elementDraft,
            displayUnits,
        } = this.state;
        const { editSessionOptions } = this.props;
        const [selectedAtomIndex] = selectedAtomIndices;

        let selectedCoordinates = [0, 0, 0];
        if (selectedAtomIndices.length === 1) {
            const selectedAtom = material?.basis?.coordinates?.[selectedAtomIndex];
            if (selectedAtom) {
                selectedCoordinates = Array.isArray(selectedAtom)
                    ? selectedAtom
                    : selectedAtom.value || selectedAtom;
            }
        }
        const selectedElement = this.getSelectedElementSymbol();
        const elementColor = selectedElement
            ? settings.elementColors?.[selectedElement] || settings.defaultColor
            : settings.defaultColor;

        return (
            <Stack
                direction="row"
                spacing={1}
                alignItems="flex-start"
                justifyContent="flex-end"
                sx={{
                    position: "absolute",
                    top: "1em",
                    right: "1em",
                    left: "1em",
                    // Clears the status bar, so neither surface can ever sit under the other.
                    bottom: "3em",
                    pointerEvents: "none",
                    "& > *": { pointerEvents: "auto" },
                }}
            >
                <SelectionInspector
                    selectedAtomIndices={selectedAtomIndices}
                    selectedElement={selectedElement}
                    selectedCoordinates={selectedCoordinates}
                    materialUnits={material?.basis?.units}
                    displayUnits={displayUnits}
                    displayCoordinates={this.getDisplayCoordinates()}
                    elementColor={elementColor}
                    coordinateDrafts={coordinateDrafts}
                    elementDraft={elementDraft}
                    onDisplayUnitsChange={this.handleDisplayUnitsChange}
                    onCoordinateDraftChange={this.handleCoordinateDraftChange}
                    onCoordinateCommit={this.handleCoordinateCommit}
                    onElementDraftChange={this.handleElementDraftChange}
                    onElementCommit={this.handleElementCommit}
                />
                <EditToolbar
                    activeTransformMode={activeTransformMode}
                    selectedCount={selectedAtomIndices.length}
                    defaultElement={editSessionOptions?.defaultElement || "Si"}
                    canUndo={this.canUndo()}
                    canRedo={this.canRedo()}
                    onSetTransformMode={this.handleSetTransformMode}
                    onAddAtom={this.handleAddAtom}
                    onCloneSelected={this.handleCloneSelectedAtoms}
                    onRemoveSelected={this.handleRemoveSelectedAtom}
                    onFocusCamera={this.handleFocusCameraOnSelection}
                    onUndo={this.handleUndo}
                    onRedo={this.handleRedo}
                />
            </Stack>
        );
    }

    renderViewerWithToolbars() {
        const {
            isInteractive,
            isEditModeActive,
            material,
            selectedAtomIndices,
            isKeyboardSheetOpen,
            isFigureExportOpen,
            viewerError,
            viewerResetKey,
            lastActionHint,
        } = this.state;
        const { editable } = this.props;
        const activeMeasurement = this.getActiveMeasurement();
        const viewportSize = this.getViewportSize();
        // Every surface that drives the wave instance is gated on this, not just on
        // isInteractive: after a caught render failure this.WaveComponent is null, and most
        // handlers dereference it unguarded, so a click would throw from an event handler where
        // no error boundary can catch it. The status bar is exempt - it only reads the material.
        const isViewerUsable = isInteractive && !viewerError;

        return (
            <div className="wave-component-holder" style={{ position: "relative", height: "100%" }}>
                {this.renderCoverDiv()}
                <IconsToolbar
                    toolbarConfig={this.getToolbarConfig()}
                    // A failed viewer leaves this.WaveComponent null, and most menu handlers
                    // dereference it without a guard - so a click after an error would throw
                    // again, this time from an event handler where no boundary can catch it.
                    // IconsToolbar already hides everything but the power button when not
                    // interactive, which is exactly the reachable surface we want here: power
                    // off/on, or Retry from the status card.
                    isInteractive={isViewerUsable}
                    handleToggleInteractive={this.handleToggleInteractive}
                />
                <ViewerErrorBoundary onError={this.handleViewerError} resetKey={viewerResetKey}>
                    {this.renderWaveComponent()}
                </ViewerErrorBoundary>
                <ViewerStatus
                    kind={this.getViewerStatusKind()}
                    message={viewerError}
                    onRetry={this.handleRetryViewer}
                />
                {isViewerUsable && isEditModeActive && this.renderEditSurface()}
                {isViewerUsable && (
                    <ModePill
                        isEditModeActive={isEditModeActive}
                        activeMeasurement={activeMeasurement}
                        onExitEditMode={this.handleToggleEditMode}
                        onExitMeasurement={this.handleToggleMeasurement}
                        isOrbitEnabled={Boolean(this._getWaveProperty("areOrbitControlsEnabled"))}
                    />
                )}
                {isViewerUsable && <QuickToggles items={this.getQuickToggleItems()} />}
                {isInteractive && (
                    <StatusBar
                        material={material}
                        selectedAtomIndices={selectedAtomIndices}
                        selectedElement={this.getSelectedElementSymbol()}
                        measurement={formatMeasurementValue(activeMeasurement)}
                        lastActionHint={lastActionHint}
                        // Chip-click selection only has machinery to act on in edit mode, so
                        // outside it the chips stay a pure legend rather than a dead control.
                        onSelectElement={
                            isViewerUsable && isEditModeActive
                                ? this.handleSelectElement
                                : undefined
                        }
                    />
                )}
                <KeyboardSheet
                    isOpen={isInteractive && isKeyboardSheetOpen}
                    onClose={this.handleCloseKeyboardSheet}
                    editable={editable}
                />
                {isViewerUsable && (
                    <FigureExportDialog
                        isOpen={isFigureExportOpen}
                        onClose={this.handleCloseFigureExport}
                        onExport={this.handleExportFigure}
                        viewportWidth={viewportSize.width}
                        viewportHeight={viewportSize.height}
                        maxDimension={this.getMaxFigureDimension()}
                        isCameraOrthographic={Boolean(
                            this._getWaveProperty("isCameraOrthographic"),
                        )}
                    />
                )}
            </div>
        );
    }

    render() {
        const { isStandalone } = this.props;
        return (
            <ThemeProvider theme={DarkMaterialUITheme}>
                <ScopedCssBaseline enableColorScheme style={{ height: "100%" }}>
                    {isStandalone ? (
                        <AlertProvider>{this.renderViewerWithToolbars()}</AlertProvider>
                    ) : (
                        this.renderViewerWithToolbars()
                    )}
                </ScopedCssBaseline>
            </ThemeProvider>
        );
    }
}

ThreeDEditor.propTypes = {
    material: PropTypes.instanceOf(Made.Material).isRequired,
    editable: PropTypes.bool,
    isConventionalCellShown: PropTypes.bool, // eslint-disable-next-line react/forbid-prop-types
    boundaryConditions: PropTypes.object,
    onUpdate: PropTypes.func,
    // Fires once per committed edit, like onUpdate, but also carries {source} - one of "drag",
    // "gizmo", "coordinate-input", "element-input", "add", "remove", "clone", "undo", "redo" - so
    // a host can record its own history without double-counting onUpdate's every-edit cadence
    // against its own undo/redo actions (spec §6.2).
    onEditCommit: PropTypes.func,
    // Fires whenever edit mode is toggled on/off, so a host can disable conflicting UI.
    onEditModeChanged: PropTypes.func,
    // Fires with the current array of selected atomicIndex whenever the selection changes
    // (empty for none, 2+ for a group) - spec §6.2's data source for a host's selection-info UI.
    onSelectionChanged: PropTypes.func,
    isStandalone: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    initialViewSettings: PropTypes.object,
    // Per-session editing defaults, e.g. { defaultElement: "Si" } for the Add Atom button.
    // eslint-disable-next-line react/forbid-prop-types
    editSessionOptions: PropTypes.object,
};

ThreeDEditor.defaultProps = {
    boundaryConditions: {},
    isConventionalCellShown: false,
    onUpdate: undefined,
    onEditCommit: undefined,
    onEditModeChanged: undefined,
    onSelectionChanged: undefined,
    editable: false,
    isStandalone: false,
    initialViewSettings: {},
    editSessionOptions: {},
};
