import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react/sort-comp */
// import "../MuiClassNameSetup";
import { DarkMaterialUITheme } from "@exabyte-io/cove.js/dist/theme";
import ThemeProvider from "@exabyte-io/cove.js/dist/theme/provider";
import { exportToDisk } from "@exabyte-io/cove.js/dist/utils/downloader";
import { AlertProvider } from "@exabyte-io/cove.js/src/theme/provider";
import { Made } from "@mat3ra/made";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import Article from "@mui/icons-material/Article";
import Autorenew from "@mui/icons-material/Autorenew";
import CheckIcon from "@mui/icons-material/Check";
import CloudDownload from "@mui/icons-material/CloudDownload";
import ControlCameraRounded from "@mui/icons-material/ControlCameraRounded";
import Dehaze from "@mui/icons-material/Dehaze";
import DeleteIcon from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import FormatShapes from "@mui/icons-material/FormatShapes";
import GpsFixed from "@mui/icons-material/GpsFixed";
import HeightIcon from "@mui/icons-material/Height";
import ImportExport from "@mui/icons-material/ImportExport";
import LooksIcon from "@mui/icons-material/Looks";
import OpenWith from "@mui/icons-material/OpenWith";
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
import ButtonGroup from "@mui/material/ButtonGroup";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import $ from "jquery";
import PropTypes from "prop-types";
import React from "react";
import { LABEL_TYPES, MEASUREMENT_MODES } from "../enums";
import { defaultMeasurementsSettings, MeasurementSettingsHandler, } from "../mixins/measurements/MeasurementSettingsHandler";
import settings from "../settings";
import IconsToolbar from "./IconsToolbar";
import ParametersMenu from "./ParametersMenu";
import SquareIconButton from "./SquareIconButton";
import { WaveComponent } from "./WaveComponent";
/**
 * Wrapper component containing 3D visualization through `WaveComponent` and the associated controls
 */
