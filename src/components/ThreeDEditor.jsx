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
import {
    defaultMeasurementsSettings,
    MeasurementSettingsHandler,
} from "../mixins/measurements/MeasurementSettingsHandler";
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
            selectedAtomIndex: null,
            // isDistanceAndAnglesShown: false,
            measurementsSettings: defaultMeasurementsSettings,
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
        this.handleSetTransformMode = this.handleSetTransformMode.bind(this);
        this.handleAddAtom = this.handleAddAtom.bind(this);
        this.handleRemoveSelectedAtom = this.handleRemoveSelectedAtom.bind(this);
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
        this._applyInitialToggleSettings();
    }

    /**
     * Apply toggle-based view settings from URL params after the Wave instance is mounted.
     * These settings are imperative (they toggle state on the Wave class instance),
     * so they must be applied after componentDidMount when WaveComponent.wave exists.
     */
    _applyInitialToggleSettings() {
        const { _initialToggleSettings } = this.state;
        if (!_initialToggleSettings || !this.WaveComponent?.wave) return;

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
    }

    // TODO: update component to fully controlled or fully uncontrolled with a key?
    // https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops
    // eslint-disable-next-line no-unused-vars
    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        const { material } = nextProps;
        if (material) {
            const clonedMaterial = material.clone();
            this.setState({
                material: clonedMaterial,
                originalMaterial: material,
                boundaryConditions: nextProps.boundaryConditions || {},
                isConventionalCellShown: nextProps.isConventionalCellShown || false,
                // Undo/redo history is scoped to the material currently being edited.
                historyStack: [clonedMaterial],
                historyPointer: 0,
                selectedAtomIndex: null,
            });
            this.handleResetMeasurements();
        }
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
        if (
            !isInteractive ||
            e.target.closest(".cm-editor") ||
            ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.nodeName)
        ) {
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
        const { originalMaterial } = this.state;
        let content;
        switch (format) {
            case "poscar":
                content = originalMaterial.getAsPOSCAR();
                break;
            default:
                content = JSON.stringify(originalMaterial.toJSON());
        }
        exportToDisk(content, originalMaterial.name, format);
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
        const isEditModeActive = !wasEditModeActive;
        this.setState({ isEditModeActive }, () => {
            if (this.WaveComponent && this.WaveComponent.wave) {
                this.WaveComponent.wave.enableEditMode(isEditModeActive);
            }
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

        this.setState(
            {
                material: clonedMaterial,
                historyStack: newStack,
                historyPointer: newStack.length - 1,
            },
            () => this._applyMaterialToViewer(clonedMaterial),
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
            () => this._applyMaterialToViewer(previousMaterial),
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
            () => this._applyMaterialToViewer(nextMaterial),
        );
    }

    handleCoordinateChange(axisIndex, value) {
        const { selectedAtomIndex, material } = this.state;
        if (selectedAtomIndex === null) return;

        const floatValue = parseFloat(value);
        if (Number.isNaN(floatValue)) return;

        const elements = material.basis.elements.map((element) =>
            typeof element === "string" ? element : element.value,
        );
        const coordinateArrays = material.basis.coordinates.map((coordinate) => {
            if (Array.isArray(coordinate)) return [...coordinate];
            if (coordinate && Array.isArray(coordinate.value)) return [...coordinate.value];
            return coordinate;
        });

        if (coordinateArrays[selectedAtomIndex]) {
            coordinateArrays[selectedAtomIndex][axisIndex] = floatValue;
        }

        // Only one axis of an already-existing coordinate is changing here, so the edited
        // array must stay labeled with whatever units the material already uses (typically
        // "crystal"/fractional by default) - hardcoding "cartesian" would silently reinterpret
        // every atom's fractional position as if it were in Angstroms.
        const { units } = material.basis;

        const newBasis = Made.Basis.fromElementsAndCoordinates({
            elements,
            coordinates: coordinateArrays,
            units,
            cell: material.Lattice,
        });

        const newMaterial = new Made.Material({
            name: material.name,
            lattice: material.Lattice.toJSON(),
            basis: newBasis.toJSON(),
        });

        // Fast in-place scene update for immediate visual feedback before state propagates.
        // Three.js mesh positions are always Cartesian, so this only makes sense when the
        // material's own coordinates are too; for crystal-unit materials, skip straight to the
        // full rebuild below rather than briefly snapping the mesh to the wrong (fractional) spot.
        if (units === "cartesian" && this.WaveComponent?.wave?.selectedMesh_) {
            this.WaveComponent.wave.selectedMesh_.position.setComponent(axisIndex, floatValue);
            this.WaveComponent.wave.render();
        }

        this.handleStructureModified(newMaterial);
    }

    handleSetTransformMode(mode) {
        this.setState({ activeTransformMode: mode });
        if (this.WaveComponent?.wave) {
            this.WaveComponent.wave.setTransformMode(mode);
        }
    }

    handleAddAtom() {
        const { material } = this.state;
        if (!this.WaveComponent?.wave || !material?.Lattice?.unitCell) return;

        const { ax = 0, by = 0, cz = 0 } = material.Lattice.unitCell;
        this.WaveComponent.wave.addAtom("Si", [ax / 2, by / 2, cz / 2]);
    }

    handleRemoveSelectedAtom() {
        if (this.WaveComponent?.wave) {
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
    }

    handleSetMaterial(newMaterialConfig) {
        const { material } = this.state;
        const newMaterial = new Made.Material(newMaterialConfig);
        this.setState(
            {
                originalMaterial: material,
                material: newMaterial,
            },
            () => {
                // Force Wave component to update after state change
                if (this.WaveComponent?.wave) {
                    this.WaveComponent.wave.rebuildScene();
                }
            },
        );
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
                    onSelectionChanged: (index) => this.setState({ selectedAtomIndex: index }),
                }}
            />
        );
    }

    // TODO: move in the toolbar component when it's created
    // eslint-disable-next-line class-methods-use-this
    getCheckmark(isActive) {
        if (isActive) {
            return <CheckIcon style={{ color: DarkMaterialUITheme.palette.success.main }} />;
        }
        return <CheckIcon style={{ color: DarkMaterialUITheme.palette.grey[800] }} />;
    }

    getViewSettingsActions = () => {
        const { viewerSettings, isConventionalCellShown } = this.state;
        const areLabelsVisibleByType = (type) =>
            this.WaveComponent?.wave?.areLabelsVisibleByType(type);
        return [
            {
                id: "rotate-zoom",
                disabled: false,
                content: `Rotate/Zoom [${settings.hotKeysConfig.toggleOrbitControls.toUpperCase()}]`,
                leftIcon: <ThreeDRotation />,
                rightIcon: this.getCheckmark(this._getWaveProperty("areOrbitControlsEnabled")),
                onClick: this.handleToggleOrbitControls,
                shouldMenuStayOpened: true,
            },
            {
                id: "auto-rotate",
                disabled: false,
                content: "Auto Rotate",
                leftIcon: <Autorenew />,
                rightIcon: this.getCheckmark(
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
                rightIcon: this.getCheckmark(this._getWaveProperty("areAxesEnabled")),
                onClick: this.handleToggleAxes,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-camera",
                disabled: false,
                content: "Orthographic Camera",
                leftIcon: <SwitchCamera />,
                rightIcon: this.getCheckmark(this._getWaveProperty("isCameraOrthographic")),
                onClick: this.handleToggleOrthographicCamera,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-bonds",
                disabled: false,
                content: `Bonds [${settings.hotKeysConfig.toggleBonds.toUpperCase()}]`,
                leftIcon: <Dehaze />,
                rightIcon: this.getCheckmark(this._getWaveProperty("isDrawBondsEnabled")),
                onClick: this.handleToggleBonds,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-cell",
                disabled: false,
                content: "Conventional Cell",
                leftIcon: <FormatShapes />,
                rightIcon: this.getCheckmark(isConventionalCellShown),
                onClick: this.handleToggleConventionalCell,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-element-labels",
                disabled: false,
                content: `Elements [${settings.hotKeysConfig.toggleElementLabels.toUpperCase()}]`,
                leftIcon: <Spellcheck />,
                rightIcon: this.getCheckmark(
                    areLabelsVisibleByType && areLabelsVisibleByType("element"),
                ),
                onClick: this.handleToggleElementLabels,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-coordinate-labels",
                disabled: false,
                content: `Coordinates [${settings.hotKeysConfig.toggleCoordinateLabels.toUpperCase()}]`,
                leftIcon: <Spellcheck />,
                rightIcon: this.getCheckmark(
                    areLabelsVisibleByType && areLabelsVisibleByType("coordinate"),
                ),
                onClick: this.handleToggleCoordinateLabels,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-view-adjustment",
                disabled: false,
                content: "Auto-center on change",
                leftIcon: <ControlCameraRounded />,
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
                content: `Distances [${settings.hotKeysConfig.toggleDistanceShown.toUpperCase()}]`,
                rightIcon: this.getCheckmark(
                    measurementsSettingsHandler.isMeasurementActiveByType(
                        MEASUREMENT_MODES.DISTANCE,
                    ),
                ),
                leftIcon: <HeightIcon />,
                onClick: () => this.handleToggleMeasurement(MEASUREMENT_MODES.DISTANCE),
                shouldMenuStayOpened: true,
            },
            {
                id: "Angles",
                content: `Angles [${settings.hotKeysConfig.toggleAnglesShown.toUpperCase()}]`,
                rightIcon: this.getCheckmark(
                    measurementsSettingsHandler.isMeasurementActiveByType(MEASUREMENT_MODES.ANGLE),
                ),
                leftIcon: <LooksIcon />,
                onClick: () => this.handleToggleMeasurement(MEASUREMENT_MODES.ANGLE),
                shouldMenuStayOpened: true,
            },
            {
                id: "Coordinates",
                content: `Copy Coordinates [${settings.hotKeysConfig.toggleCopyCoordinatesShown.toUpperCase()}]`,
                rightIcon: this.getCheckmark(
                    measurementsSettingsHandler.isMeasurementActiveByType(
                        MEASUREMENT_MODES.COORDINATE,
                    ),
                ),
                leftIcon: <GpsFixed />,
                onClick: () => this.handleToggleMeasurement(MEASUREMENT_MODES.COORDINATE),
                shouldMenuStayOpened: true,
            },
            {
                id: "Delete",
                content: `Delete connection [${settings.hotKeysConfig.deleteConnection.toUpperCase()}]`,
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
        const { viewerSettings } = this.state;
        return (
            <ParametersMenu
                viewerSettings={viewerSettings}
                handleSphereRadiusChange={this.handleSphereRadiusChange}
                handleCellRepetitionsChange={this.handleCellRepetitionsChange}
                handleChemicalConnectivityFactorChange={this.handleChemicalConnectivityFactorChange}
            />
        );
    };

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

    renderEditToolbar() {
        const { activeTransformMode, historyStack, historyPointer, selectedAtomIndex, material } =
            this.state;
        const hasUndo = historyPointer > 0;
        const hasRedo = historyPointer < historyStack.length - 1;

        let selectedCoordinates = [0, 0, 0];
        let selectedElement = "";
        if (selectedAtomIndex !== null && material?.basis?.coordinates) {
            const selectedAtom = material.basis.coordinates[selectedAtomIndex];
            if (selectedAtom) {
                selectedCoordinates = Array.isArray(selectedAtom)
                    ? selectedAtom
                    : selectedAtom.value || selectedAtom;
                const elementObj = material.basis.elements[selectedAtomIndex];
                selectedElement =
                    typeof elementObj === "string"
                        ? elementObj
                        : elementObj?.value || elementObj?.element || "";
            }
        }

        return (
            <Paper
                elevation={2}
                sx={{ position: "absolute", top: "1em", right: "1em", boxShadow: 4 }}
            >
                <Stack
                    alignItems="center"
                    spacing={1}
                    padding={1}
                    divider={<Divider flexItem sx={{ width: "80%", alignSelf: "center" }} />}
                >
                    <ButtonGroup orientation="vertical" variant="outlined" color="inherit">
                        <SquareIconButton
                            title="Translate Mode"
                            onClick={() => this.handleSetTransformMode("translate")}
                        >
                            <OpenWith
                                color={activeTransformMode === "translate" ? "primary" : "inherit"}
                            />
                        </SquareIconButton>
                    </ButtonGroup>

                    <ButtonGroup orientation="vertical" variant="outlined" color="inherit">
                        <SquareIconButton title="Add Atom (Si)" onClick={this.handleAddAtom}>
                            <AddCircleOutline />
                        </SquareIconButton>
                        <SquareIconButton
                            title="Delete Selected Atom"
                            disabled={selectedAtomIndex === null}
                            onClick={this.handleRemoveSelectedAtom}
                        >
                            <DeleteIcon />
                        </SquareIconButton>
                    </ButtonGroup>

                    <ButtonGroup orientation="vertical" variant="outlined" color="inherit">
                        <SquareIconButton
                            title="Undo"
                            disabled={!hasUndo}
                            onClick={this.handleUndo}
                        >
                            <Undo />
                        </SquareIconButton>
                        <SquareIconButton
                            title="Redo"
                            disabled={!hasRedo}
                            onClick={this.handleRedo}
                        >
                            <Redo />
                        </SquareIconButton>
                    </ButtonGroup>

                    {selectedAtomIndex !== null && (
                        <Stack spacing={1} alignItems="center" sx={{ width: "84px" }}>
                            <Typography variant="caption" fontWeight="bold">
                                {selectedElement || "Si"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
                                {material?.basis?.units === "cartesian"
                                    ? "cartesian, Å"
                                    : "crystal"}
                            </Typography>
                            {["X", "Y", "Z"].map((axisName, idx) => (
                                <TextField
                                    key={axisName}
                                    label={axisName}
                                    size="small"
                                    type="number"
                                    className="inverse stepper"
                                    value={
                                        selectedCoordinates[idx] !== undefined
                                            ? parseFloat(selectedCoordinates[idx].toFixed(3))
                                            : 0
                                    }
                                    onChange={(event) =>
                                        this.handleCoordinateChange(idx, event.target.value)
                                    }
                                    inputProps={{ step: 0.01 }}
                                />
                            ))}
                        </Stack>
                    )}
                </Stack>
            </Paper>
        );
    }

    renderWaveOrThreejsEditorModal() {
        const { isInteractive, isEditModeActive } = this.state;

        return (
            <div className="wave-component-holder" style={{ position: "relative", height: "100%" }}>
                {this.renderCoverDiv()}
                <IconsToolbar
                    toolbarConfig={this.getToolbarConfig()}
                    isInteractive={isInteractive}
                    handleToggleInteractive={this.handleToggleInteractive}
                />
                {this.renderWaveComponent()}
                {isEditModeActive && this.renderEditToolbar()}
            </div>
        );
    }

    render() {
        const { isStandalone } = this.props;
        return (
            <ThemeProvider theme={DarkMaterialUITheme}>
                <ScopedCssBaseline enableColorScheme style={{ height: "100%" }}>
                    {isStandalone ? (
                        <AlertProvider>{this.renderWaveOrThreejsEditorModal()}</AlertProvider>
                    ) : (
                        this.renderWaveOrThreejsEditorModal()
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
    isStandalone: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    initialViewSettings: PropTypes.object,
};

ThreeDEditor.defaultProps = {
    boundaryConditions: {},
    isConventionalCellShown: false,
    onUpdate: undefined,
    editable: false,
    isStandalone: false,
    initialViewSettings: {},
};
