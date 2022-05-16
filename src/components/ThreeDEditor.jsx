/* eslint-disable react/sort-comp */
import { Made } from "@exabyte-io/made.js";
import { createGenerateClassName, Tooltip } from "@material-ui/core";
import Autorenew from "@material-ui/icons/Autorenew";
import BubbleChart from "@material-ui/icons/BubbleChart";
import CloudDownload from "@material-ui/icons/CloudDownload";
import Edit from "@material-ui/icons/Edit";
import FormatShapes from "@material-ui/icons/FormatShapes";
import GpsFixed from "@material-ui/icons/GpsFixed";
import ImportExport from "@material-ui/icons/ImportExport";
import Menu from "@material-ui/icons/Menu";
import NotInterested from "@material-ui/icons/NotInterested";
import PictureInPicture from "@material-ui/icons/PictureInPicture";
import PowerSettingsNew from "@material-ui/icons/PowerSettingsNew";
import RemoveRedEye from "@material-ui/icons/RemoveRedEye";
import Replay from "@material-ui/icons/Replay";
import Spellcheck from "@material-ui/icons/Spellcheck";
import SwitchCamera from "@material-ui/icons/SwitchCamera";
import ThreeDRotation from "@material-ui/icons/ThreeDRotation";
import setClass from "classnames";
import $ from "jquery";
import PropTypes from "prop-types";
import React from "react";
import { JssProvider } from "react-jss";

import settings from "../settings";
import { exportToDisk } from "../utils";
import { IconToolbar } from "./IconToolbar";
import { RoundIconButton } from "./RoundIconButton";
import { ThreejsEditorModal } from "./ThreejsEditorModal";
import { WaveComponent } from "./WaveComponent";

/**
 * This is to avoid class name conflicts when the component is used inside other material-ui dependent components.
 * See https://material-ui.com/customization/css-in-js/#creategenerateclassname-options-class-name-generator for more information.
 */
