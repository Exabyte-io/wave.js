import {mix} from "mixwith";
import * as THREE from "three";

import SETTINGS from "./settings"
import {CellMixin} from "./mixins/cell";
import {AtomsMixin} from "./mixins/atoms";
import {MouseMixin} from "./mixins/mouse";
import {saveImageDataToFile} from "./utils";
import {ControlsMixin} from "./mixins/controls";

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
        this.initCamera();
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
        // TODO: detach listener on exit
        window.addEventListener('resize', () => {this.handleResize()}, false);
    }

    initCamera() {
        const initialPosition = [-50, 0, 10];
        this.camera = new THREE.PerspectiveCamera(20, this.ASPECT, 1, 20000);
        this.camera.name = "PerspectiveCamera";
        this.camera.position.copy(new TV3(...initialPosition));
        this.camera.up = new TV3(0, 0, 1);
        this.camera.lookAt(new TV3(0, 0, 0));
        this.scene.add(this.camera);
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
        this.camera.aspect = this.ASPECT;
        this.camera.updateProjectionMatrix();
        this.render();
    }

    setupLights() {
        const directionalLight = new THREE.DirectionalLight("#FFFFFF");
        directionalLight.name = "DirectionalLight";
        const ambientLight = new THREE.AmbientLight("#202020");
        ambientLight.name = "AmbientLight";
        directionalLight.position.copy(new THREE.Vector3(0.2, 0.2, -1).normalize());
        directionalLight.intensity = 1.2;
        // Dynamic lights - moving with camera while orbiting/rotating/zooming
        this.camera.add(directionalLight);
        this.camera.add(ambientLight);
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
    CellMixin,
    ControlsMixin,
    MouseMixin,  // has to be last
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

    /**
     * Helper to remove a 1-level group of 3D objects.
     * @param {THREE.Object3D} group - Group of 3D objects
     * @private
     */
    _clearViewForGroup(group) {
        for (let i = group.children.length - 1; i >= 0; i--) {
            group.remove(group.children[i])
        }
    }

    clearView() {
        [this.structureGroup].map(g => this._clearViewForGroup(g));
    }

    rebuildScene() {
        this.clearView();
        this.drawAtomsAsSpheres();
        this.drawUnitCell();
        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
        this.renderer2 && this.renderer2.render(this.scene2, this.camera2);
    }

    doFunc(func) {func(this)} // for scripting

}
