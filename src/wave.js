import {mix} from "mixwith";
import * as THREE from "three";
import {CSS2DRenderer} from "three-css2drender"

import SETTINGS from "./settings"
import {CellMixin} from "./mixins/cell";
import {AtomsMixin} from "./mixins/atoms";
import {BondsMixin} from "./mixins/bonds";
import {saveImageDataToFile} from "./utils";
import {ControlsMixin} from "./mixins/controls";
import {BoundaryMixin} from "./mixins/boundary";
import {RepetitionMixin} from "./mixins/repetition";

const TV3 = THREE.Vector3, TCo = THREE.Color;

/*
 * WaveBase is a helper class to initialize three js variables, settings and dimensions.
*  Initializes a renderer, camera and scene.
 */

class WaveBase {

    /**
     * Create a WaveBase class.
     * @params DOMElement {Object} The container DOM element to attach three.js <canvas> to.
     * @params structure {Object|String} Material structure.
     * @params cell {Object} Lattice vectors forming the unit cell (to draw the unit cell).
     * @params settings {Object} Setting object to override the default values.
     */
    constructor({DOMElement, structure, cell, settings = {}}) {

        this._structure = structure;

        this._cell = cell;
        this.container = DOMElement;

        this.updateSettings(settings);

        this.initDimensions();
        this.initRenderer();
        this.initScene();
        this.initCameras();
        this.initStructureGroup();
        this.setupLights();

        this.handleResize = this.handleResize.bind(this);
        this.setBackground = this.setBackground.bind(this);

    }

    updateSettings(settings) {this.settings = Object.assign({}, SETTINGS, settings)}

    initDimensions() {
        this.WIDTH = this.container.clientWidth;
        this.HEIGHT = this.container.clientHeight;
        this.ASPECT = this.WIDTH / this.HEIGHT;
    }

    getWebGLRenderer(config) {
        return new THREE.WebGLRenderer(config);
    }

    initRenderer() {
        this.renderer = this.getWebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
        });

        this.renderer.sortObjects = false;
        this.renderer.domElement.style.width = "100%";
        this.renderer.domElement.style.height = "100%";
        this.container.appendChild(this.renderer.domElement);
        this.renderer.setSize(this.WIDTH, this.HEIGHT);

        // for atom labels
				this.labelRenderer = new CSS2DRenderer();
				this.labelRenderer.domElement.style.position = 'absolute';
				this.labelRenderer.domElement.style.top = '0px';
				this.labelRenderer.domElement.style.pointerEvents = 'none';
        this.container.appendChild(this.labelRenderer.domElement);
        this.labelRenderer.setSize(this.WIDTH, this.HEIGHT);

        // TODO: detach listener on exit
        window.addEventListener('resize', () => {this.handleResize()}, false);
    }

    /**
     * Adds a camera with given type and args to the scene.
     * @param type {String} camera type.
     * @param args {Array} arguments passed to the camera constructor.
     */
    addCameraToScene(type, ...args) {
        const camera = new THREE[type](...args);
        camera.name = type;
        camera.position.copy(new TV3(...this.settings.initialCameraPosition));
        camera.up = new TV3(0, 0, 1);
        camera.lookAt(new TV3(0, 0, 0));
        this.scene.add(camera);
        return camera;
    }

    initCameras() {
        const perspectiveCameraParams = [20, this.ASPECT, 1, 20000];
        this.perspectiveCamera = this.addCameraToScene("PerspectiveCamera", ...perspectiveCameraParams);
        const orthographicCameraParams = [-10 * this.ASPECT, 10 * this.ASPECT, 10, -10, 1, 1000];
        this.orthographicCamera = this.addCameraToScene("OrthographicCamera", ...orthographicCameraParams);
        this.camera = this.perspectiveCamera; // set default camera
    }

    get isCameraOrthographic() {return this.camera.isOrthographicCamera}

    toggleOrthographicCamera() {
        this.camera = this.isCameraOrthographic ? this.perspectiveCamera : this.orthographicCamera;
        this.camera.add(this.directionalLight);
        this.camera.add(this.ambientLight);
        this.orbitControls.object = this.camera;
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.name = "Scene";
        this.scene.background = new TCo(this.settings.backgroundColor);
        this.scene.fog = new THREE.FogExp2(this.settings.backgroundColor, 0.00025 / 100);
    }

    createStructureGroup(structure) {
        const structureGroup = new THREE.Group();
        structureGroup.name = structure.name || structure.formula;
        return structureGroup;
    }

    initStructureGroup() {
        this.structureGroup = this.createStructureGroup(this._structure);
        this.scene.add(this.structureGroup);
    }

    /**
     * Helper method to trigger the reconstruction of the visual on parent node resize
     * @param {node} domElement
     */
    handleResize(domElement = this.container) {
        this.WIDTH = domElement.clientWidth;
        this.HEIGHT = domElement.clientHeight;
        this.ASPECT = this.WIDTH / this.HEIGHT;
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.labelRenderer.setSize(this.WIDTH, this.HEIGHT);
        this.perspectiveCamera.aspect = this.ASPECT;
        this.perspectiveCamera.updateProjectionMatrix();
        this.orthographicCamera.left = -10 * this.ASPECT;
        this.orthographicCamera.right = 10 * this.ASPECT;
        this.orthographicCamera.updateProjectionMatrix();
        this.render();
    }

    setupLights() {
        this.directionalLight = new THREE.DirectionalLight("#FFFFFF");
        this.directionalLight.name = "DirectionalLight";
        this.ambientLight = new THREE.AmbientLight("#202020");
        this.ambientLight.name = "AmbientLight";
        this.directionalLight.position.copy(new THREE.Vector3(0.2, 0.2, -1).normalize());
        this.directionalLight.intensity = 1.2;
        // Dynamic lights - moving with camera while orbiting/rotating/zooming
        this.camera.add(this.directionalLight);
        this.camera.add(this.ambientLight);
    }

    setBackground(hex, a) {
        a = a | 1.0;
        this.settings.backgroundColor = hex;
        this.renderer.setClearColor(hex, a);
        this.scene.fog.color = new TCo(hex);
    }

}

/**
 * Wave draws atoms as spheres according to the material geometry passed.
 */
export class Wave extends mix(WaveBase).with(
    AtomsMixin,
    BondsMixin,
    CellMixin,
    RepetitionMixin,
    ControlsMixin,
    BoundaryMixin,
) {

    /**
     *
     * @param {Object} config
     */
    constructor(config) {
        super(config);
        this.rebuildScene();
        this.rebuildScene = this.rebuildScene.bind(this);
        this.render = this.render.bind(this);
        this.doFunc = this.doFunc.bind(this);
    }

    takeScreenshot() {
        saveImageDataToFile(this.renderer.domElement.toDataURL("image/png"))
    }

    clearView() {
        while (this.structureGroup.children.length) {
            this.structureGroup.remove(this.structureGroup.children[0]);
        }

        while (this.labelRenderer.domElement.firstChild) this.labelRenderer.domElement.removeChild(this.labelRenderer.domElement.firstChild);
    }

    rebuildScene() {
        this.clearView();
        this.drawAtomsAsSpheres();
        this.isDrawLabelsEnabled && this.drawAtomLabels();
        this.drawUnitCell();
        this.drawBoundaries();
        this.isDrawBondsEnabled && this.drawBonds();
        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
        this.renderer2 && this.renderer2.render(this.scene2, this.camera2);
    }

    doFunc(func) {func(this)} // for scripting

}
