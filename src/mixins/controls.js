import * as THREE from "three";
import {CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import {UtilsMixin} from "./utils";
import {addAxisLabels} from "./labels";

const OrbitControls = require('three-orbit-controls')(THREE);

const TV3 = THREE.Vector3;

/*
 * Mixin containing the logic for dealing with orbit controls for THREE scene.
 * Example: https://threejs.org/examples/misc_controls_orbit.html
 */
const OrbitControlsMixin = (superclass) => class extends superclass {

    constructor(config) {
        super(config);
        this.initOrbitControls(false);

        // Bind methods to context
        this.initOrbitControls = this.initOrbitControls.bind(this);
        this.enableOrbitControls = this.enableOrbitControls.bind(this);
        this.disableOrbitControls = this.disableOrbitControls.bind(this);
        this.enableOrbitControlsAnimation = this.enableOrbitControlsAnimation.bind(this);
        this.disableOrbitControlsAnimation = this.disableOrbitControlsAnimation.bind(this);

        this.initSecondAxes = this.initSecondAxes.bind(this);
        this.updateSecondAxes = this.updateSecondAxes.bind(this);

    }

    initOrbitControls(enabled = false) {
        this.initSecondAxes();
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enabled = enabled;
        this.orbitControls.enableZoom = true;
        this.orbitControls.enableKeys = false;
        // TODO: use a settings variable instead of explicit number below
        this.orbitControls.rotateSpeed = 2.0;
        this.orbitControls.zoomSpeed = 2.0;
        this.orbitControls.update();
    }

    disableOrbitControls() {
        if (!this.orbitControls) return;
        this.orbitControls.enabled = false;
        this.hideSecondAxes();
        this.orbitControls.removeEventListener('change', this.updateSecondAxesBound, false);
        this.setCursorStyle();
    }

    enableOrbitControls() {
        this.orbitControls.enabled = true;
        this.scene2.add(this.scene2.secondAxesGroup);
        this.updateSecondAxes();  // align second camera wrt the first one and thus make it visible
        this.updateSecondAxesBound = e => this.updateSecondAxes(e);
        this.orbitControls.addEventListener('change', this.updateSecondAxesBound, false);
        this.setCursorStyle('alias');
    }

    /**
     * Getter returning the status of rotating animation for orbit controls.
     * @return {Boolean}
     */
    get isOrbitControlsAnimationEnabled() {return Boolean(this.animationFrameId)}

    /**
     * Enable automatic rotation of the camera around the current focus point.
     * Implemented through `window.requestAnimationFrame`.
     */
    enableOrbitControlsAnimation() {
        if (!this.orbitControls) return;
        this.orbitControls.autoRotate = true;
        this.animationFrameId = window.requestAnimationFrame(this.enableOrbitControlsAnimation);
        // required if controls.enableDamping or controls.autoRotate are set to true
        this.orbitControls.update();
        this.render();

    }

    disableOrbitControlsAnimation() {
        if (!this.orbitControls) return;
        window.cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }

    toggleOrbitControlsAnimation() {
        this.animationFrameId ? this.disableOrbitControlsAnimation() : this.enableOrbitControlsAnimation();
    }

    /*
     *          AXES-RELATED FUNCTIONALITY.
     *          TODO: separate to its own mixin
     */

    /**
     * Initialize Axes Helper - XYZ axes with a mesh plane in XY.
     */
    initAxes() {
        // length of the axes
        const length = 100;

        const lineMaterial = new THREE.LineDashedMaterial(
            Object.assign({}, this.settings.lineMaterial, {color: this.settings.colors.amber})
        );
        const geometry = new THREE.Geometry();
        const [origin, x, y, z] = [
            new TV3(0, 0, 0),
            new TV3(length, 0, 0),
            new TV3(0, length, 0),
            new TV3(0, 0, length)
        ];
        geometry.vertices.push(origin, x, origin, y, origin, z);
        const line = new THREE.LineSegments(geometry, lineMaterial);
        line.computeLineDistances();
        // group axes vertices in the viewer together and treat as a 3D object
        this.axesGroup = new THREE.Object3D();

        const gridHelper = new THREE.GridHelper(100, 100, this.settings.colors.amber, this.settings.colors.gray);
        gridHelper.geometry.rotateX(Math.PI / 2);
        gridHelper.position.x = 0;
        gridHelper.position.y = 0;

        this.axesGroup.add(line, gridHelper);
        this.scene.add(this.axesGroup);
    }

    deleteAxes() {
        if (!this.axesGroup) return;
        this.scene.remove(this.axesGroup);
        delete this.axesGroup;
    }

    get areAxesEnabled() {return Boolean(this.axesGroup)}

    toggleAxes() {
        this.areAxesEnabled ? this.deleteAxes() : this.initAxes();
        this.render();
    }

    /*
     * Initialize a "picture-in-picture" Axes Helper to visualize camera movements around the object.
     */
    initSecondAxes() {
        const length = 100;
        const containerDimension = 100;

        this.renderer2 = this.getWebGLRenderer({alpha: true});
        this.renderer2.setClearColor("#FFFFFF", 0);
        this.renderer2.setSize(containerDimension, containerDimension);
        this.renderer2.domElement.style.position = 'absolute';
        this.renderer2.domElement.style.right = '10px';
        this.container.prepend(this.renderer2.domElement);
        //For axis labels
        this.renderer2CSS2D = new CSS2DRenderer();
        this.renderer2CSS2D.setSize(containerDimension, containerDimension);
        this.renderer2CSS2D.domElement.style.position = 'absolute';
        this.renderer2CSS2D.domElement.style.right = '10px';
        this.renderer2CSS2D.domElement.style.pointerEvents = 'none';
        this.container.prepend(this.renderer2CSS2D.domElement);

        //axis label
        const coordX = { x: length * 1.2, y: 0, z: 0 }
        const coordY = { x: 0, y: length * 1.2, z: 0 }
        const coordZ = { x: 0, y: 0, z: length * 1.2 }
        const [labelX, labelY, labelZ] = [
            new addAxisLabels('X', coordX, this.settings.labelColor),
            new addAxisLabels('Y', coordY, this.settings.labelColor),
            new addAxisLabels('Z', coordZ, this.settings.labelColor)
        ]

        const origin = new TV3(0, 0, 0);
        const [x, y, z] = [
            new THREE.ArrowHelper(new TV3(1, 0, 0), origin, length, "#FF0000", length / 3, length / 3),
            new THREE.ArrowHelper(new TV3(0, 1, 0), origin, length, "#00FF00", length / 3, length / 3),
            new THREE.ArrowHelper(new TV3(0, 0, 1), origin, length, "#0000FF", length / 3, length / 3)
        ];

        // add axes to second scene to make stationary
        this.scene2 = new THREE.Scene();
        this.camera2 = new THREE.PerspectiveCamera(50, 1, 1, 1000);
        this.camera2.up = this.camera.up;
        // saving axes helpers inside the scene object itself for further re-use in `hide*` method
        const secondAxesGroup = new THREE.Group();
        secondAxesGroup.add(x);
        secondAxesGroup.add(y);
        secondAxesGroup.add(z);
        secondAxesGroup.add(labelX);
        secondAxesGroup.add(labelY);
        secondAxesGroup.add(labelZ);
        this.scene2.secondAxesGroup = secondAxesGroup;
        console.log(this.scene2);
    }

    updateSecondAxes() {
        this.camera2.position.copy(this.camera.position);
        this.camera2.position.sub(this.orbitControls.target);
        this.camera2.position.setLength(300);
        this.camera2.lookAt(this.scene2.position);
        this.render();
    }


    hideSecondAxes() {
        this.scene2.remove(this.scene2.secondAxesGroup);
        while (this.renderer2CSS2D.domElement.firstChild) {
            this.renderer2CSS2D.domElement.removeChild(this.renderer2CSS2D.domElement.firstChild);
        }
    }

    /*
     * Draws a "shooter-target" like object for aiming at the center of orbiting
     * NOTE: not yet used, kept for the future.
     */
    addTargetCrossToCamera() {
        const TargetCrossHelper = new THREE.Mesh(
            new THREE.CircleGeometry(0.2, 32), new THREE.MeshBasicMaterial({color: 0xffffff})
        );
        TargetCrossHelper.position.copy(this.orbitControls.target.position);
        this.camera.add(TargetCrossHelper);
    }

    /**
     * Sets mouse cursor type.
     * @param {String} cursorType - CSS Cursor attribute (https://developer.mozilla.org/en-US/docs/Web/CSS/cursor).
     */
    setCursorStyle(cursorType) {
        if (!cursorType) {
            this.container.style.cursor = this.container.style.previousCursor || "default";
        } else if (cursorType !== this.container.style.cursor) {  // avoid setting cursor to same value twice
            this.container.style.previousCursor = this.container.style.cursor;
            this.container.style.cursor = cursorType;
        }
    }

};

/*
 * Mixin containing the logic for enabling/disabling controls from key types.
 * Holds the current state for the controls - ie. enabled/disabled - and initialized key event listeners.
 */
export const ControlsMixin = (superclass) => UtilsMixin(OrbitControlsMixin(class extends superclass {

    constructor(config) {
        super(config);
        this.toggleOrbitControls = this.toggleOrbitControls.bind(this);
        this.initControls();
    }

    initControls() {
        this.areOrbitControlsEnabled = false;
    }

    getControlsState() {
        return {
            areOrbitControlsEnabled: this.areOrbitControlsEnabled,
        }
    }

    setControlsState(s = {}) {
        this.areOrbitControlsEnabled = s.areOrbitControlsEnabled || false;
    }

    toggleOrbitControls(skipStateUpdate = false) {
        const initialState = this.getControlsState();
        this.toggleBoolean("areOrbitControlsEnabled");
        !skipStateUpdate && this.updateControlsFromState(initialState, this.getControlsState());
    }

    updateControlsFromState(initialState, finalState) {
        if (!this.areTwoObjectsShallowEqual(initialState, finalState)) {
            const diffObject = this.getTwoObjectsShallowDifferentKeys(initialState, finalState);

            diffObject.areOrbitControlsEnabled &&
            (this.areOrbitControlsEnabled ? this.enableOrbitControls() : this.disableOrbitControls());
        }
        this.render();
    }

}));