export class ThreeDEditor extends React.Component {
    /**
     * Create a ThreeDEditor component
     * @param props Properties as explained below
     */
    constructor(props) {
        var _a, _b, _c, _d, _e, _f, _g;
        super(props);
        this.handleSetSetting = (setting) => {
            const { viewerSettings } = this.state;
            this.setState({
                viewerSettings: {
                    ...viewerSettings,
                    ...setting,
                },
            });
        };
        this.handleKeyPress = (e) => {
            const { isInteractive } = this.state;
            const { editable } = this.props;
            // Check if interactive mode is off, or if the event originated from an input-like element
            if (!isInteractive ||
                e.target.closest(".cm-editor") ||
                ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.nodeName)) {
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
        this.getViewSettingsActions = () => {
            const { viewerSettings, isConventionalCellShown } = this.state;
            const areLabelsVisibleByType = (type) => { var _a, _b; return (_b = (_a = this.WaveComponent) === null || _a === void 0 ? void 0 : _a.wave) === null || _b === void 0 ? void 0 : _b.areLabelsVisibleByType(type); };
            return [
                {
                    id: "rotate-zoom",
                    disabled: false,
                    content: `Rotate/Zoom [${settings.hotKeysConfig.toggleOrbitControls.toUpperCase()}]`,
                    leftIcon: _jsx(ThreeDRotation, {}),
                    rightIcon: this.getCheckmark(this._getWaveProperty("areOrbitControlsEnabled")),
                    onClick: this.handleToggleOrbitControls,
                    shouldMenuStayOpened: true,
                },
                {
                    id: "auto-rotate",
                    disabled: false,
                    content: "Auto Rotate",
                    leftIcon: _jsx(Autorenew, {}),
                    rightIcon: this.getCheckmark(this._getWaveProperty("isOrbitControlsAnimationEnabled")),
                    onClick: this.handleToggleOrbitControlsAnimation,
                    shouldMenuStayOpened: true,
                },
                {
                    id: "toggle-axes",
                    disabled: false,
                    content: "Axes",
                    leftIcon: _jsx(GpsFixed, {}),
                    rightIcon: this.getCheckmark(this._getWaveProperty("areAxesEnabled")),
                    onClick: this.handleToggleAxes,
                    shouldMenuStayOpened: true,
                },
                {
                    id: "toggle-camera",
                    disabled: false,
                    content: "Orthographic Camera",
                    leftIcon: _jsx(SwitchCamera, {}),
                    rightIcon: this.getCheckmark(this._getWaveProperty("isCameraOrthographic")),
                    onClick: this.handleToggleOrthographicCamera,
                    shouldMenuStayOpened: true,
                },
                {
                    id: "toggle-bonds",
                    disabled: false,
                    content: `Bonds [${settings.hotKeysConfig.toggleBonds.toUpperCase()}]`,
                    leftIcon: _jsx(Dehaze, {}),
                    rightIcon: this.getCheckmark(this._getWaveProperty("isDrawBondsEnabled")),
                    onClick: this.handleToggleBonds,
                    shouldMenuStayOpened: true,
                },
                {
                    id: "toggle-cell",
                    disabled: false,
                    content: "Conventional Cell",
                    leftIcon: _jsx(FormatShapes, {}),
                    rightIcon: this.getCheckmark(isConventionalCellShown),
                    onClick: this.handleToggleConventionalCell,
                    shouldMenuStayOpened: true,
                },
                {
                    id: "toggle-element-labels",
                    disabled: false,
                    content: `Elements [${settings.hotKeysConfig.toggleElementLabels.toUpperCase()}]`,
                    leftIcon: _jsx(Spellcheck, {}),
                    rightIcon: this.getCheckmark(areLabelsVisibleByType && areLabelsVisibleByType("element")),
                    onClick: this.handleToggleElementLabels,
                    shouldMenuStayOpened: true,
                },
                {
                    id: "toggle-coordinate-labels",
                    disabled: false,
                    content: `Coordinates [${settings.hotKeysConfig.toggleCoordinateLabels.toUpperCase()}]`,
                    leftIcon: _jsx(Spellcheck, {}),
                    rightIcon: this.getCheckmark(areLabelsVisibleByType && areLabelsVisibleByType("coordinate")),
                    onClick: this.handleToggleCoordinateLabels,
                    shouldMenuStayOpened: true,
                },
                {
                    id: "toggle-view-adjustment",
                    disabled: false,
                    content: "Auto-center on change",
                    leftIcon: _jsx(ControlCameraRounded, {}),
                    rightIcon: this.getCheckmark(viewerSettings.isViewAdjustable),
                    onClick: this.handleToggleIsViewAdjustable,
                    shouldMenuStayOpened: true,
                },
                {
                    id: "divider-2",
                    isDivider: true,
                },
                {
                    id: "reset-view",
                    disabled: false,
                    content: `Reset View [${settings.hotKeysConfig.resetViewer.toUpperCase()}]`,
                    leftIcon: _jsx(Replay, {}),
                    onClick: this.handleResetViewer,
                    shouldMenuStayOpened: true,
                },
            ];
        };
        this.getMeasurementsActions = () => {
            const { measurementsSettings } = this.state;
            const measurementsSettingsHandler = new MeasurementSettingsHandler(measurementsSettings);
            return [
                {
                    id: "Distances",
                    content: `Distances [${settings.hotKeysConfig.toggleDistanceShown.toUpperCase()}]`,
                    rightIcon: this.getCheckmark(measurementsSettingsHandler.isMeasurementActiveByType(MEASUREMENT_MODES.DISTANCE)),
                    leftIcon: _jsx(HeightIcon, {}),
                    onClick: () => this.handleToggleMeasurement(MEASUREMENT_MODES.DISTANCE),
                    shouldMenuStayOpened: true,
                },
                {
                    id: "Angles",
                    content: `Angles [${settings.hotKeysConfig.toggleAnglesShown.toUpperCase()}]`,
                    rightIcon: this.getCheckmark(measurementsSettingsHandler.isMeasurementActiveByType(MEASUREMENT_MODES.ANGLE)),
                    leftIcon: _jsx(LooksIcon, {}),
                    onClick: () => this.handleToggleMeasurement(MEASUREMENT_MODES.ANGLE),
                    shouldMenuStayOpened: true,
                },
                {
                    id: "Coordinates",
                    content: `Copy Coordinates [${settings.hotKeysConfig.toggleCopyCoordinatesShown.toUpperCase()}]`,
                    rightIcon: this.getCheckmark(measurementsSettingsHandler.isMeasurementActiveByType(MEASUREMENT_MODES.COORDINATE)),
                    leftIcon: _jsx(GpsFixed, {}),
                    onClick: () => this.handleToggleMeasurement(MEASUREMENT_MODES.COORDINATE),
                    shouldMenuStayOpened: true,
                },
                {
                    id: "Delete",
                    content: `Delete connection [${settings.hotKeysConfig.deleteConnection.toUpperCase()}]`,
                    leftIcon: _jsx(DeleteIcon, {}),
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
                    leftIcon: _jsx(Replay, {}),
                    onClick: this.handleResetMeasurements,
                    shouldMenuStayOpened: true,
                },
            ];
        };
        this.getExportActions = () => {
            const downloadActions = [
                {
                    id: "JSON",
                    title: "JSON",
                    content: "JSON",
                    leftIcon: _jsx(Article, {}),
                    onClick: () => this.handleDownloadClick("json"),
                },
                {
                    id: "POSCAR",
                    title: "POSCAR",
                    content: "POSCAR",
                    leftIcon: _jsx(Article, {}),
                    onClick: () => this.handleDownloadClick("poscar"),
                },
            ];
            return [
                {
                    id: "StartGif",
                    title: "Auto Rotate GIF",
                    content: "Auto Rotate GIF",
                    leftIcon: _jsx(PictureInPicture, {}),
                    onClick: () => this.handleStartGifRecording(),
                },
                {
                    id: "Screenshot",
                    title: "Screenshot",
                    content: "Screenshot",
                    leftIcon: _jsx(PictureInPicture, {}),
                    onClick: this.handleTakeScreenshot,
                },
                {
                    id: "Download",
                    title: "Download",
                    content: "Download",
                    leftIcon: _jsx(CloudDownload, {}),
                    actions: downloadActions,
                    paperPlacement: "right-start",
                },
            ];
        };
        this.getParametersActions = () => {
            const { viewerSettings } = this.state;
            return (_jsx(ParametersMenu, { viewerSettings: viewerSettings, handleSphereRadiusChange: this.handleSphereRadiusChange, handleCellRepetitionsChange: this.handleCellRepetitionsChange, handleChemicalConnectivityFactorChange: this.handleChemicalConnectivityFactorChange }));
        };
        const { boundaryConditions, isConventionalCellShown, material, initialViewSettings = {}, } = this.props;
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
            // isDistanceAndAnglesShown: false,
            measurementsSettings: defaultMeasurementsSettings,
            // TODO: remove the need for `viewerTriggerResize`
            // whether to trigger resize
            viewerTriggerResize: false,
            // Settings of the wave viewer, merged with any initial overrides from URL params
            viewerSettings: {
                isViewAdjustable: (_a = initialViewSettings.isViewAdjustable) !== null && _a !== void 0 ? _a : settings.isViewAdjustable,
                atomRadiiScale: (_b = initialViewSettings.atomRadiiScale) !== null && _b !== void 0 ? _b : settings.atomRadiiScale,
                repetitionsAlongLatticeVectorA: (_c = initialViewSettings.repetitionsAlongLatticeVectorA) !== null && _c !== void 0 ? _c : settings.repetitions,
                repetitionsAlongLatticeVectorB: (_d = initialViewSettings.repetitionsAlongLatticeVectorB) !== null && _d !== void 0 ? _d : settings.repetitions,
                repetitionsAlongLatticeVectorC: (_e = initialViewSettings.repetitionsAlongLatticeVectorC) !== null && _e !== void 0 ? _e : settings.repetitions,
                chemicalConnectivityFactor: (_f = initialViewSettings.chemicalConnectivityFactor) !== null && _f !== void 0 ? _f : settings.chemicalConnectivityFactor,
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
            isConventionalCellShown: (_g = initialViewSettings.conventionalCell) !== null && _g !== void 0 ? _g : isConventionalCellShown,
            // material that is originally passed to the component and can be modified in ThreejsEditorModal component.
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
        this.handleSelectionChanged = this.handleSelectionChanged.bind(this);
        this.handleEditModeKeyDown = this.handleEditModeKeyDown.bind(this);
        this.canUndo = this.canUndo.bind(this);
        this.canRedo = this.canRedo.bind(this);
        this.renderEditToolbar = this.renderEditToolbar.bind(this);
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
        this.handleSetMaterial = this.handleSetMaterial.bind(this);
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
        var _a;
        const { _initialToggleSettings } = this.state;
        if (!_initialToggleSettings || !((_a = this.WaveComponent) === null || _a === void 0 ? void 0 : _a.wave))
            return;
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
    }
    /**
     * Delete/Backspace/Ctrl(Cmd)+Z/Ctrl(Cmd)+Shift+Z don't fire the "keypress" event the rest of
     * this component's hotkeys rely on (keypress only fires for character-producing keys), so
     * they're handled separately here on "keydown". Guarded the same way as handleKeyPress:
     * only while interactive and not while a form field has focus.
     */
    handleEditModeKeyDown(event) {
        const { isInteractive, isEditModeActive } = this.state;
        if (!isInteractive ||
            !isEditModeActive ||
            event.target.closest(".cm-editor") ||
            ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.nodeName)) {
            return;
        }
        const isUndoKey = (event.metaKey || event.ctrlKey) && !event.shiftKey && event.key === "z";
        const isRedoKey = (event.metaKey || event.ctrlKey) && event.shiftKey && event.key === "z";
        if (isUndoKey) {
            event.preventDefault();
            this.handleUndo();
        }
        else if (isRedoKey) {
            event.preventDefault();
            this.handleRedo();
        }
        else if (event.key === "Delete" || event.key === "Backspace") {
            this.handleRemoveSelectedAtom();
        }
    }
    // TODO: update component to fully controlled or fully uncontrolled with a key?
    // https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops
    // eslint-disable-next-line no-unused-vars
    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        const { material } = nextProps;
        if (!material)
            return;
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
        }
        catch (error) {
            isSameContent = false;
        }
        if (isSameContent)
            return;
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
        });
        this.handleResetMeasurements();
    }
    _resetStateWaveComponent() {
        // eslint-disable-next-line react/no-unused-state
        this.setState({ wave: this.WaveComponent.wave });
    }
    // map of hotkeys to their handlers
    getKeyConfig() {
        return {
            [settings.hotKeysConfig.toggleOrbitControls]: this.handleToggleOrbitControls,
            [settings.hotKeysConfig.toggleInteractive]: this.handleToggleInteractive,
            [settings.hotKeysConfig.toggleBonds]: this.handleToggleBonds,
            [settings.hotKeysConfig.toggleElementLabels]: this.handleToggleElementLabels,
            [settings.hotKeysConfig.toggleCoordinateLabels]: this.handleToggleCoordinateLabels,
            [settings.hotKeysConfig.resetViewer]: this.handleResetViewer,
            [settings.hotKeysConfig.toggleEditMode]: this.handleToggleEditMode,
            [settings.hotKeysConfig.toggleDistanceShown]: this.handleToggleMeasurement.bind(this, MEASUREMENT_MODES.DISTANCE),
            [settings.hotKeysConfig.toggleAnglesShown]: this.handleToggleMeasurement.bind(this, MEASUREMENT_MODES.ANGLE),
            [settings.hotKeysConfig.toggleCopyCoordinatesShown]: this.handleToggleMeasurement.bind(this, MEASUREMENT_MODES.COORDINATE),
            [settings.hotKeysConfig.deleteConnection]: this.handleDeleteConnection,
        };
    }
    addHotKeyListener() {
        document.addEventListener("keypress", this.handleKeyPress, true);
    }
    removeHotKeyListener() {
        document.removeEventListener("keypress", this.handleKeyPress, true);
    }
    handleCellRepetitionsChange(e) {
        this.handleSetSetting({ [e.target.id]: parseFloat($(e.target).val()) });
    }
    handleSphereRadiusChange(e) {
        this.handleSetSetting({ atomRadiiScale: parseFloat($(e.target).val()) });
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
        this.handleSetSetting({ chemicalConnectivityFactor: parseFloat($(e.target).val()) });
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
            originalMaterial: this.getPrimitiveOrConventionalMaterial(originalMaterial, !isConventionalCellShown),
        });
    }
    handleToggleIsViewAdjustable() {
        const { viewerSettings: { isViewAdjustable }, } = this.state;
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
            activeToolbarMenu: prevState.activeToolbarMenu === toolbarMenuName ? null : toolbarMenuName,
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
            if (onEditModeChanged)
                onEditModeChanged(isEditModeActive);
        });
    }
    /**
     * Pushes a material to the viewer via the official setStructure()/rebuildScene() path and
     * notifies the parent. Used as the setState callback for every history-affecting change
     * (edit, undo, redo) once bypassReloadViewer has already been set so WaveComponent's own
     * prop-driven reload doesn't race with it.
     */
    _applyMaterialToViewer(material) {
        const { onUpdate } = this.props;
        if (this.WaveComponent && this.WaveComponent.wave) {
            this.WaveComponent.wave.bypassReloadViewer = false;
            this.WaveComponent.wave.setStructure(material);
            this.WaveComponent.wave.rebuildScene();
        }
        if (onUpdate) {
            onUpdate(material);
        }
    }
    handleStructureModified(newMaterial) {
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
        this.setState({
            material: clonedMaterial,
            historyStack: newStack,
            historyPointer: newStack.length - 1,
        }, () => this._applyMaterialToViewer(clonedMaterial));
    }
    handleUndo() {
        const { historyStack, historyPointer } = this.state;
        if (historyPointer <= 0)
            return;
        const previousPointer = historyPointer - 1;
        const previousMaterial = historyStack[previousPointer];
        if (this.WaveComponent && this.WaveComponent.wave) {
            this.WaveComponent.wave.bypassReloadViewer = true;
        }
        this.setState({
            material: previousMaterial,
            historyPointer: previousPointer,
        }, () => this._applyMaterialToViewer(previousMaterial));
    }
    handleRedo() {
        const { historyStack, historyPointer } = this.state;
        if (historyPointer >= historyStack.length - 1)
            return;
        const nextPointer = historyPointer + 1;
        const nextMaterial = historyStack[nextPointer];
        if (this.WaveComponent && this.WaveComponent.wave) {
            this.WaveComponent.wave.bypassReloadViewer = true;
        }
        this.setState({
            material: nextMaterial,
            historyPointer: nextPointer,
        }, () => this._applyMaterialToViewer(nextMaterial));
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
     * Commits a single axis of the selected atom's coordinate. Only called once per field edit
     * (on blur/Enter, via handleCoordinateCommit below) rather than per keystroke, so this is
     * naturally one history entry per edit (D18). Mutates a clone's basis in place via
     * Basis/setBasis rather than reconstructing via fromElementsAndCoordinates, so labels and
     * constraints on every atom (including the one being edited) survive untouched (D7). Only
     * meaningful for exactly one selected atom - the coordinate panel itself is hidden for 0 or
     * 2+ selected (see renderEditToolbar), so this is a defensive guard, not the primary gate.
     */
    handleCoordinateChange(axisIndex, value) {
        var _a, _b;
        const { selectedAtomIndices, material } = this.state;
        if (selectedAtomIndices.length !== 1)
            return;
        const [selectedAtomIndex] = selectedAtomIndices;
        const floatValue = parseFloat(value);
        if (Number.isNaN(floatValue))
            return;
        const newMaterial = material.clone();
        const basis = newMaterial.Basis;
        const { coordinates } = basis;
        if (!coordinates[selectedAtomIndex])
            return;
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
        if (basis.units === "cartesian" && ((_b = (_a = this.WaveComponent) === null || _a === void 0 ? void 0 : _a.wave) === null || _b === void 0 ? void 0 : _b.selectedMesh_)) {
            this.WaveComponent.wave.selectedMesh_.position.setComponent(axisIndex, floatValue);
            this.WaveComponent.wave.render();
        }
        this.handleStructureModified(newMaterial);
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
        var _a;
        if ((_a = this.WaveComponent) === null || _a === void 0 ? void 0 : _a.wave) {
            this.WaveComponent.wave.bypassReloadViewer = true;
        }
        this.setState({ selectedAtomIndices: indices, coordinateDrafts: [null, null, null] }, () => {
            var _a;
            if ((_a = this.WaveComponent) === null || _a === void 0 ? void 0 : _a.wave) {
                this.WaveComponent.wave.bypassReloadViewer = false;
            }
        });
    }
    handleSetTransformMode(mode) {
        var _a;
        this.setState({ activeTransformMode: mode });
        if ((_a = this.WaveComponent) === null || _a === void 0 ? void 0 : _a.wave) {
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
        var _a, _b;
        const { material } = this.state;
        const { editSessionOptions } = this.props;
        if (!((_a = this.WaveComponent) === null || _a === void 0 ? void 0 : _a.wave) || !((_b = material === null || material === void 0 ? void 0 : material.Lattice) === null || _b === void 0 ? void 0 : _b.unitCell))
            return;
        const { ax = 0, ay = 0, az = 0, bx = 0, by = 0, bz = 0, cx = 0, cy = 0, cz = 0, } = material.Lattice.unitCell;
        const trueCenter = [(ax + bx + cx) / 2, (ay + by + cy) / 2, (az + bz + cz) / 2];
        const basis = material.Basis;
        basis.toCartesian();
        const existingPositions = basis.coordinatesAsArray;
        const OCCUPIED_TOLERANCE = 0.5; // Å; below any realistic bond length
        const OFFSET_STEP = [0.3, 0.3, 0.3];
        const MAX_OFFSET_ATTEMPTS = 10;
        const isOccupied = (position) => existingPositions.some((existing) => {
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
        const element = (editSessionOptions === null || editSessionOptions === void 0 ? void 0 : editSessionOptions.defaultElement) || "Si";
        this.WaveComponent.wave.addAtom(element, candidate);
    }
    handleRemoveSelectedAtom() {
        var _a;
        if ((_a = this.WaveComponent) === null || _a === void 0 ? void 0 : _a.wave) {
            this.WaveComponent.wave.removeSelectedAtom();
        }
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
        var _a;
        if ((_a = this.WaveComponent) === null || _a === void 0 ? void 0 : _a.wave) {
            this.WaveComponent.wave.resetAllMeasurements();
        }
    }
    handleToggleMeasurement(measurementMode) {
        this.WaveComponent.wave.toggleMeasurementByType(measurementMode, this.handleSetMeasurementSettingsForTypeInState);
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
    handleSetMaterial(newMaterialConfig) {
        const { material } = this.state;
        const newMaterial = new Made.Material(newMaterialConfig);
        this.setState({
            originalMaterial: material,
            material: newMaterial,
        }, () => {
            var _a;
            // Force Wave component to update after state change
            if ((_a = this.WaveComponent) === null || _a === void 0 ? void 0 : _a.wave) {
                this.WaveComponent.wave.rebuildScene();
            }
        });
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
        if (isInteractive)
            style.display = "none";
        return _jsx("div", { className: "atom-view-cover", style: style });
    }
    renderWaveComponent() {
        const { isConventionalCellShown, viewerSettings, viewerTriggerResize, boundaryConditions, material, } = this.state;
        const materialCopy = this.getPrimitiveOrConventionalMaterial(material, isConventionalCellShown);
        const isDrawBondsEnabled = this._getWaveProperty("isDrawBondsEnabled") || false;
        return (_jsx(WaveComponent, { ref: (el) => {
                this.WaveComponent = el;
            }, triggerHandleResize: viewerTriggerResize, isConventionalCellShown: isConventionalCellShown, isDrawBondsEnabled: isDrawBondsEnabled, isViewAdjustable: viewerSettings.isViewAdjustable, structure: materialCopy, boundaryConditions: boundaryConditions, cell: materialCopy.Lattice.unitCell, name: materialCopy.name, settings: {
                ...viewerSettings,
                onStructureModified: this.handleStructureModified,
                onSelectionChanged: this.handleSelectionChanged,
            } }));
    }
    // TODO: move in the toolbar component when it's created
    // eslint-disable-next-line class-methods-use-this
    getCheckmark(isActive) {
        if (isActive) {
            return _jsx(CheckIcon, { style: { color: DarkMaterialUITheme.palette.success.main } });
        }
        return _jsx(CheckIcon, { style: { color: DarkMaterialUITheme.palette.grey[800] } });
    }
    getToolbarConfig() {
        const toolbarConfig = [
            {
                id: "View",
                title: "View",
                header: "View",
                leftIcon: _jsx(RemoveRedEye, {}),
                actions: this.getViewSettingsActions(),
                onClick: () => this.handleToggleToolbarMenu("view-settings"),
            },
            {
                id: "Parameters",
                title: "Parameters",
                header: "Parameters",
                leftIcon: _jsx(Settings, {}),
                contentObject: this.getParametersActions(),
                onClick: () => this.handleToggleToolbarMenu("parameters"),
            },
            {
                id: "measurements",
                title: "Measurements",
                header: "Measurements",
                leftIcon: _jsx(SquareFootIcon, {}),
                actions: this.getMeasurementsActions(),
                onClick: () => this.handleToggleToolbarMenu("measurements"),
            },
            {
                id: "Export",
                title: "Export",
                header: "Export",
                leftIcon: _jsx(ImportExport, {}),
                actions: this.getExportActions(),
                onClick: () => this.handleToggleToolbarMenu("export"),
            },
        ];
        const { editable } = this.props;
        const { isEditModeActive } = this.state;
        if (editable) {
            toolbarConfig.splice(4, 0, {
                id: "3DEdit",
                title: isEditModeActive
                    ? "Exit Edit"
                    : `Edit [${settings.hotKeysConfig.toggleEditMode.toUpperCase()}]`,
                leftIcon: _jsx(Edit, { color: isEditModeActive ? "primary" : "inherit" }),
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
    renderEditToolbar() {
        var _a, _b;
        const { activeTransformMode, selectedAtomIndices, material, coordinateDrafts } = this.state;
        const { editSessionOptions } = this.props;
        const hasUndo = this.canUndo();
        const hasRedo = this.canRedo();
        const defaultElement = (editSessionOptions === null || editSessionOptions === void 0 ? void 0 : editSessionOptions.defaultElement) || "Si";
        const isSingleAtomSelected = selectedAtomIndices.length === 1;
        const [selectedAtomIndex] = selectedAtomIndices;
        let selectedCoordinates = [0, 0, 0];
        let selectedElement = "";
        if (isSingleAtomSelected && ((_a = material === null || material === void 0 ? void 0 : material.basis) === null || _a === void 0 ? void 0 : _a.coordinates)) {
            const selectedAtom = material.basis.coordinates[selectedAtomIndex];
            if (selectedAtom) {
                selectedCoordinates = Array.isArray(selectedAtom)
                    ? selectedAtom
                    : selectedAtom.value || selectedAtom;
                const elementObj = material.basis.elements[selectedAtomIndex];
                selectedElement =
                    typeof elementObj === "string"
                        ? elementObj
                        : (elementObj === null || elementObj === void 0 ? void 0 : elementObj.value) || (elementObj === null || elementObj === void 0 ? void 0 : elementObj.element) || "";
            }
        }
        return (_jsx(Paper, { elevation: 2, sx: { position: "absolute", top: "1em", right: "1em", boxShadow: 4 }, children: _jsxs(Stack, { alignItems: "center", spacing: 1, padding: 1, divider: _jsx(Divider, { flexItem: true, sx: { width: "80%", alignSelf: "center" } }), children: [_jsx(ButtonGroup, { orientation: "vertical", variant: "outlined", color: "inherit", children: _jsx(SquareIconButton, { title: "Translate Mode", onClick: () => this.handleSetTransformMode("translate"), children: _jsx(OpenWith, { color: activeTransformMode === "translate" ? "primary" : "inherit" }) }) }), _jsxs(ButtonGroup, { orientation: "vertical", variant: "outlined", color: "inherit", children: [_jsx(SquareIconButton, { title: `Add Atom (${defaultElement})`, onClick: this.handleAddAtom, children: _jsx(AddCircleOutline, {}) }), _jsx(SquareIconButton, { title: selectedAtomIndices.length > 1
                                    ? `Delete ${selectedAtomIndices.length} Selected Atoms`
                                    : "Delete Selected Atom", disabled: selectedAtomIndices.length === 0, onClick: this.handleRemoveSelectedAtom, children: _jsx(DeleteIcon, {}) })] }), _jsxs(ButtonGroup, { orientation: "vertical", variant: "outlined", color: "inherit", children: [_jsx(SquareIconButton, { title: "Undo", disabled: !hasUndo, onClick: this.handleUndo, children: _jsx(Undo, {}) }), _jsx(SquareIconButton, { title: "Redo", disabled: !hasRedo, onClick: this.handleRedo, children: _jsx(Redo, {}) })] }), selectedAtomIndices.length > 1 && (_jsxs(Stack, { spacing: 0.5, alignItems: "center", sx: { width: "84px" }, children: [_jsxs(Typography, { variant: "caption", fontWeight: "bold", textAlign: "center", children: [selectedAtomIndices.length, " atoms selected"] }), _jsx(Typography, { variant: "caption", color: "text.secondary", textAlign: "center", children: "Drag or use the gizmo to move the group together" })] })), isSingleAtomSelected && (_jsxs(Stack, { spacing: 1, alignItems: "center", sx: { width: "84px" }, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", children: selectedElement || "Si" }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mt: -1 }, children: ((_b = material === null || material === void 0 ? void 0 : material.basis) === null || _b === void 0 ? void 0 : _b.units) === "cartesian"
                                    ? "cartesian, Å"
                                    : "crystal" }), ["X", "Y", "Z"].map((axisName, idx) => {
                                const draftValue = coordinateDrafts[idx];
                                const committedValue = selectedCoordinates[idx] !== undefined
                                    ? selectedCoordinates[idx].toFixed(3)
                                    : "0";
                                return (_jsx(TextField, { label: axisName, size: "small", 
                                    // type="text" (not "number"): a native number input
                                    // silently drops a lone "-" or an empty string instead
                                    // of firing onChange, which makes typing a negative
                                    // coordinate or clearing the field to retype impossible
                                    // (D18).
                                    type: "text", inputMode: "decimal", className: "inverse stepper", value: draftValue !== null ? draftValue : committedValue, onChange: (event) => this.handleCoordinateDraftChange(idx, event.target.value), onBlur: () => this.handleCoordinateCommit(idx), onKeyDown: (event) => {
                                        if (event.key === "Enter")
                                            event.target.blur();
                                    } }, axisName));
                            })] }))] }) }));
    }
    renderWaveOrThreejsEditorModal() {
        const { isInteractive, isEditModeActive } = this.state;
        return (_jsxs("div", { className: "wave-component-holder", style: { position: "relative", height: "100%" }, children: [this.renderCoverDiv(), _jsx(IconsToolbar, { toolbarConfig: this.getToolbarConfig(), isInteractive: isInteractive, handleToggleInteractive: this.handleToggleInteractive }), this.renderWaveComponent(), isInteractive && isEditModeActive && this.renderEditToolbar()] }));
    }
    render() {
        const { isStandalone } = this.props;
        return (_jsx(ThemeProvider, { theme: DarkMaterialUITheme, children: _jsx(ScopedCssBaseline, { enableColorScheme: true, style: { height: "100%" }, children: isStandalone ? (_jsx(AlertProvider, { children: this.renderWaveOrThreejsEditorModal() })) : (this.renderWaveOrThreejsEditorModal()) }) }));
    }
}
ThreeDEditor.propTypes = {
    material: PropTypes.instanceOf(Made.Material).isRequired,
    editable: PropTypes.bool,
    isConventionalCellShown: PropTypes.bool, // eslint-disable-next-line react/forbid-prop-types
    boundaryConditions: PropTypes.object,
    onUpdate: PropTypes.func,
    // Fires whenever edit mode is toggled on/off, so a host can disable conflicting UI.
    onEditModeChanged: PropTypes.func,
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
    onEditModeChanged: undefined,
    editable: false,
    isStandalone: false,
    initialViewSettings: {},
    editSessionOptions: {},
};
