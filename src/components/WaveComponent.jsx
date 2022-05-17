import PropTypes from "prop-types";
import React from "react";

import { Wave } from "../wave";

/*
 * Wrapper component for materials visualizer. Uses Wave class to render a material structure.
 * See below for property description.
 */
export class WaveComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // eslint-disable-next-line react/no-unused-state
            isFullscreen: false,
        };
    }

    componentDidMount() {
        this.initViewer();
    }

    // eslint-disable-next-line no-unused-vars
    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            structure: prevStructure,
            settings: prevSettings,
            isConventionalCellShown: prevIsConventionalCellShown,
            isDrawBondsEnabled: prevIsDrawBondsEnabled,
        } = prevProps;
        const {
            settings,
            structure,
            triggerHandleResize,
            isConventionalCellShown,
            isDrawBondsEnabled,
        } = this.props;
        if (triggerHandleResize) this._handleResizeTransition();
        if (this.wave) {
            const isCameraAdjusted = !(JSON.stringify(prevProps.settings) === JSON.stringify(settings));
            // recreate bonds asynchronously if structure is changed.
            this.reloadViewer(
                prevStructure.hash !== structure.hash ||
                    prevSettings.chemicalConnectivityFactor !==
                        settings.chemicalConnectivityFactor ||
                    prevIsConventionalCellShown !== isConventionalCellShown ||
                    prevIsDrawBondsEnabled !== isDrawBondsEnabled,
                isCameraAdjusted,
            );
        }
    }

    _cleanViewer() {
        const el = this.rendererDomElement;
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }

    initViewer() {
        this._cleanViewer();
        const { structure, cell, settings, boundaryConditions } = this.props;
        this.wave = new Wave({
            DOMElement: this.rendererDomElement,
            structure,
            cell,
            settings,
            boundaryConditions,
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

    reloadViewer(createBondsAsync, isCameraAdjusted) {
        // When running in headless mode in tests the browser does not support
        // WebGL, so exception will be thrown. It may get in a way with other events => catching it.
        try {
            const { settings, structure, boundaryConditions, cell } = this.props;
            this.wave.updateSettings(settings);
            this.wave.setStructure(structure);
            this.wave.boundaryConditions = boundaryConditions;
            this.wave.setCell(cell);
            if (createBondsAsync) this.wave.createBondsAsync();
            this.wave.rebuildScene(isCameraAdjusted);
        } catch (e) {
            console.warn("exception caught when rendering atomic viewer", e);
        }
    }

    render() {
        return (
            <div
                id={this.id}
                className="three-renderer"
                ref={(el) => {
                    this.rendererDomElement = el;
                }}
            />
        );
    }
}

WaveComponent.propTypes = {
    // Whether to trigger handleResizeTransition() on update
    triggerHandleResize: PropTypes.bool.isRequired,
    // Wave settings
    // eslint-disable-next-line react/forbid-prop-types
    settings: PropTypes.object.isRequired,
    // Material structure to be visualized
    // eslint-disable-next-line react/forbid-prop-types
    structure: PropTypes.object.isRequired,
    // Expects "cell" property to represent the crystal unit cell for the atomic arrangement. Made.js UnitCell object.
    // eslint-disable-next-line react/forbid-prop-types
    cell: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    boundaryConditions: PropTypes.object.isRequired,
    isConventionalCellShown: PropTypes.bool.isRequired,
    isDrawBondsEnabled: PropTypes.bool.isRequired,
};
