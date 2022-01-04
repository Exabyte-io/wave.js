import React from "react";
import PropTypes from 'prop-types';

import {Wave} from "../wave";

/*
 * Wrapper component for materials visualizer. Uses Wave class to render a material structure.
 * See below for property description.
 */
export class WaveComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isFullscreen: false,
        };
    }

    componentDidMount() {this.initViewer()}

    componentDidUpdate(prevProps, prevState) {
        this.props.triggerHandleResize && this._handleResizeTransition();
        if (this.wave) {
            // recreate bonds asynchronously if structure is changed.
            this.reloadViewer(
                prevProps.structure.hash !== this.props.structure.hash ||
                prevProps.settings.chemicalConnectivityFactor !== this.props.settings.chemicalConnectivityFactor
            );
        }
    }

    _cleanViewer() {
        const el = this.rendererDomElement;
        while (el.firstChild) {
            el.removeChild(el.firstChild)
        }
    }

    initViewer() {
        this._cleanViewer();
        this.wave = new Wave({
            DOMElement: this.rendererDomElement,
            structure: this.props.structure,
            cell: this.props.cell,
            settings: this.props.settings,
            boundaryConditions: this.props.boundaryConditions
        });
        // The height of the dom element is initially zero as css is loaded after component is rendered, hence below.
        this._handleResizeTransition();
    }

    _handleResizeTransition() {
        // TODO: use standard recommended way
        // This is a workaround: OrbitControls in Wave.js listens to resize events properly, but fails to resize the
        // renderer component on fullscreen event. Here we explicitly do that and wait for the event to finish, assuming
        // that 500 milliseconds is enough.
        setTimeout(() => this.wave.handleResize(), 500);
    }

    reloadViewer(createBondsAsync) {
        // When running in headless mode in tests the browser does not support
        // WebGL, so exception will be thrown. It may get in a way with other events => catching it.
        try {
            this.wave.updateSettings(this.props.settings);
            this.wave.setStructure(this.props.structure);
            this.wave.boundaryConditions = this.props.boundaryConditions;
            this.wave.setCell(this.props.cell);
            if (createBondsAsync) this.wave.createBondsAsync();
            this.wave.rebuildScene();
        } catch (e) {
            console.warn('exception caught when rendering atomic viewer', e);
        }
    }

    render() {
        return (
            <div id={this.id}
                className="three-renderer"
                ref={(el) => {this.rendererDomElement = el}}
            />
        )
    }
}

WaveComponent.propTypes = {
    // Whether to trigger handleResizeTransition() on update
    triggerHandleResize: PropTypes.bool,
    // Wave settings
    settings: PropTypes.object,
    // Material structure to be visualized
    structure: PropTypes.object,
    // Expects "cell" property to represent the crystal unit cell for the atomic arrangement. Made.js UnitCell object.
    cell: PropTypes.object,
    boundaryConditions: PropTypes.object,
};
