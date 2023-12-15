/* eslint-disable react/sort-comp */
// import "../MuiClassNameSetup";

import { DarkMaterialUITheme } from "@exabyte-io/cove.js/dist/theme";
import ThemeProvider from "@exabyte-io/cove.js/dist/theme/provider";
import { Made } from "@exabyte-io/made.js";
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
import PictureInPicture from "@mui/icons-material/PictureInPicture";
import RemoveRedEye from "@mui/icons-material/RemoveRedEye";
import Replay from "@mui/icons-material/Replay";
import Settings from "@mui/icons-material/Settings";
import Spellcheck from "@mui/icons-material/Spellcheck";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import SwitchCamera from "@mui/icons-material/SwitchCamera";
import ThreeDRotation from "@mui/icons-material/ThreeDRotation";
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";
import $ from "jquery";
import PropTypes from "prop-types";
import React from "react";

import settings from "../settings";
import { exportToDisk } from "../utils";
import IconsToolbar from "./IconsToolbar";
import ParametersMenu from "./ParametersMenu";
import { ThreejsEditorModal } from "./ThreejsEditorModal";
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
        const { boundaryConditions, isConventionalCellShown, material } = this.props;
        // TODO : overloading a bunch of props and state attributes here..
        this.state = {
            // on/off switch for the component
            isInteractive: false,
            activeToolbarMenu: null,
            isThreejsEditorModalShown: false,
            // isDistanceAndAnglesShown: false,
            measuresSettings: {
                isDistanceShown: false,
                isAnglesShown: false,
                measureLabelsShown: false,
                distance: 0,
                angle: 0,
            },
            // TODO: remove the need for `viewerTriggerResize`
            // whether to trigger resize
            viewerTriggerResize: false,
            // Settings of the wave viewer
            viewerSettings: {
                isViewAdjustable: settings.isViewAdjustable,
                atomRadiiScale: settings.atomRadiiScale,
                repetitionsAlongLatticeVectorA: settings.repetitions,
                repetitionsAlongLatticeVectorB: settings.repetitions,
                repetitionsAlongLatticeVectorC: settings.repetitions,
                chemicalConnectivityFactor: settings.chemicalConnectivityFactor,
            },
            boundaryConditions,
            isConventionalCellShown,
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
        this.toggleThreejsEditorModal = this.toggleThreejsEditorModal.bind(this);
        this.handleToggleOrthographicCamera = this.handleToggleOrthographicCamera.bind(this);
        this.handleToggleLabels = this.handleToggleLabels.bind(this);
        this.handleToggleConventionalCell = this.handleToggleConventionalCell.bind(this);
        this.handleToggleIsViewAdjustable = this.handleToggleIsViewAdjustable.bind(this);
        this.handleResetViewer = this.handleResetViewer.bind(this);
        this.handleTakeScreenshot = this.handleTakeScreenshot.bind(this);
        this.handleToggleOrbitControls = this.handleToggleOrbitControls.bind(this);
        this.handleToggleOrbitControlsAnimation =
            this.handleToggleOrbitControlsAnimation.bind(this);
        this.handleToggleAxes = this.handleToggleAxes.bind(this);
        this.onThreejsEditorModalHide = this.onThreejsEditorModalHide.bind(this);
        this.handleChemicalConnectivityFactorChange =
            this.handleChemicalConnectivityFactorChange.bind(this);
        this.handleToggleDistanceShown = this.handleToggleDistanceShown.bind(this);
        this.handleToggleAnglesShown = this.handleToggleAnglesShown.bind(this);
        this.handleSetState = this.handleSetState.bind(this);
        this.handleDeleteConnection = this.handleDeleteConnection.bind(this);
        this.handleResetMeasures = this.handleResetMeasures.bind(this);
        this.offMeasureParam = this.offMeasureParam.bind(this);
        this.onMeasureParam = this.onMeasureParam.bind(this);
        this.addHotKeyListener = this.addHotKeyListener.bind(this);
        this.removeHotKeyListener = this.removeHotKeyListener.bind(this);
    }

    componentDidMount() {
        this.addHotKeyListener();
    }

    componentWillUnmount() {
        this.handleResetMeasures();
        this.WaveComponent.wave.destroyListeners();
        this.removeHotKeyListener();
    }

    // TODO: update component to fully controlled or fully uncontrolled with a key?
    // https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops
    // eslint-disable-next-line no-unused-vars
    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        const { material } = nextProps;
        if (material) {
            this.setState({
                material: material.clone(),
                originalMaterial: material,
                boundaryConditions: nextProps.boundaryConditions || {},
                isConventionalCellShown: nextProps.isConventionalCellShown || false,
            });
        }
    }

    _resetStateWaveComponent() {
        // a workaround to re-render the component and update the buttons on clicks
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
    keyConfig = {
        [settings.hotKeysConfig.toggleOrbitControls]: this.handleToggleOrbitControls,
        [settings.hotKeysConfig.toggleInteractive]: this.handleToggleInteractive,
        [settings.hotKeysConfig.toggleBonds]: this.handleToggleBonds,
        [settings.hotKeysConfig.toggleConventionalCell]: this.handleToggleConventionalCell,
        [settings.hotKeysConfig.toggleLabels]: this.handleToggleLabels,
        [settings.hotKeysConfig.resetViewer]: this.handleResetViewer,
        [settings.hotKeysConfig.toggleThreejsEditorModal]: this.toggleThreejsEditorModal,
        [settings.hotKeysConfig.toggleDistanceShown]: this.handleToggleDistanceShown,
        [settings.hotKeysConfig.toggleAnglesShown]: this.handleToggleAnglesShown,
        [settings.hotKeysConfig.deleteConnection]: this.handleDeleteConnection,
    };

    addHotKeyListener() {
        document.addEventListener("keypress", this.handleKeyPress, true);
    }

    handleKeyPress = (e) => {
        const { isInteractive, isThreejsEditorModalShown } = this.state;

        // Check if interactive mode is off, or if the event originated from an input-like element
        if (
            !isInteractive ||
            e.target.closest(".cm-editor") ||
            ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.nodeName) ||
            isThreejsEditorModalShown
        ) {
            return;
        }

        const handler = this.keyConfig[e.key.toLowerCase()];
        if (handler) {
            handler.call(this);
        }
    };

    removeHotKeyListener() {
        document.removeEventListener("keypress", this.handleKeyPress);
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

    handleToggleLabels() {
        this.WaveComponent.wave.toggleLabels();
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
        this.handleResetMeasures();
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

    toggleThreejsEditorModal() {
        const { isThreejsEditorModalShown } = this.state;
        this.setState({ isThreejsEditorModalShown: !isThreejsEditorModalShown });
    }

    // TODO: reset the colors for other buttons in the panel on call to the function below
    handleResetViewer() {
        const { measuresSettings } = this.state;
        this.setState({
            measuresSettings: { ...measuresSettings, isDistanceShown: false, isAnglesShown: false },
        });
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

    handleDeleteConnection() {
        this.WaveComponent.wave.deleteConnection();
    }

    handleToggleDistanceShown() {
        const { measuresSettings } = this.state;
        const { isDistanceShown, isAnglesShown } = measuresSettings;
        if (isAnglesShown) {
            this.offMeasureParam("isAnglesShown");
        }

        if (!isDistanceShown) {
            this.onMeasureParam("isDistanceShown", "isAnglesShown");
        } else {
            this.offMeasureParam("isDistanceShown");
        }
    }

    handleResetMeasures() {
        const { measuresSettings } = this.state;
        const { isDistanceShown, isAnglesShown } = measuresSettings;
        if (isDistanceShown || isAnglesShown) this.WaveComponent.wave.resetMeasures();
    }

    offMeasureParam(param) {
        this.WaveComponent.wave.destroyListeners();
        this.handleResetMeasures();
        this.setState((prevState) => {
            const { measuresSettings } = prevState;
            return { ...prevState, measuresSettings: { ...measuresSettings, [param]: false } };
        });
    }

    onMeasureParam(param, offParam) {
        this.setState((prevState) => {
            const { measuresSettings } = prevState;
            return { ...prevState, measuresSettings: { ...measuresSettings, [param]: true } };
        });
        const { measuresSettings } = this.state;
        this.WaveComponent.wave.initListeners(this.handleSetState, {
            ...measuresSettings,
            [param]: true,
            [offParam]: false,
        });
    }

    handleToggleAnglesShown() {
        const { measuresSettings } = this.state;
        const { isAnglesShown, isDistanceShown } = measuresSettings;
        if (isDistanceShown) {
            this.offMeasureParam("isDistanceShown");
        }
        if (!isAnglesShown) {
            this.onMeasureParam("isAnglesShown", "isDistanceShown");
        } else {
            this.offMeasureParam("isAnglesShown");
        }
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
                settings={viewerSettings}
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

        return [
            {
                id: "rotate-zoom",
                disabled: false,
                content: "Rotate/Zoom [O]",
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
                content: "Bonds [B]",
                leftIcon: <Dehaze />,
                rightIcon: this.getCheckmark(this._getWaveProperty("isDrawBondsEnabled")),
                onClick: this.handleToggleBonds,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-cell",
                disabled: false,
                content: "Conventional Cell [C]",
                leftIcon: <FormatShapes />,
                rightIcon: this.getCheckmark(isConventionalCellShown),
                onClick: this.handleToggleConventionalCell,
                shouldMenuStayOpened: true,
            },
            {
                id: "toggle-labels",
                disabled: false,
                content: "Labels [L]",
                leftIcon: <Spellcheck />,
                rightIcon: this.getCheckmark(this._getWaveProperty("areLabelsShown")),
                onClick: this.handleToggleLabels,
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
                content: "Reset View [R]",
                leftIcon: <Replay />,
                onClick: this.handleResetViewer,
                shouldMenuStayOpened: true,
            },
        ];
    };

    getMeasurementsActions = () => {
        const { measuresSettings } = this.state;
        const { isDistanceShown, isAnglesShown } = measuresSettings;
        return [
            {
                id: "Distances",
                content: "Distances [D]",
                rightIcon: this.getCheckmark(isDistanceShown),
                leftIcon: <HeightIcon />,
                onClick: this.handleToggleDistanceShown,
                shouldMenuStayOpened: true,
            },
            {
                id: "Angles",
                content: "Angles [A]",
                rightIcon: this.getCheckmark(isAnglesShown),
                leftIcon: <LooksIcon />,
                onClick: this.handleToggleAnglesShown,
                shouldMenuStayOpened: true,
            },
            {
                id: "Delete",
                content: "Delete connection [X]",
                leftIcon: <DeleteIcon />,
                onClick: this.handleDeleteConnection,
                shouldMenuStayOpened: true,
            },
            {
                id: "divider-actions",
                isDivider: true,
            },
            {
                id: "Reset Measures",
                content: "Reset Measures",
                leftIcon: <Replay />,
                onClick: this.handleResetMeasures,
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
        if (editable) {
            toolbarConfig.splice(4, 0, {
                id: "3DEdit",
                title: "Edit [E]",
                leftIcon: <Edit />,
                onClick: this.toggleThreejsEditorModal,
            });
        }

        return toolbarConfig;
    }

    onThreejsEditorModalHide(material) {
        let { isThreejsEditorModalShown } = this.state;
        isThreejsEditorModalShown = !isThreejsEditorModalShown;
        if (material) {
            const { originalMaterial } = this.state;
            const { onUpdate } = this.props;
            // preserve lattice type
            material.lattice = {
                ...material.Lattice.toJSON(),
                type: originalMaterial.Lattice.type,
            };
            this.setState({
                originalMaterial: material,
                material: material.clone(),
                isThreejsEditorModalShown,
            });
            if (onUpdate) onUpdate(material);
        } else {
            this.setState({ isThreejsEditorModalShown });
        }
    }

    renderWaveOrThreejsEditorModal() {
        const { originalMaterial, isThreejsEditorModalShown } = this.state;

        if (isThreejsEditorModalShown) {
            return (
                <ThreejsEditorModal
                    show={isThreejsEditorModalShown}
                    onHide={this.onThreejsEditorModalHide}
                    materials={[originalMaterial]}
                    modalId="threejs-editor"
                />
            );
        }
        const { isInteractive } = this.state;

        return (
            <div style={{ position: "relative" }}>
                {this.renderCoverDiv()}
                <IconsToolbar
                    toolbarConfig={this.getToolbarConfig()}
                    isInteractive={isInteractive}
                    handleToggleInteractive={this.handleToggleInteractive}
                />
                {this.renderWaveComponent()}
            </div>
        );
    }

    render() {
        return (
            <ThemeProvider theme={DarkMaterialUITheme}>
                <ScopedCssBaseline enableColorScheme>
                    {this.renderWaveOrThreejsEditorModal()}
                </ScopedCssBaseline>
            </ThemeProvider>
        );
    }
}

ThreeDEditor.propTypes = {
    material: PropTypes.instanceOf(Made.Material).isRequired,
    editable: PropTypes.bool,
    isConventionalCellShown: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    boundaryConditions: PropTypes.object,
    onUpdate: PropTypes.func,
};

ThreeDEditor.defaultProps = {
    boundaryConditions: {},
    isConventionalCellShown: false,
    onUpdate: undefined,
    editable: false,
};
