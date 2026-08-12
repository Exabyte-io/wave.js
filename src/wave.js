/* eslint-disable max-classes-per-file */
import "./stylesheets/main.css";

import { mix } from "mixwith";
import * as THREE from "three";

import { ATOM_GROUP_NAME } from "./enums";
import { AtomsMixin } from "./mixins/atoms";
import { BondsMixin } from "./mixins/bonds";
import { BoundaryMixin } from "./mixins/boundary";
import { CellMixin } from "./mixins/cell";
import { ControlsMixin } from "./mixins/controls";
import { GroupTransformMixin } from "./mixins/group_transform";
import { ImageMixin } from "./mixins/image";
import { InteractiveStructureEditorMixin } from "./mixins/interactive_structure_editor";
import { AllLabelsMixin } from "./mixins/labels/all";
import { MarqueeSelectionMixin } from "./mixins/marquee_selection";
import { AllMeasurementsMixin } from "./mixins/measurements/all";
import { RepetitionMixin } from "./mixins/repetition";
import SETTINGS from "./settings";

const TV3 = THREE.Vector3;
const TCo = THREE.Color;

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
    constructor({ DOMElement, structure, cell, settings = {} }) {
        this._structure = structure;

        this._cell = cell;

        // Visible Scene Height = (Max between cell height and width) x PADDING_RATIO,
        // e.g. when PADDING_RATIO = 1.25 and the cell height is more than its width,
        // the top and bottom padding within viewport equals half of 25% of cell height.
        this.PADDING_RATIO = 1.25;

        this.container = DOMElement;

        this.updateSettings(settings);
        this.areLabelsShown = this.settings.areLabelsInitiallyShown;

        this.initDimensions();
        this.initRenderer();
        this.initScene();
        this.initCameras();
        this.initStructureGroup();
        this.setupLights();

        this.handleResize = this.handleResize.bind(this);
        this.setBackground = this.setBackground.bind(this);
        this.doFunc = this.doFunc.bind(this);
    }

    updateSettings(settings) {
        this.settings = { ...SETTINGS, ...settings };
    }

    initDimensions() {
        this.WIDTH = this.container.clientWidth;
        this.HEIGHT = this.container.clientHeight;
        this.ASPECT = this.WIDTH > 0 && this.HEIGHT > 0 ? this.WIDTH / this.HEIGHT : 1;
    }

    // eslint-disable-next-line class-methods-use-this
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
        // Observes the container itself (not the window) so resizing works correctly when the
        // container's size changes for reasons other than a window resize (e.g. a layout panel
        // opening/closing) - disconnected in dispose() to avoid leaking across reset/re-init.
        this._resizeObserver = new ResizeObserver(() => this.handleResize());
        this._resizeObserver.observe(this.container);
    }

    /**
     * Releases the renderer/WebGL context and the resize observer. Must be called before
     * discarding a Wave instance (e.g. on component unmount or before constructing a
     * replacement instance for the same container), otherwise both leak.
     */
    dispose() {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
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
        this.scene.add(camera);
        return camera;
    }

    /**
     * Initializes the cameras; frustum size and distance to camera
     * are set only for initialization;
     * on the next step, they are adjusted to cell geometry
     */
    initCameras() {
        const perspectiveCameraParams = [20, this.ASPECT, 1, 20000];
        this.perspectiveCamera = this.addCameraToScene(
            "PerspectiveCamera",
            ...perspectiveCameraParams,
        );
        const orthographicCameraParams = [-10 * this.ASPECT, 10 * this.ASPECT, 10, -10, 1, 1000];
        this.orthographicCamera = this.addCameraToScene(
            "OrthographicCamera",
            ...orthographicCameraParams,
        );
        this.camera = this.perspectiveCamera; // set default camera
    }

    /**
     * Places both cameras in the point displaced from the cell center along the negative X-axis
     * and adjusts perspective camera position and orthographic camera frustum so that
     * the viewport contains the entire cell with the padding set by PADDING_RATIO;
     * takes the cell's center point in the form of a coordinate array and
     * the maximum between the height and width.
     * @param {{center:Array<Number>, maxSize:Number}}
     */
    adjustCamerasTargetAndFrustum({ center, maxSize }) {
        const fovInRadians = (this.perspectiveCamera.fov * Math.PI) / 180;
        const distanceToCamera = (this.PADDING_RATIO * maxSize) / Math.tan(fovInRadians);

        this.perspectiveCamera.position.copy(new TV3(-distanceToCamera, center[1], center[2] + 10));
        this.perspectiveCamera.lookAt(new TV3(...center));

        this.orthographicCamera.position.copy(new TV3(-500, center[1], center[2]));
        this.setOrthographicCameraFrustum(this.PADDING_RATIO * maxSize);
        this.orthographicCamera.lookAt(new TV3(...center));
    }

    get isCameraOrthographic() {
        return this.camera.isOrthographicCamera;
    }

    toggleOrthographicCamera() {
        this.camera = this.isCameraOrthographic ? this.perspectiveCamera : this.orthographicCamera;
        this.camera.add(this.directionalLight);
        this.camera.add(this.ambientLight);
        this.orbitControls.object = this.camera;
    }

    /**
     * Helper method to set the orthographic frustum dimensions based on
     * the required scene size and the aspect ratio of the viewport
     * @param {number} sceneSize
     */
    setOrthographicCameraFrustum(sceneSize) {
        this.orthographicCamera.left = (-sceneSize / 2) * this.ASPECT;
        this.orthographicCamera.right = (sceneSize / 2) * this.ASPECT;
        this.orthographicCamera.top = sceneSize / 2;
        this.orthographicCamera.bottom = -sceneSize / 2;
        // Kept here rather than left to each caller so the frustum fields and the matrix that
        // actually projects can never disagree. adjustCamerasTargetAndFrustum did not update it,
        // so between construction and the first resize the orthographic camera rendered the
        // initial +-10 frustum from initCameras instead of the cell-fitted one - invisible in a
        // browser, where ResizeObserver fires immediately and handleResize repaired it, and
        // load-bearing for figure export, whose scale bar reads these fields.
        this.orthographicCamera.updateProjectionMatrix();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.name = "Scene";
        this.scene.background = new TCo(this.settings.backgroundColor);
        this.scene.fog = new THREE.FogExp2(this.settings.backgroundColor, 0.00025 / 100);
    }

    // eslint-disable-next-line class-methods-use-this
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
     * to avoid image deformation when the user resizes the browser window
     * @param {node} domElement
     */
    handleResize(domElement = this.container) {
        this.setViewportSize(domElement.clientWidth, domElement.clientHeight);
    }

    /**
     * Points the renderer and both cameras at an explicit pixel size.
     *
     * `updateStyle: false` changes only the drawing buffer and leaves the canvas's CSS size alone,
     * which is what figure export needs (mixins/image.js): it renders at a publication resolution
     * that the on-screen layout must not follow, and `renderer.setSize` would otherwise replace the
     * `width: 100%` set in initRenderer with a pixel width and break the responsive canvas.
     *
     * @param width {Number} drawing buffer width in pixels
     * @param height {Number} drawing buffer height in pixels
     * @param updateStyle {Boolean} whether to also set the canvas element's CSS size
     */
    setViewportSize(width, height, updateStyle = true) {
        const { maxSize } = this.getCellViewParams();

        this.WIDTH = width;
        this.HEIGHT = height;
        // Guarded as in initDimensions: a container measured at zero height (a collapsed panel, or
        // a detached node) otherwise puts NaN into the projection matrix and blanks the canvas.
        this.ASPECT = width > 0 && height > 0 ? width / height : 1;
        this.renderer.setSize(width, height, updateStyle);
        this.perspectiveCamera.aspect = this.ASPECT;
        this.perspectiveCamera.updateProjectionMatrix();

        this.setOrthographicCameraFrustum(this.PADDING_RATIO * maxSize);
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
        // eslint-disable-next-line no-bitwise, no-param-reassign
        a |= 1.0;
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
    AllLabelsMixin,
    AllMeasurementsMixin,
    ImageMixin,
    MarqueeSelectionMixin,
    GroupTransformMixin,
    InteractiveStructureEditorMixin,
) {
    /**
     *
     * @param {Object} config
     */
    constructor(config) {
        super(config);
        this.adjustCamerasAndOrbitControlsToCell();
        this.rebuildScene();
        this.rebuildScene = this.rebuildScene.bind(this);
        this.render = this.render.bind(this);
        this.doFunc = this.doFunc.bind(this);
    }

    clearView() {
        while (this.structureGroup.children.length) {
            this.structureGroup.remove(this.structureGroup.children[0]);
        }
    }

    adjustCamerasAndOrbitControlsToCell() {
        const cellViewParams = this.getCellViewParams();
        this.adjustCamerasTargetAndFrustum(cellViewParams);
        this.adjustOrbitControlsTarget(cellViewParams.center);
    }

    // Scoped to the FIRST child named ATOM_GROUP_NAME, matching extractBasisFromScene's own
    // (already-fixed) traversal in utils.js: RepetitionMixin.repeatAtomsAtRepetitionCoordinates
    // adds the real, base-structure group first and every repetition clone after, each also
    // named ATOM_GROUP_NAME but with its atoms' userData.atomicIndex deliberately offset out of
    // the material's actual range. Iterating every matching group (the previous behavior) made
    // those clones - with out-of-range indices - real, clickable, draggable meshes in edit mode:
    // selecting one showed a blank/zero coordinate panel (indexing basis.coordinates[] with an
    // index that doesn't exist), and dragging one committed a spurious no-op history entry before
    // visibly snapping back on the next rebuild (the clone's position is always re-derived from
    // the unchanged base atom, never actually stored).
    collectSelectableAtoms() {
        const atoms = [];
        const atomsGroup = this.structureGroup.children.find(
            (group) => group.name === ATOM_GROUP_NAME,
        );
        if (atomsGroup) {
            atomsGroup.children.forEach((atom) => {
                if (atom instanceof THREE.Mesh) {
                    atoms.push(atom);
                }
            });
        }

        return atoms;
    }

    // Called on each change to the Redux store via reloadViewer.
    rebuildScene() {
        // Rebuilding replaces every atom mesh, so the edit-mode selection (and the gizmo
        // attached to it) must be re-pointed at the atoms' new mesh instances afterwards. Uses
        // the full multi-select array (D-4), not just the single last-selected atom - otherwise
        // a rebuild mid-group-selection (e.g. the host's onStructureModified round-trip calling
        // setStructure+rebuildScene again after a group move/rotate/clone) would silently
        // collapse the selection down to one atom.
        const selectedAtomicIndices = (this.selectedMeshes_ || []).map(
            (mesh) => mesh.userData.atomicIndex,
        );

        this.clearView();
        this.drawAtomsAsSpheres();
        this.drawUnitCell();
        this.drawBoundaries();
        if (this.isDrawBondsEnabled) this.drawBonds();
        this.createAllLabels();
        this.createAllMeasurements();
        if (this.isEditModeEnabled_) this.reselectAtomsByIndices(selectedAtomicIndices);
        this.render();
    }

    render() {
        this.adjustAllLabelsToCameraPosition();
        this.renderer.render(this.scene, this.camera);
        if (this.renderer2) this.renderer2.render(this.scene2, this.camera2);
    }

    doFunc(func) {
        func(this);
    } // for scripting
}
