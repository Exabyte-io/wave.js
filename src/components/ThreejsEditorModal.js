import React from 'react';
import * as THREE from "three";
import {ModalBody} from "react-bootstrap";

import {ShowIf} from "./ShowIf";
import settings from "../settings";
import {ModalDialog} from "./ModalDialog";
import {materialsToThreeDSceneData} from "../utils";
import {LoadingIndicator} from "./LoadingIndicator";
import {THREE_D_BASE_URL, THREE_D_SOURCES} from "../enums";

export class ThreejsEditorModal extends ModalDialog {

    constructor(props) {
        super(props);
        window.THREE = THREE;
        this.domElement = undefined;
        this.state = {areScriptsLoaded: false};
        this.injectScripts();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        window.localStorage.removeItem("threejs-editor");
    }

    setNumberFormat() {
        Number.prototype.format = function () {
            return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        };
    }

    /**
     * Initialize threejs editor and add it to the dom.
     */
    initializeEditor() {

        this.editor = new window.Editor();
        this.editor.scene.background = new THREE.Color(settings.backgroundColor);

        const viewport = new window.Viewport(this.editor);

        this.domElement.appendChild(viewport.dom);

        const toolbar = new window.Toolbar(this.editor);
        this.domElement.appendChild(toolbar.dom);

        const script = new window.Script(this.editor);
        this.domElement.appendChild(script.dom);

        const player = new window.Player(this.editor);
        this.domElement.appendChild(player.dom);

        const menubar = new window.Menubar(this.editor);
        this.domElement.appendChild(menubar.dom);

        const sidebar = new window.Sidebar(this.editor);
        this.domElement.appendChild(sidebar.dom);

        const modal = new window.UI.Modal();
        this.domElement.appendChild(modal.dom);
    }

    /**
     * Add dragover listeners to group the objects.
     */
    addEventListeners() {
        const clsInstance = this;
        document.addEventListener('dragover', function (event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        }, false);

        function onWindowResize(event) {clsInstance.editor.signals.windowResize.dispatch()}

        window.addEventListener('resize', onWindowResize, false);
        onWindowResize();
    }

    /**
     * Load the scene based on the given materials.
     */
    loadScene() {
        const loader = new THREE.ObjectLoader();
        const scene = loader.parse(materialsToThreeDSceneData(this.props.materials));
        this.editor.execute(new window.SetSceneCommand(scene));
    }

    /**
     * Inject threejs editor scripts into dom.
     * `areScriptsLoaded` flag is used to enable/disable a loader as it takes some time to load the scripts.
     */
    injectScripts() {
        const clsInstance = this;
        THREE_D_SOURCES.forEach(src => {
            const script = document.createElement("script");
            script.src = `${THREE_D_BASE_URL}/${src}`;
            script.async = false;
            script.defer = false;
            if (src.includes("SetSceneCommand")) {
                script.onload = () => {
                    clsInstance.setState({areScriptsLoaded: true});
                    clsInstance.setNumberFormat();
                    clsInstance.initializeEditor();
                    clsInstance.addEventListeners();
                    clsInstance.loadScene();
                }
            }
            document.head.appendChild(script);
        });
    }

    renderBody() {
        return <ModalBody className="p-0">
            <div ref={el => {this.domElement = el}}/>
            <ShowIf condition={!this.state.areScriptsLoaded}>
                <LoadingIndicator/>
            </ShowIf>
        </ModalBody>;
    }

}

ThreejsEditorModal.propTypes = {
    onSubmit: React.PropTypes.func,
};

ThreejsEditorModal.defaultProps = {
    isFullWidth: true,
    backdropColor: 'white',
};
