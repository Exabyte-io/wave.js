import React from "react";

import {Wave} from "../wave";

/*
 * Uses Wave.js to render an arrangement of atoms passed in XYZ format in cartesian coordinates
 * Expects "cell" property to represent the crystal unit cell for the atomic arrangement.
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
        this.props.triggerHandleResize && this._handleFullscreenTransition();
        this.wave && this.reloadViewer();
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
            onUpdate: this.props.onUpdate,
        });

    }

    _handleFullscreenTransition() {
        // TODO: use standard recommended way
        // This is a workaround: OrbitControls in Wave.js listens to resize events properly, but fails to resize the
        // renderer component on fullscreen event. Here we explicitly do that and wait for the event to finish, assuming
        // that 500 milliseconds is enough.
        setTimeout(() => this.wave.handleResize(), 500);
    }

    reloadViewer() {
        // When running in headless mode in tests the browser does not support
        // WebGL, so exception will be thrown. It may get in a way with other events => catching it.
        try {
            this.wave.updateSettings(this.props.settings);
            this.wave.setStructure(this.props.structure);
            this.wave.setCell(this.props.cell);
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
    triggerHandleResize: React.PropTypes.bool,
    name: React.PropTypes.string,
    settings: React.PropTypes.object,
    structure: React.PropTypes.object, // Material
    cell: React.PropTypes.object, // UnitCell object
};
