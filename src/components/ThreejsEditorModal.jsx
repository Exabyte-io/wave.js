import { Made } from "@exabyte-io/made.js";
import PropTypes from "prop-types";
import React from "react";
import { ModalBody } from "react-bootstrap";
import * as THREE from "three";
import { RemoveMultipleSelectionGroupCommand } from "three/editor/js/commands/RemoveMultipleSelectionGroupCommand";
import { SetSceneCommand } from "three/editor/js/commands/SetSceneCommand";
import { SubmitMultipleSelectionCommand } from "three/editor/js/commands/SubmitMultipleSelectionCommand";
import { Editor } from "three/editor/js/Editor";
import { Menubar } from "three/editor/js/Menubar";
import { Player } from "three/editor/js/Player";
import { Script } from "three/editor/js/Script";
import { Sidebar } from "three/editor/js/Sidebar";
import { Toolbar } from "three/editor/js/Toolbar";
import { Viewport } from "three/editor/js/Viewport";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import settings from "../settings";
import { materialsToThreeDSceneData, ThreeDSceneDataToMaterial } from "../utils";
import { AlertDialog } from "./AlertDialog";
import { ModalDialog } from "./ModalDialog";

export class ThreejsEditorModal extends ModalDialog {
    constructor(props) {
        super(props);
        this.editor = undefined;
        this.domElement = undefined;

        this.showAlert = this.showAlert.bind(this);
        this.submitMultipleSelectionGroup = this.submitMultipleSelectionGroup.bind(this);
        this.removeMultipleSelectionGroup = this.removeMultipleSelectionGroup.bind(this);
        this.showSubmissionMultipleSelectionModal =
            this.showSubmissionMultipleSelectionModal.bind(this);
        this.isMultipleSelectionGroupSubmitted = this.isMultipleSelectionGroupSubmitted.bind(this);
        this.forceExitFromEditor = this.forceExitFromEditor.bind(this);
        this.exitWithCallback = this.exitWithCallback.bind(this);
        this.extractMaterialAndHide = this.extractMaterialAndHide.bind(this);
        this.onExtractMaterialError = this.onExtractMaterialError.bind(this);
    }

    initialize(el) {
        if (!el) return;
        this.domElement = el;
        this.setNumberFormat();
        this.initializeEditor();
        this.addEventListeners();
        this.addSignalsListeners();
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
        const script = new Script(this.editor);
        this.domElement.appendChild(script.dom);
        const player = new Player(this.editor);
        this.domElement.appendChild(player.dom);
        const menubar = new Menubar(this.editor);
        this.domElement.appendChild(menubar.dom);
        const sidebar = new Sidebar(this.editor);
        this.domElement.appendChild(sidebar.dom);
        const toolbar = new Toolbar(this.editor);
        this.domElement.appendChild(toolbar.dom);

        // initialize controls
        this.editor.controls = new OrbitControls(this.editor.camera, viewport.dom);
        this.editor.controls.up = new THREE.Vector3(0, 0, 1);

        // set controls parameters
        this.editor.controls.panSpeed = 0.006;
        this.editor.controls.rotationSpeed = 0.015;
        this.editor.controls.zoomSpeed = 0.2;

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

        // on right click and hold disable orbit controls to allow pan
        document.addEventListener("mousedown", (event) => {
            if (event.button === THREE.MOUSE.RIGHT) {
                this.editor.controls.enabled = false;
            }
        });

        // on right click release enable orbit controls
        document.addEventListener("mouseup", (event) => {
            if (event.button === THREE.MOUSE.RIGHT) {
                this.editor.controls.enabled = true;
            }
        });

        const onResize = () => this.editor.signals.windowResize.dispatch();
        window.addEventListener("resize", onResize, false);
        onResize();
    }

    /**
     * Handle signals from the editor
     */
    addSignalsListeners() {
        this.editor.signals.editorClosed.add(() => {
            this.onHide();
        });
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

    /**
     *  shows alert with specific parameters
     *  @typedef {{ text: string, onClick: Function }} ButtonsType
     *  @typedef {{ title: string, content: string, buttons: ButtonsType }} ShowAlertInputType
     *  @param {ShowAlertInputType} params
     */
    showAlert(params) {
        this.alertRef.open(params);
    }

    /**
     * submits multiple selections group
     */
    submitMultipleSelectionGroup() {
        this.editor.execute(
            new SubmitMultipleSelectionCommand(this.editor, this.editor.multipleSelection),
        );
    }

    /**
     * removes multiple selection group
     */
    removeMultipleSelectionGroup() {
        this.editor.execute(new RemoveMultipleSelectionGroupCommand(this.editor));
    }

    /**
     * this function shows confirm window if user forgets to submit multiple selection and tries to exit from editor
     */
    // TODO: probably this logic could be moved to three js library into 3DEditor, when 3DEditor will use a React library.
    showSubmissionMultipleSelectionModal() {
        this.showAlert({
            title: "Warning!",
            content:
                "Multiple selection group is not submitted do you want submit and exit or undo latest changes?",
            buttons: [
                { text: "Close", onClick: this.alertRef.close },
                {
                    text: "Undo and Exit",
                    onClick: this.exitWithCallback(this.removeMultipleSelectionGroup),
                },
                {
                    text: "Submit and Exit",
                    onClick: this.exitWithCallback(this.submitMultipleSelectionGroup),
                },
            ],
        });
    }

    /**
     * checks is multiple selection submitted
     * @returns {Boolean} true - if multiple selection is submitted false - if not
     */
    isMultipleSelectionGroupSubmitted() {
        const { scene } = this.editor;
        const multipleSelectionGroup = scene.getObjectByProperty("type", "MultipleSelectionGroup");

        return !multipleSelectionGroup;
    }

    /**
     * force exit from the modal with initially defined materials
     */
    forceExitFromEditor() {
        super.onHide(this.materials);
    }

    /**
     * exit form editor and calls callback
     * @param {Function} callback - function that should be called before exit from editor
     * @returns {Function} - callback that can be applied to event listener
     */
    exitWithCallback(callback) {
        return () => {
            callback();
            this.extractMaterialAndHide();
        };
    }

    /**
     * extracts materials and hides editor
     */
    extractMaterialAndHide() {
        try {
            const material = ThreeDSceneDataToMaterial(this.editor.scene);
            super.onHide(material);
        } catch {
            this.onExtractMaterialError();
        }
    }

    /**
     * displays error confirm window if we have some errors
     */
    onExtractMaterialError() {
        this.showAlert({
            content: "Unable to extract a material from the editor!",
            title: "Error!",
            buttons: [
                { text: "Close", onClick: this.alertRef.close },
                { text: "Exit", onClick: this.forceExitFromEditor },
            ],
        });
    }

    /**
     * function to be called on Escape click or on exit from editor
     */
    onHide() {
        try {
            const isMultipleSelectionGroupSubmitted = this.isMultipleSelectionGroupSubmitted();
            if (!isMultipleSelectionGroupSubmitted) {
                this.showSubmissionMultipleSelectionModal();
            } else {
                this.extractMaterialAndHide();
            }
        } catch {
            this.onExtractMaterialError();
        }
    }

    renderBody() {
        return (
            <ModalBody>
                <AlertDialog ref={(ref) => (this.alertRef = ref)} />
                <div ref={(el) => this.initialize(el)} />
            </ModalBody>
        );
    }
}

ThreejsEditorModal.propTypes = {
    materials: PropTypes.arrayOf(Made.Material).isRequired,
};
