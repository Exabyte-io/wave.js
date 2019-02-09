import * as THREE from "three";
import {UtilsMixin} from "./utils";

const OrbitControls = require('three-orbit-controls')(THREE);
const TransformControls = require('three-transform-controls')(THREE);

const TV3 = THREE.Vector3, TCo = THREE.Color;

const TransformControlsMixin = (superclass) => class extends superclass {

    constructor(config) {
        super(config);

        // Bind methods to context
        this.initTransformControls = this.initTransformControls.bind(this);
        this.enableTransformControls = this.enableTransformControls.bind(this);
        this.disableTransformControls = this.disableTransformControls.bind(this);
    }

    initTransformControls(enabled = false) {

        if (this.transformControls) return;  // sanity check

        this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
        this.transformControls.enabled = enabled;
        this.transformControls.space = "world";
        this.transformControls.setSize(0.5);
        this.transformControls.attach(this.atomsGroup);
        this.transformControls.addEventListener('change', (event) => {
            this.transformControls.update();
            this.render();
        });

    }

    onMouseDownTransformControls(event) {
        this.transforming = true;
    }

    onMouseUpTransformControls(event) {
        this.transforming = false;
        this.moveAtoms();
    }

    addEventListenersTransformControls() {
        this.onMouseDownTransformControlsBound = e => this.onMouseDownTransformControls(e);
        this.onMouseUpTransformControlsBound = e => this.onMouseUpTransformControls(e);

        // TODO: add listeners for touch events
        // NOTE: mousedown and mouseup events have to be on the controls themselves and have to be in camelCase
        this.transformControls.addEventListener('mouseDown', this.onMouseDownTransformControlsBound, false);
        this.transformControls.addEventListener('mouseUp', this.onMouseUpTransformControlsBound, false);
        this.setCursorStyle('move');
    }

    removeEventListenersTransformControls() {
        const clsInstance = this;
        [
            // no events are bound to container from `transformControls`, and it itself is disposed of on disable
        ].map(o => this.container.removeEventListener(Object.keys(o)[0], Object.values(o)[0], false));
        this.setCursorStyle();
    }

    enableTransformControls() {
        this.initTransformControls(true);
        this.scene.add(this.transformControls) && this.render();
        this.addEventListenersTransformControls();
        this.setCursorStyle('move');
    }

    // transform controls does not support `enable/disable` => dispose of it completely
    disableTransformControls() {
        this.removeEventListenersTransformControls();
        if (!this.transformControls) return;
        this.scene.remove(this.transformControls);
        this.transformControls.dispose();
        this.transformControls = null;
    }

}

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
        this.showSecondAxes();
        this.updateSecondAxes();  // align second camera wrt the first one and thus make it visible
        this.updateSecondAxesBound = e => this.updateSecondAxes(e);
        this.orbitControls.addEventListener('change', this.updateSecondAxesBound, false);
        this.setCursorStyle('alias');
    }

    get isOrbitControlsAnimationEnabled() {return Boolean(this.animationFrameId)}

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

    initAxes() {
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
     * @summary Initialize a "picture-in-picture" Axes Helper
     */
    initSecondAxes() {
        const length = 100;
        const containerDimension = 100;

        this.renderer2 = this.getWebGLRenderer({
            alpha: true,
        });
        this.renderer2.setClearColor("#FFFFFF", 0);
        this.renderer2.setSize(containerDimension, containerDimension);
        this.container.prepend(this.renderer2.domElement);

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
        this.scene2.x = x;
        this.scene2.y = y;
        this.scene2.z = z;
    }

    updateSecondAxes() {
        this.camera2.position.copy(this.camera.position);
        this.camera2.position.sub(this.orbitControls.target);
        this.camera2.position.setLength(300);
        this.camera2.lookAt(this.scene2.position);
        this.render();
    }

    showSecondAxes() {
        const secondAxes = [this.scene2.x, this.scene2.y, this.scene2.z].filter(x => x);  // assert no `undefined`;
        this.scene2.add(...secondAxes);
    }

    hideSecondAxes() {
        const secondAxes = [this.scene2.x, this.scene2.y, this.scene2.z].filter(x => x);  // assert no `undefined`;
        this.scene2.remove(...secondAxes);
    }

    /*
     * @summary Draws a "shooter-target" like object for aiming at the center of orbiting
     */
    addTargetCrossToCamera() {
        const TargetCrossHelper = new THREE.Mesh(
            new THREE.CircleGeometry(0.2, 32), new THREE.MeshBasicMaterial({color: 0xffffff})
        );
        TargetCrossHelper.position.copy(this.orbitControls.target.position);
        this.camera.add(TargetCrossHelper);
    }

}

export const ControlsMixin = (superclass) => UtilsMixin(TransformControlsMixin(OrbitControlsMixin(class extends superclass {

    constructor(config) {
        super(config);

        this.toggleTransformControls = this.toggleTransformControls.bind(this);
        this.toggleOrbitControls = this.toggleOrbitControls.bind(this);
        this.initControls();
        this.initControlsSwitchFromKeyboard();

    }

    initControls() {
        this.areTransformControlsEnabled = false;
        this.areOrbitControlsEnabled = false;
    }

    getControlsState() {
        return {
            areTransformControlsEnabled: this.areTransformControlsEnabled,
            areOrbitControlsEnabled: this.areOrbitControlsEnabled,
        }
    }

    setControlsState(s = {}) {
        this.areTransformControlsEnabled = s.areTransformControlsEnabled || false;
        this.areOrbitControlsEnabled = s.areOrbitControlsEnabled || false;
    }

    toggleTransformControls(skipStateUpdate = false) {
        const initialState = this.getControlsState();
        this.toggleBoolean("areTransformControlsEnabled", ["areOrbitControlsEnabled"]);
        !skipStateUpdate && this.updateControlsFromState(initialState, this.getControlsState());

    }

    toggleOrbitControls(skipStateUpdate = false) {
        const initialState = this.getControlsState();
        this.toggleBoolean("areOrbitControlsEnabled", ["areTransformControlsEnabled"]);
        !skipStateUpdate && this.updateControlsFromState(initialState, this.getControlsState());
    }

    initControlsSwitchFromKeyboard() {
        window.addEventListener('keydown', (event) => {

            const initialState = this.getControlsState();

            switch (event.keyCode) {
                case 84: // T
                    this.toggleTransformControls(true);
                    break;
                case 65: // A
                    this.areTransformControlsEnabled && this.transformControls.setMode("translate");
                    break;
                case 82: // R
                    this.areTransformControlsEnabled && this.transformControls.setMode("rotate");
                    break;
                case 79: // O
                    this.toggleOrbitControls(true);
                    break;
                default:
                    this.setControlsState();
            }

            const finalState = this.getControlsState();
            this.updateControlsFromState(initialState, finalState);

        });
    }

    updateControlsFromState(initialState, finalState) {
        if (!this.areTwoObjectsShallowEqual(initialState, finalState)) {
            const diffObject = this.getTwoObjectsShallowDifferentKeys(initialState, finalState);

            diffObject.areTransformControlsEnabled &&
            (this.areTransformControlsEnabled ? this.enableTransformControls() : this.disableTransformControls());

            diffObject.areOrbitControlsEnabled &&
            (this.areOrbitControlsEnabled ? this.enableOrbitControls() : this.disableOrbitControls());
        }
        this.render();
    }

})));
