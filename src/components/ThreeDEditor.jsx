/* eslint-disable react/sort-comp */
// import "../MuiClassNameSetup";

import NestedDropdown from "@exabyte-io/cove.js/dist/mui/components/nested-dropdown/NestedDropdown";
import ThemeProvider from "@exabyte-io/cove.js/dist/theme/provider";
import { Made } from "@exabyte-io/made.js";
import Article from "@mui/icons-material/Article";
import Autorenew from "@mui/icons-material/Autorenew";
import BubbleChart from "@mui/icons-material/BubbleChart";
import CheckIcon from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
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
import PowerSettingsNew from "@mui/icons-material/PowerSettingsNew";
import RemoveRedEye from "@mui/icons-material/RemoveRedEye";
import Replay from "@mui/icons-material/Replay";
import Spellcheck from "@mui/icons-material/Spellcheck";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import SwitchCamera from "@mui/icons-material/SwitchCamera";
import ThreeDRotation from "@mui/icons-material/ThreeDRotation";
import ButtonGroup from "@mui/material/ButtonGroup";
import { StyledEngineProvider } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import setClass from "classnames";
import $ from "jquery";
import PropTypes from "prop-types";
import React from "react";

import settings from "../settings";
import { exportToDisk } from "../utils";
import { SquareIconButton } from "./SquareIconButton";
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
    }

    componentWillUnmount() {
        this.handleResetMeasures();
        this.WaveComponent.wave.destroyListeners();
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

    handleDownloadClick() {
        const { originalMaterial } = this.state;
        exportToDisk(originalMaterial.getAsPOSCAR(), originalMaterial.name, "poscar");
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

    getParametersToolbarItems() {
        const { viewerSettings } = this.state;
        return [
            <Tooltip key="RADIUS" title="RADIUS" placement="top" disableInteractive>
                <input
                    className="inverse stepper sphere-radius"
                    id="sphere-radius"
                    value={viewerSettings.atomRadiiScale}
                    type="number"
                    max="10"
                    min="0.1"
                    step="0.1"
                    onChange={this.handleSphereRadiusChange}
                />
            </Tooltip>,

            <Tooltip key="A" title="A" placement="top" disableInteractive>
                <input
                    className="inverse stepper cell-repetitions"
                    id="repetitionsAlongLatticeVectorA"
                    value={viewerSettings.repetitionsAlongLatticeVectorA}
                    type="number"
                    max="10"
                    min="1"
                    step="1"
                    onChange={this.handleCellRepetitionsChange}
                />
            </Tooltip>,

            <Tooltip key="B" title="B" placement="top" disableInteractive>
                <input
                    className="inverse stepper cell-repetitions"
                    id="repetitionsAlongLatticeVectorB"
                    value={viewerSettings.repetitionsAlongLatticeVectorB}
                    type="number"
                    max="10"
                    min="1"
                    step="1"
                    onChange={this.handleCellRepetitionsChange}
                />
            </Tooltip>,

            <Tooltip key="C" title="C" placement="top" disableInteractive>
                <input
                    className="inverse stepper cell-repetitions"
                    id="repetitionsAlongLatticeVectorC"
                    value={viewerSettings.repetitionsAlongLatticeVectorC}
                    type="number"
                    max="10"
                    min="1"
                    step="1"
                    onChange={this.handleCellRepetitionsChange}
                />
            </Tooltip>,

            <Tooltip
                key="CHEMICAL_CONNECTIVITY_FACTOR"
                title="CHEMICAL CONNECTIVITY FACTOR"
                placement="top"
                disableInteractive
            >
                <input
                    className="inverse stepper cell-repetitions"
                    id="chemical-connectivity-factor"
                    value={viewerSettings.chemicalConnectivityFactor}
                    type="number"
                    max="2"
                    min="0"
                    step="0.01"
                    onChange={this.handleChemicalConnectivityFactorChange}
                />
            </Tooltip>,
        ];
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
            return <CheckIcon style={{ color: "green" }} />;
        }
        return <CheckIcon style={{ color: "grey" }} />;
    }

    renderToolbar() {
        // TODO: create a separate component for toolbar and pass this configs to it
        const { isInteractive } = this.state;
        const { viewerSettings } = this.state;
        const { measuresSettings } = this.state;
        const { isDistanceShown, isAnglesShown } = measuresSettings;

        const { isConventionalCellShown } = this.state;
        const viewSettingsActions = [
            {
                id: "rotate-zoom",
                disabled: false,
                content: "Rotate/Zoom View [O]",
                leftIcon: <ThreeDRotation />,
                rightIcon: this.getCheckmark(this._getWaveProperty("areOrbitControlsEnabled")),
                onClick: this.handleToggleOrbitControls,
            },
            {
                id: "auto-rotate",
                disabled: false,
                content: "Toggle Auto Rotate",
                leftIcon: <Autorenew />,
                rightIcon: this.getCheckmark(
                    this._getWaveProperty("isOrbitControlsAnimationEnabled"),
                ),
                onClick: this.handleToggleOrbitControlsAnimation,
            },
            {
                id: "toggle-axes",
                disabled: false,
                content: "Toggle Axes",
                leftIcon: <GpsFixed />,
                rightIcon: this.getCheckmark(this._getWaveProperty("areAxesEnabled")),
                onClick: this.handleToggleAxes,
            },
            {
                id: "toggle-camera",
                disabled: false,
                content: "Toggle Orthographic Camera",
                leftIcon: <SwitchCamera />,
                rightIcon: this.getCheckmark(this._getWaveProperty("isCameraOrthographic")),
                onClick: this.handleToggleOrthographicCamera,
            },
            {
                id: "toggle-bonds",
                disabled: false,
                content: "Toggle Bonds",
                leftIcon: <Dehaze />,
                rightIcon: this.getCheckmark(this._getWaveProperty("isDrawBondsEnabled")),
                onClick: this.handleToggleBonds,
            },
            {
                id: "toggle-cell",
                disabled: false,
                content: "Toggle Conventional Cell",
                leftIcon: <FormatShapes />,
                rightIcon: this.getCheckmark(isConventionalCellShown),
                onClick: this.handleToggleConventionalCell,
            },
            {
                id: "toggle-labels",
                disabled: false,
                content: "Toggle Labels",
                leftIcon: <Spellcheck />,
                rightIcon: this.getCheckmark(this._getWaveProperty("areLabelsShown")),
                onClick: this.handleToggleLabels,
            },
            {
                id: "toggle-view-adjustment",
                disabled: false,
                content: "Toggle View Adjustment",
                leftIcon: <ControlCameraRounded />,
                rightIcon: this.getCheckmark(viewerSettings.isViewAdjustable),
                onClick: this.handleToggleIsViewAdjustable,
            },
            {
                id: "divider",
                isDivider: true,
            },
            {
                id: "reset-view",
                disabled: false,
                content: "Reset View",
                leftIcon: <Replay />,
                onClick: this.handleResetViewer,
            },
        ];

        const measurementsActions = [
            {
                id: "Distance",
                content: "Distance",
                rightIcon: this.getCheckmark(isDistanceShown),
                leftIcon: <HeightIcon />,
                onClick: this.handleToggleDistanceShown,
            },
            {
                id: "Angles",
                content: "Angles",
                rightIcon: this.getCheckmark(isAnglesShown),
                leftIcon: <LooksIcon />,
                onClick: this.handleToggleAnglesShown,
            },
            {
                id: "Delete",
                content: "Delete connection",
                leftIcon: <DeleteIcon />,
                onClick: this.handleDeleteConnection,
            },
            {
                id: "Divider",
                isDivider: true,
            },
            {
                id: "Reset Measures",
                content: "Reset Measures",
                leftIcon: <Replay />,
                onClick: this.handleResetMeasures,
            },
        ];

        const downloadActions = [
            {
                id: "JSON",
                title: "JSON",
                content: "JSON",
                leftIcon: <Article />,
                onClick: () => {
                    console.log("Download JSON");
                },
            },
            {
                id: "POSCAR",
                title: "POSCAR",
                content: "POSCAR",
                leftIcon: <Article />,
                onClick: this.handleDownloadClick,
            },
        ];

        const exportActions = [
            {
                key: "Screenshot",
                title: "Screenshot",
                content: "Screenshot",
                leftIcon: <PictureInPicture />,
                onClick: this.handleTakeScreenshot,
            },
            {
                key: "Download",
                title: "Download",
                content: "Download",
                leftIcon: <CloudDownload />,
                actions: downloadActions,
                onClick: this.handleDownloadClick,
            },
        ];

        const toolbarConfig = [
            {
                id: "view-settings",
                title: "View Settings",
                header: "View Settings",
                leftIcon: <RemoveRedEye />,
                actions: viewSettingsActions,
            },
            {
                id: "parameters",
                title: "Parameters",
                header: "Parameters",
                leftIcon: <BubbleChart />,
                objectContent: this.getParametersToolbarItems,
            },
            {
                id: "measurements",
                title: "Measurements",
                header: "Measurements",
                leftIcon: <SquareFootIcon />,
                actions: measurementsActions,
            },
            {
                id: "edit",
                title: "Edit",
                leftIcon: <Edit />,
                onClick: this.toggleThreejsEditorModal,
            },
            {
                id: "export",
                title: "Export",
                leftIcon: <ImportExport />,
                actions: exportActions,
            },
        ];

        return (
            <div style={{ position: "absolute", top: "50px", left: "50px", maxWidth: "320px" }}>
                <ButtonGroup orientation="vertical">
                    <SquareIconButton title="Interactive" onClick={this.handleToggleInteractive}>
                        {isInteractive ? <Close /> : <PowerSettingsNew />}
                    </SquareIconButton>
                    {isInteractive &&
                        toolbarConfig.map((config) => {
                            if (config.actions) {
                                return (
                                    <NestedDropdown
                                        // eslint-disable-next-line react/jsx-props-no-spreading
                                        {...config}
                                    >
                                        <SquareIconButton
                                            key={config.key}
                                            title={config.title}
                                            onClick={() => {}}
                                        >
                                            {config.leftIcon}
                                        </SquareIconButton>
                                    </NestedDropdown>
                                );
                            }
                            const { key, title, onClick, leftIcon } = config;
                            return (
                                <SquareIconButton key={key} title={title} onClick={onClick}>
                                    {leftIcon}
                                </SquareIconButton>
                            );
                        })}
                </ButtonGroup>
            </div>
        );
    }

    /** Helper to construct a compound CSS classname based on interactivity state */
    getThreeDEditorClassNames() {
        const { isInteractive } = this.state;
        const isInteractiveCls = isInteractive ? "" : "non-interactive";
        return setClass("materials-designer-3d-editor", isInteractiveCls);
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

        // eslint-disable-next-line no-unused-vars
        const { editable } = this.props;
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
        return (
            <div className={this.getThreeDEditorClassNames()}>
                {this.renderCoverDiv()}
                {this.renderToolbar()}
                {this.renderWaveComponent()}
            </div>
        );
    }

    render() {
        // eslint-disable-next-line no-unused-vars
        const { isInteractive } = this.state;
        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider>{this.renderWaveOrThreejsEditorModal()}</ThemeProvider>
            </StyledEngineProvider>
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