const generateClassName = createGenerateClassName({ productionPrefix: "wave" });

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
            isThreejsEditorModalShown: false,
            // TODO: remove the need for `viewerTriggerResize`
            // whether to trigger resize
            viewerTriggerResize: false,
            // Settings of the wave viewer
            viewerSettings: {
                atomRadiiScale: settings.atomRadiiScale,
                repetitions: settings.repetitions,
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
        this.handleToggleBonds = this.handleToggleBonds.bind(this);
        this.toggleThreejsEditorModal = this.toggleThreejsEditorModal.bind(this);
        this.handleToggleOrthographicCamera = this.handleToggleOrthographicCamera.bind(this);
        this.handleToggleLabels = this.handleToggleLabels.bind(this);
        this.handleToggleConventionalCell = this.handleToggleConventionalCell.bind(this);
        this.handleResetViewer = this.handleResetViewer.bind(this);
        this.handleTakeScreenshot = this.handleTakeScreenshot.bind(this);
        this.handleToggleOrbitControls = this.handleToggleOrbitControls.bind(this);
        this.handleToggleOrbitControlsAnimation =
            this.handleToggleOrbitControlsAnimation.bind(this);
        this.handleToggleAxes = this.handleToggleAxes.bind(this);
        this.onThreejsEditorModalHide = this.onThreejsEditorModalHide.bind(this);
        this.handleChemicalConnectivityFactorChange =
            this.handleChemicalConnectivityFactorChange.bind(this);
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
        this.handleSetSetting({ repetitions: parseFloat($(e.target).val()) });
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
        const primitiveOrConventionalMaterial = isConventionalCellShown
            ? material.getACopyWithConventionalCell()
            : material.clone();
        return primitiveOrConventionalMaterial;
    }

    handleToggleConventionalCell() {
        const { isConventionalCellShown, originalMaterial } = this.state;
        this.setState({
            isConventionalCellShown: !isConventionalCellShown,
            originalMaterial: this.getPrimitiveOrConventionalMaterial(
                originalMaterial,
                !isConventionalCellShown,
            ),
        });
    }

    handleDownloadClick() {
        const { originalMaterial } = this.state;
        exportToDisk(originalMaterial.getAsPOSCAR(), originalMaterial.name, "poscar");
    }

    handleToggleInteractive() {
        const { isInteractive } = this.state;
        this.setState({ isInteractive: !isInteractive });
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

    // eslint-disable-next-line class-methods-use-this
    get classNamesForTopToolbar() {
        return "buttons-toolbar buttons-toolbar-top pull-left";
    }

    // eslint-disable-next-line class-methods-use-this
    get classNamesForBottomToolbar() {
        return "buttons-toolbar buttons-toolbar-bottom pull-left";
    }

    /**
     * ON/OFF switch button
     */
    renderInteractiveSwitch() {
        const { isInteractive } = this.state;
        return (
            <div className={setClass(this.classNamesForTopToolbar)} data-name="Interactive">
                <RoundIconButton
                    tooltipPlacement="top"
                    title="Interactive"
                    isToggled={isInteractive}
                    onClick={this.handleToggleInteractive}
                >
                    {isInteractive ? <NotInterested /> : <PowerSettingsNew />}
                </RoundIconButton>
            </div>
        );
    }

    /**
     * Items for Export toolbar
     */
    getExportToolbarItems() {
        return [
            <RoundIconButton
                key="Screenshot"
                tooltipPlacement="top"
                title="Screenshot"
                isToggleable={false}
                onClick={this.handleTakeScreenshot}
            >
                <PictureInPicture />
            </RoundIconButton>,

            <RoundIconButton
                key="Download"
                tooltipPlacement="top"
                title="Download"
                isToggleable={false}
                onClick={this.handleDownloadClick}
            >
                <CloudDownload />
            </RoundIconButton>,
        ];
    }

    renderExportToolbar(className = "") {
        const { isInteractive } = this.state;
        return (
            <IconToolbar
                className={className}
                title="Export"
                iconComponent={ImportExport}
                isHidden={!isInteractive}
            >
                {this.getExportToolbarItems()}
            </IconToolbar>
        );
    }

    /**
     * Items for View toolbar
     */
    getViewToolbarItems() {
        const { isConventionalCellShown } = this.state;
        return [
            <RoundIconButton
                key="Rotate/Zoom View [O]"
                tooltipPlacement="top"
                isToggled={this._getWaveProperty("areOrbitControlsEnabled")}
                title="Rotate/Zoom View [O]"
                onClick={this.handleToggleOrbitControls}
            >
                <ThreeDRotation />
            </RoundIconButton>,

            <RoundIconButton
                key="Toggle Auto Rotate"
                tooltipPlacement="top"
                isToggled={this._getWaveProperty("isOrbitControlsAnimationEnabled")}
                title="Toggle Auto Rotate"
                onClick={this.handleToggleOrbitControlsAnimation}
            >
                <Autorenew />
            </RoundIconButton>,

            <RoundIconButton
                key="Toggle Axes"
                tooltipPlacement="top"
                isToggled={this._getWaveProperty("areAxesEnabled")}
                title="Toggle Axes"
                onClick={this.handleToggleAxes}
            >
                <GpsFixed />
            </RoundIconButton>,

            <RoundIconButton
                key="Toggle Orthographic Camera"
                tooltipPlacement="top"
                title="Toggle Orthographic Camera"
                isToggled={this._getWaveProperty("isCameraOrthographic")}
                onClick={this.handleToggleOrthographicCamera}
            >
                <SwitchCamera />
            </RoundIconButton>,

            <RoundIconButton
                key="Toggle Bonds"
                tooltipPlacement="top"
                title="Toggle Bonds"
                isToggled={this._getWaveProperty("isDrawBondsEnabled")}
                onClick={this.handleToggleBonds}
            >
                <Menu />
            </RoundIconButton>,

            <RoundIconButton
                key="Toggle Conventional Cell"
                tooltipPlacement="top"
                title="Toggle Conventional Cell"
                isToggled={isConventionalCellShown}
                onClick={this.handleToggleConventionalCell}
            >
                <FormatShapes />
            </RoundIconButton>,

            <RoundIconButton
                key="Toggle Labels"
                tooltipPlacement="top"
                title="Toggle Labels"
                isToggled={this._getWaveProperty("areLabelsShown")}
                onClick={this.handleToggleLabels}
            >
                <Spellcheck />
            </RoundIconButton>,

            <RoundIconButton
                key="Reset View"
                tooltipPlacement="top"
                title="Reset View"
                isToggleable={false}
                onClick={this.handleResetViewer}
            >
                <Replay />
            </RoundIconButton>,
        ];
    }

    renderViewToolbar(className = "") {
        const { isInteractive } = this.state;
        return (
            <IconToolbar
                className={className}
                title="View"
                iconComponent={RemoveRedEye}
                isHidden={!isInteractive}
            >
                {this.getViewToolbarItems()}
            </IconToolbar>
        );
    }

    getParametersToolbarItems() {
        const { viewerSettings } = this.state;
        return [
            <Tooltip key="RADIUS" title="RADIUS" placement="top">
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

            <Tooltip key="REPETITIONS" title="REPETITIONS" placement="top">
                <input
                    className="inverse stepper cell-repetitions"
                    id="cell-repetitions"
                    value={viewerSettings.repetitions}
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

    renderParametersToolbar(className = "") {
        const { isInteractive } = this.state;
        return (
            <IconToolbar
                className={className}
                title="Parameters"
                iconComponent={BubbleChart}
                isHidden={!isInteractive}
            >
                {this.getParametersToolbarItems()}
            </IconToolbar>
        );
    }

    render3DEditToggle(className = "") {
        const { isInteractive } = this.state;
        return (
            <div className={setClass(className, { hidden: !isInteractive })} data-name="3DEdit">
                <RoundIconButton
                    key="3D Editor"
                    tooltipPlacement="top"
                    title="3D Editor"
                    onClick={this.toggleThreejsEditorModal}
                >
                    <Edit />
                </RoundIconButton>
            </div>
        );
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
                structure={materialCopy}
                boundaryConditions={boundaryConditions}
                cell={materialCopy.Lattice.unitCell}
                name={materialCopy.name}
                settings={viewerSettings}
            />
        );
    }

    /**
     * Helper to produce RoundIconButton
     * TODO: adjust the code above to use this
     * */
    // eslint-disable-next-line react/no-unused-class-component-methods, class-methods-use-this
    getRoundIconButton(title, tooltipPlacement, onClick, icon) {
        return (
            <RoundIconButton
                tooltipPlacement={tooltipPlacement}
                title={title}
                isToggleable={false}
                onClick={onClick}
            >
                {icon}
            </RoundIconButton>
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
                {this.renderInteractiveSwitch()}
                {this.renderWaveComponent()}
                {this.renderViewToolbar(this.classNamesForTopToolbar + " second-row")}
                {this.renderParametersToolbar(this.classNamesForTopToolbar + " third-row")}
                {editable && this.render3DEditToggle(this.classNamesForTopToolbar + " fourth-row")}
                {this.renderExportToolbar(this.classNamesForBottomToolbar)}
            </div>
        );
    }

    render() {
        return (
            <JssProvider generateClassName={generateClassName}>
                {this.renderWaveOrThreejsEditorModal()}
            </JssProvider>
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
