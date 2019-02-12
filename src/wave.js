import _ from "underscore";
import {mix} from "mixwith";
import * as THREE from "three";

import SETTINGS from "./settings"
import {saveImageDataToFile} from "./utils";
import {AtomsMixin} from "./mixins/atoms";
import {CellMixin} from "./mixins/cell";
import {ControlsMixin} from "./mixins/controls";
import {MouseMixin} from "./mixins/mouse";

const TV3 = THREE.Vector3, TCo = THREE.Color;

/*
 * @summary WaveBase is a helper class to initialize three js variables, settings and dimensions.
 *          Initializes a renderer, camera and scene, then Wave draws atoms as spheres according to material geometry.
 * @params DOMElement {Object} The container DOM element to attach three.js <canvas> to.
 * @params structure {Object|String} Material structure.
 * @params cell {Object} Lattice vectors forming the unit cell (to draw the unit cell).
 * @params settings {Object} Setting object to override the default values.
 */

class WaveBase {
    constructor({DOMElement, structure, cell, settings = {}}) {

        this._structure = structure;

        this._cell = cell;
        this.container = DOMElement;

        this.updateSettings(settings);

        this.initDimensions();
        this.initRenderer();
        this.initCamera();
        this.initScene();
        this.setupLights();

        this.handleResize = this.handleResize.bind(this);
        this.setBackground = this.setBackground.bind(this);

    }

    // TODO: aggregate settings under `settings` variable
    updateSettings(settings) {this.settings = Object.assign(SETTINGS, settings)}

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
        this.renderer.domElement.style.WIDTH = "100%";
        this.renderer.domElement.style.HEIGHT = "100%";
        this.container.appendChild(this.renderer.domElement);
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        // TODO: detach listener on exit
        window.addEventListener('resize', () => {this.handleResize()}, false);
    }

    initCamera() {
        const initialPosition = [-50, 0, 10];
        this.camera = new THREE.PerspectiveCamera(20, this.ASPECT, 1, 20000);
        this.camera.position.copy(new TV3(...initialPosition));
        this.camera.up = new TV3(0, 0, 1);
        this.camera.lookAt(new TV3(0, 0, 0));
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new TCo(this.settings.backgroundColor);
        this.scene.fog = new THREE.FogExp2(this.settings.backgroundColor, 0.00025 / 100);
    }

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
        const ambientLight = new THREE.AmbientLight("#202020");
        directionalLight.position.copy(new TV3(0.2, 0.2, -1).normalize());
        directionalLight.intensity = 1.2;
        this.scene.add(this.camera);
        // Dynamic lights - moving with camera while orbiting/rotating/zooming
        this.camera.add(directionalLight);
        this.camera.add(ambientLight);
        // Uncomment the below to enable static lights instead
        // this.scene.add(directionalLight);
        // this.scene.add(ambientLight);
    }

    setBackground(hex, a) {
        a = a | 1.0;
        this.settings.backgroundColor = hex;
        this.renderer.setClearColor(hex, a);
        this.scene.fog.color = new TCo(hex);
    }

}

export class Wave extends mix(WaveBase).with(
    AtomsMixin,
    CellMixin,
    ControlsMixin,
    MouseMixin,  // has to be last
) {

    constructor(config) {
        super(config);

        this.onUpdate = config.onUpdate;

        this.rebuildScene();

        this.onUpdate = _.debounce(this.onUpdate, 500);
        this.onUpdate = this.onUpdate.bind(this);

        this.rebuildScene = this.rebuildScene.bind(this);
        this.render = this.render.bind(this);
        this.doFunc = this.doFunc.bind(this);
    }

    takeScreenshot() {
        saveImageDataToFile(this.renderer.domElement.toDataURL("image/png"))
    }

    _clearViewForGroup(group) {
        for (let i = group.children.length - 1; i >= 0; i--) {
            group.remove(group.children[i])
        }
    }

    clearView() {
        [this.atomsGroup, this.cellGroup].map(g => this._clearViewForGroup(g));
    }

    rebuildScene() {
        this.clearView();
        this.drawAtomsAsSpheres();
        this.drawUnitCell();
        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
        if (this.callOnUpdate) {
            this.onUpdate(this.structure);
            this.callOnUpdate = false;
        }
        this.renderer2 && this.renderer2.render(this.scene2, this.camera2);
    }

    doFunc(func) {func(this)} // for scripting

}
