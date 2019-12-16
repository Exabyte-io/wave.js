import $ from 'jquery';
import React from 'react';
import setClass from "classnames";
import Tooltip from "material-ui-next/Tooltip";
import JssProvider from 'react-jss/lib/JssProvider';
import {createGenerateClassName} from "material-ui-next/styles";

import {
    NotInterested, ImportExport, RemoveRedEye,
    Replay, PictureInPicture, PowerSettingsNew,
    FileDownload, ThreeDRotation, Autorenew,
    GpsFixed, Edit, SwitchCamera, FormatShapes,
    Menu, BubbleChart, Spellcheck
} from 'material-ui-icons-next';

import settings from "../settings";
import {exportToDisk} from "../utils";
import {IconToolbar} from "./IconToolbar";
import {WaveComponent} from './WaveComponent';
import {RoundIconButton} from "./RoundIconButton";

import {ThreejsEditorModal} from "./ThreejsEditorModal";

/**
 * This is to avoid class name conflicts when the component is used inside other material-ui dependent components.
 * See https://material-ui.com/customization/css-in-js/#creategenerateclassname-options-class-name-generator for more information.
 */
const generateClassName = createGenerateClassName({productionPrefix: 'wave'});

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
                chemicalConnectivityFactor: settings.chemicalConnectivityFactor
            },
            boundaryConditions: this.props.boundaryConditions || {},
            isConventionalCellShown: this.props.isConventionalCellShown || false,
            // material that is originally passed to the component and can be modified in ThreejsEditorModal component.
            originalMaterial: this.props.material,
            // material that is passed to WaveComponent to be visualized and may have repetition and radius adjusted.
            material: this.props.material.clone(),
        };
        this.handleCellRepetitionsChange = this.handleCellRepetitionsChange.bind(this);
        this.handleSphereRadiusChange = this.handleSphereRadiusChange.bind(this);
        this.handleDownloadClick = this.handleDownloadClick.bind(this);
        this.handleToggleInteractive = this.handleToggleInteractive.bind(this);
        this.handleToggleBonds = this.handleToggleBonds.bind(this);
        this.handleToggleLabels = this.handleToggleLabels.bind(this);
        this.toggleThreejsEditorModal = this.toggleThreejsEditorModal.bind(this);
        this.handleToggleOrthographicCamera = this.handleToggleOrthographicCamera.bind(this);
        this.handleToggleConventionalCell = this.handleToggleConventionalCell.bind(this);
        this.handleResetViewer = this.handleResetViewer.bind(this);
        this.handleTakeScreenshot = this.handleTakeScreenshot.bind(this);
        this.handleToggleOrbitControls = this.handleToggleOrbitControls.bind(this);
        this.handleToggleOrbitControlsAnimation = this.handleToggleOrbitControlsAnimation.bind(this);
        this.handleToggleAxes = this.handleToggleAxes.bind(this);
        this.onThreejsEditorModalHide = this.onThreejsEditorModalHide.bind(this);
        this.handleChemicalConnectivityFactorChange = this.handleChemicalConnectivityFactorChange.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const material = nextProps.material;
        if (material) {
            this.setState({
                originalMaterial: material,
                material: material.clone(),
                boundaryConditions: nextProps.boundaryConditions || {},
                isConventionalCellShown: nextProps.isConventionalCellShown || false,
            })
        }
    }

    _resetStateWaveComponent() {
        // a workaround to re-render the component and update the buttons on clicks
        this.setState({wave: this.WaveComponent.wave});
    }

    handleSetSetting = (setting) => {
        this.setState({
            viewerSettings: {
                ...this.state.viewerSettings,
                ...setting
            }
        });

    };

    handleCellRepetitionsChange(e) {
        this.handleSetSetting({repetitions: parseFloat($(e.target).val())});
    }

    handleSphereRadiusChange(e) {
        this.handleSetSetting({atomRadiiScale: parseFloat($(e.target).val())})
    }

    handleToggleOrthographicCamera(e) {
        this.WaveComponent.wave.toggleOrthographicCamera();
        this._resetStateWaveComponent();
    }

    handleChemicalConnectivityFactorChange(e) {
        this.handleSetSetting({chemicalConnectivityFactor: parseFloat($(e.target).val())});
    }

    getPrimitiveOrConventionalMaterial(material, isConventionalCellShown = false) {
        return isConventionalCellShown ? material.getACopyWithConventionalCell() : material.clone();
    }

    handleToggleConventionalCell(e) {
        this.setState({
            isConventionalCellShown: !this.state.isConventionalCellShown,
            material: this.getPrimitiveOrConventionalMaterial(this.state.originalMaterial, !this.state.isConventionalCellShown)
        });
    }

    handleDownloadClick(e) {
        const material = this.state.originalMaterial;
        exportToDisk(material.getAsPOSCAR(), material.name, 'poscar')
    }

    handleToggleInteractive(e) {
        this.setState({isInteractive: !this.state.isInteractive})
    }

    handleToggleBonds(e) {
        const wave = this.WaveComponent.wave;
        wave.isDrawBondsEnabled = !wave.isDrawBondsEnabled; // toggle value;
        this._resetStateWaveComponent();
    }

    //for atom labels 
    handleToggleLabels(e) {
        const wave = this.WaveComponent.wave;
        wave.isDrawLabelsEnabled = !wave.isDrawLabelsEnabled; // toggle value;
        this._resetStateWaveComponent();
    }

    toggleThreejsEditorModal(e) {
        this.setState({isThreejsEditorModalShown: !this.state.isThreejsEditorModalShown});
    }

    // TODO: reset the colors for other buttons in the panel on call to the function below
    handleResetViewer(e) {
        this.WaveComponent.initViewer();
        this._resetStateWaveComponent();
    }

    handleTakeScreenshot(e) {this.WaveComponent.wave.takeScreenshot()}

    handleToggleOrbitControls(e) {
        this.WaveComponent.wave.toggleOrbitControls();
        this._resetStateWaveComponent();
    }

    handleToggleOrbitControlsAnimation(e) {
        this.WaveComponent.wave.toggleOrbitControlsAnimation();
        this._resetStateWaveComponent();
    }

    handleToggleAxes(e) {
        this.WaveComponent.wave.toggleAxes();
        this._resetStateWaveComponent();
    }

    _getWaveProperty(name) {return this.WaveComponent && this.WaveComponent.wave[name]}

    /**
     * Returns a cover div to cover the area and prevent user interaction with component
     */
    renderCoverDiv() {
        const style = {
            position: 'absolute',
            height: '100%',
            width: '100%',
        };
        if (this.state.isInteractive) style.display = 'none';
        return <div className="atom-view-cover" style={style}/>
    }

    get classNamesForTopToolbar() {return "buttons-toolbar buttons-toolbar-top pull-left"}

    get classNamesForBottomToolbar() {return "buttons-toolbar buttons-toolbar-bottom pull-left"}

    /**
     * ON/OFF switch button
     */
    renderInteractiveSwitch() {
        return (
            <div className={setClass(this.classNamesForTopToolbar)}
                data-name="Interactive"
            >
                <RoundIconButton tooltipPlacement="top" mini
                    title="Interactive"
                    isToggled={this.state.isInteractive}
                    onClick={this.handleToggleInteractive}
                >
                    {this.state.isInteractive ? <NotInterested/> : <PowerSettingsNew/>}
                </RoundIconButton>
            </div>
        )
    }

    /**
     * Items for Export toolbar
     */
    getExportToolbarItems() {
        return [
            <RoundIconButton key="Screenshot" tooltipPlacement="top" mini
                title="Screenshot"
                isToggleable={false}
                onClick={this.handleTakeScreenshot}
            >
                <PictureInPicture/>
            </RoundIconButton>,

            <RoundIconButton key="Download" tooltipPlacement="top" mini
                title="Download"
                isToggleable={false}
                onClick={this.handleDownloadClick}
            >
                <FileDownload/>
            </RoundIconButton>
        ]
    }

    renderExportToolbar(className = "") {
        return (
            <IconToolbar
                className={className}
                title="Export"
                iconComponent={ImportExport}
                isHidden={!this.state.isInteractive}
            >
                {this.getExportToolbarItems()}
            </IconToolbar>
        )
    }

    /**
     * Items for View toolbar
     */
    getViewToolbarItems() {
        return [
            <RoundIconButton key="Rotate/Zoom View [O]" tooltipPlacement="top" mini
                isToggled={this._getWaveProperty('areOrbitControlsEnabled')}
                title="Rotate/Zoom View [O]"
                onClick={this.handleToggleOrbitControls}
            >
                <ThreeDRotation/>
            </RoundIconButton>,

            <RoundIconButton key="Toggle Auto Rotate" tooltipPlacement="top" mini
                isToggled={this._getWaveProperty('isOrbitControlsAnimationEnabled')}
                title="Toggle Auto Rotate"
                onClick={this.handleToggleOrbitControlsAnimation}
            >
                <Autorenew/>
            </RoundIconButton>,

            <RoundIconButton key="Toggle Axes" tooltipPlacement="top" mini
                isToggled={this._getWaveProperty('areAxesEnabled')}
                title="Toggle Axes"
                onClick={this.handleToggleAxes}
            >
                <GpsFixed/>
            </RoundIconButton>,

            <RoundIconButton key="Toggle Orthographic Camera" tooltipPlacement="top" mini
                title="Toggle Orthographic Camera"
                isToggled={this._getWaveProperty('isCameraOrthographic')}
                onClick={this.handleToggleOrthographicCamera}
            >
                <SwitchCamera/>
            </RoundIconButton>,

            <RoundIconButton key="Toggle Bonds" tooltipPlacement="top" mini
                title="Toggle Bonds"
                isToggled={this._getWaveProperty('isDrawBondsEnabled')}
                onClick={this.handleToggleBonds}
            >
                <Menu/>
            </RoundIconButton>,

            <RoundIconButton key="Toggle Conventional Cell" tooltipPlacement="top" mini
                title="Toggle Conventional Cell"
                isToggled={this.state.isConventionalCellShown}
                onClick={this.handleToggleConventionalCell}
            >
                <FormatShapes/>
            </RoundIconButton>,

            <RoundIconButton key="Toggle Labels" tooltipPlacement="top" mini
                title="Toggle Labels"
                isToggled={this._getWaveProperty('isDrawLabelsEnabled')}
                onClick={this.handleToggleLabels}
            >
                <Spellcheck/>
            </RoundIconButton>,

            <RoundIconButton key="Reset View" tooltipPlacement="top" mini
                title="Reset View"
                isToggleable={false}
                onClick={this.handleResetViewer}
            >
                <Replay/>
            </RoundIconButton>,
        ]
    }

    renderViewToolbar(className = "") {
        return (
            <IconToolbar
                className={className}
                title="View"
                iconComponent={RemoveRedEye}
                isHidden={!this.state.isInteractive}
            >
                {this.getViewToolbarItems()}
            </IconToolbar>
        )
    }

    getParametersToolbarItems() {
        return [

            <Tooltip key="RADIUS" title="RADIUS" placement="top">
                <input className="inverse stepper sphere-radius"
                    id="sphere-radius"
                    value={this.state.viewerSettings.atomRadiiScale}
                    type="number" max="10" min="0.1" step="0.1"
                    onChange={this.handleSphereRadiusChange}
                />
            </Tooltip>,

            <Tooltip key="REPETITIONS" title="REPETITIONS" placement="top">
                <input className="inverse stepper cell-repetitions"
                    id="cell-repetitions"
                    value={this.state.viewerSettings.repetitions}
                    type="number" max="10" min="1" step="1"
                    onChange={this.handleCellRepetitionsChange}
                />
            </Tooltip>,

            <Tooltip key="CHEMICAL_CONNECTIVITY_FACTOR" title="CHEMICAL CONNECTIVITY FACTOR" placement="top">
                <input className="inverse stepper cell-repetitions"
                    id="chemical-connectivity-factor"
                    value={this.state.viewerSettings.chemicalConnectivityFactor}
                    type="number" max="2" min="0" step="0.01"
                    onChange={this.handleChemicalConnectivityFactorChange}
                />
            </Tooltip>

        ]
    }

    renderParametersToolbar(className = "") {
        return (
            <IconToolbar
                className={className}
                title="Parameters"
                iconComponent={BubbleChart}
                isHidden={!this.state.isInteractive}
            >
                {this.getParametersToolbarItems()}
            </IconToolbar>
        )
    }

    render3DEditToggle(className = "") {
        return (
            <div className={setClass(className, {'hidden': !this.state.isInteractive})}
                data-name="3DEdit"
            >
                <RoundIconButton key="3D Editor" tooltipPlacement="top" mini
                    title="3D Editor"
                    onClick={this.toggleThreejsEditorModal}
                >
                    <Edit/>
                </RoundIconButton>
            </div>
        )
    }

    renderWaveComponent() {
        const material = this.getPrimitiveOrConventionalMaterial(this.state.material, this.state.isConventionalCellShown);
        return <WaveComponent
            ref={(el) => {this.WaveComponent = el}}
            triggerHandleResize={this.state.viewerTriggerResize}
            structure={material}
            boundaryConditions={this.state.boundaryConditions}
            cell={material.Lattice.unitCell}
            name={this.state.material.name}
            settings={this.state.viewerSettings}
        />
    }

    /**
     * Helper to produce RoundIconButton
     * TODO: adjust the code above to use this
     * */
    getRoundIconButton(title, tooltipPlacement, onClick, icon) {
        return <RoundIconButton tooltipPlacement={tooltipPlacement} mini
            title={title}
            isToggleable={false}
            onClick={onClick}
        >
            {icon}
        </RoundIconButton>
    }

    /** Helper to construct a compound CSS classname based on interactivity state */
    getThreeDEditorClassNames() {
        const isInteractiveCls = this.state.isInteractive ? "" : "non-interactive";
        return setClass('materials-designer-3d-editor', isInteractiveCls);
    }

    onThreejsEditorModalHide(material) {
        if (!material || material.hash === this.state.originalMaterial.hash) {
            this.setState({isThreejsEditorModalShown: !this.state.isThreejsEditorModalShown});
        } else {
            // preserve lattice type
            material.lattice = {
                ...material.Lattice.toJSON(),
                type: this.state.originalMaterial.Lattice.type
            };
            this.setState({
                material: material.clone(),
                originalMaterial: material,
                isThreejsEditorModalShown: !this.state.isThreejsEditorModalShown
            });
            this.props.onUpdate && this.props.onUpdate(material);
        }
    }

    renderWaveOrThreejsEditorModal() {
        if (this.state.isThreejsEditorModalShown) {
            return <ThreejsEditorModal
                show={this.state.isThreejsEditorModalShown}
                onHide={this.onThreejsEditorModalHide}
                materials={[this.state.originalMaterial]}
                modalId="threejs-editor"
            />
        } else {
            return <div className={this.getThreeDEditorClassNames()}
            >
                {this.renderCoverDiv()}
                {this.renderInteractiveSwitch()}
                {this.renderWaveComponent()}
                {this.renderViewToolbar(this.classNamesForTopToolbar + " second-row")}
                {this.renderParametersToolbar(this.classNamesForTopToolbar + " third-row")}
                {this.props.editable && this.render3DEditToggle(this.classNamesForTopToolbar + " fourth-row")}
                {this.renderExportToolbar(this.classNamesForBottomToolbar)}
            </div>;
        }
    }

    render() {
        return (
            <JssProvider generateClassName={generateClassName}>
                {this.renderWaveOrThreejsEditorModal()}
            </JssProvider>
        )
    }
}

ThreeDEditor.propTypes = {
    material: React.PropTypes.object,
    isConventionalCellShown: React.PropTypes.bool,
    onUpdate: React.PropTypes.func,
    editable: React.PropTypes.bool
};
