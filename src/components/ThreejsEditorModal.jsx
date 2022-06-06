import { Made } from "@exabyte-io/made.js";
import PropTypes from "prop-types";
import React from "react";
import { ModalBody } from "react-bootstrap";
import swal from "sweetalert";
import * as THREE from "three";
import { SetSceneCommand } from "three/editor/js/commands/SetSceneCommand";
import { Editor } from "three/editor/js/Editor";
import { Menubar } from "three/editor/js/Menubar";
import { Player } from "three/editor/js/Player";
import { Sidebar } from "three/editor/js/Sidebar";
// TODO : resolve tern global reference in codemirror
// import { Script } from "three/editor/js/Script";
import { Toolbar } from "three/editor/js/Toolbar";
import { Viewport } from "three/editor/js/Viewport";

import settings from "../settings";
import { materialsToThreeDSceneData, ThreeDSceneDataToMaterial } from "../utils";
import { ModalDialog } from "./ModalDialog";

export class ThreejsEditorModal extends ModalDialog {
    constructor(props) {
        super(props);
        this.editor = undefined;
        this.domElement = undefined;
    }

    initialize(el) {
        if (!el) return;
        this.domElement = el;
        this.setNumberFormat();
        this.initializeEditor();
        this.addEventListeners();
        this.loadScene();
    }

    // eslint-disable-next-line no-unused-vars
    componentDidUpdate(prevProps, prevState, snapshot) {
        window.localStorage.removeItem("threejs-editor");
    }

    /**
     * `Number.prototype.format` is used inside three.js editor codebase to format the numbers.
     * The editor does not start without it. The ESLint line is a way to turn off the warning shown in the console.
     */
    // eslint-disable-next-line class-methods-use-this
    setNumberFormat() {
        /* eslint func-names: ["off"] */
        /* eslint no-extend-native: [0, { "exceptions": ["Object"] }] */
        Number.prototype.format = function () {
            return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        };
    }

    initializeCamera = () => {
        // create a PerspectiveCamera at specific position and pass to the editor to override the default one.
        const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 20000);
        camera.name = "Camera";
        camera.position.copy(new THREE.Vector3(0, -20, 8));
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        return camera;
    };

    initializeControls = () => {
        window.VIEW_HELPER.controls.panSpeed = 0.006;
        window.VIEW_HELPER.controls.rotationSpeed = 0.015;
        window.VIEW_HELPER.controls.zoomSpeed = 0.2;
    };

    initializeLights() {
        const directionalLight = new THREE.DirectionalLight("#FFFFFF");
        directionalLight.position.copy(new THREE.Vector3(0.2, 0.2, -1).normalize());
        directionalLight.intensity = 1.2;
        this.editor.scene.add(directionalLight);
    }

    /**
     * Initialize threejs editor and add it to the DOM.
     */
    initializeEditor() {
        // adjust the orientation to have Z-axis up/down
        THREE.Object3D.DefaultUp.set(0, 0, 1);

        // initialize editor and set the scene background
        this.editor = new Editor(this.initializeCamera());
        this.editor.scene.background = new THREE.Color(settings.backgroundColor);

        // pass onHide handler to editor
        this.editor.onHide = this.onHide;

        // initialize viewport and add it to the DOM
        const viewport = new Viewport(this.editor);
        this.domElement.appendChild(viewport.dom);

        // initialize UI elements and add them to the DOM
        // const script = new Script(this.editor);
        // this.domElement.appendChild(script.dom);
        const player = new Player(this.editor);
        this.domElement.appendChild(player.dom);
        const menubar = new Menubar(this.editor);
        this.domElement.appendChild(menubar.dom);
        const sidebar = new Sidebar(this.editor);
        this.domElement.appendChild(sidebar.dom);
        const toolbar = new Toolbar(this.editor);
        this.domElement.appendChild(toolbar.dom);

        this.initializeControls();

        this.initializeLights();
    }

    /**
     * Add dragover listeners to group the objects.
     */
    addEventListeners() {
        document.addEventListener(
            "dragover",
            (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
            },
            false,
        );
        const onResize = () => this.editor.signals.windowResize.dispatch();
        window.addEventListener("resize", onResize, false);
        onResize();
    }

    /**
     * Load the scene based on the given materials.
     */
    loadScene() {
        const loader = new THREE.ObjectLoader();
        const scene = loader.parse(materialsToThreeDSceneData(this.props.materials));
        this.editor.execute(new SetSceneCommand(this.editor, scene));
        this.editor.signals.objectSelected.dispatch(this.editor.camera);
    }

    showAlert() {
        swal({
            icon: "error",
            buttons: {
                cancel: "Cancel",
                exit: "Exit",
            },
            text: "Unable to extract a material from the editor!",
        }).then((value) => {
            switch (value) {
                case "exit":
                    super.onHide();
                    break;
                default:
                    break;
            }
        });
    }

    onHide() {
        try {
            const material = ThreeDSceneDataToMaterial(this.editor.scene);
            super.onHide(material);
        } catch (e) {
            this.showAlert(e);
        }
    }

    renderBody() {
        return (
            <ModalBody>
                <div ref={(el) => this.initialize(el)} />
            </ModalBody>
        );
    }
}

ThreejsEditorModal.propTypes = {
    materials: PropTypes.arrayOf(Made.Material).isRequired,
};
