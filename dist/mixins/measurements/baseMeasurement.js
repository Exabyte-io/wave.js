import * as THREE from "three";
import { ATOM_GROUP_NAME, COLORS, MEASUREMENT_GROUP_NAME, MEASUREMENT_MODES } from "../../enums";
import { BaseLabelsMixin } from "../labels/baseLabels";
let clickFunction = null;
let pointerMoveFunction = null;
export const BaseMeasurementMixin = (superclass) => class extends BaseLabelsMixin(superclass) {
    constructor(config) {
        super(config);
        this.selectedAtoms = [];
        this.highlightedAtom = null;
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.measurementsGroup = new THREE.Group();
        this.currentMeasurementMode = MEASUREMENT_MODES.NONE;
        this.initRaycaster();
        this.selectedAtoms = [];
        this.measurementsGroup = new THREE.Group();
        this.measurementsGroup.name = MEASUREMENT_GROUP_NAME;
    }
    initializeMeasurement(measurementMode, handleAtomClick) {
        if (!this.atomClickHandlers) {
            this.atomClickHandlers = [];
        }
        this.atomClickHandlers.push({
            mode: measurementMode,
            handleClick: handleAtomClick.bind(this),
        });
        this.scene.add(this.measurementsGroup);
        this.structureGroup.add(this.measurementsGroup);
    }
    destroyListeners() {
        const canvas = this.renderer.domElement;
        if (clickFunction) {
            canvas.removeEventListener("click", clickFunction);
        }
        if (pointerMoveFunction) {
            canvas.removeEventListener("mousemove", pointerMoveFunction);
        }
    }
    /**
     * Function to initialize listeners for checking DOM events.
     * @param {Function} updateState - functions for updating data in react.
     * @param settings - measurements settings object, this object helps to define state in this class.
     */
    initListeners(updateState, settings) {
        this.measurementSettings = settings;
        clickFunction = this.onClick.bind(this, updateState);
        pointerMoveFunction = this.onPointerMove.bind(this);
        const canvas = this.renderer.domElement;
        canvas.addEventListener("click", clickFunction);
        canvas.addEventListener("mousemove", pointerMoveFunction);
    }
    initRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Line.threshold = 0.1;
        this.pointer = new THREE.Vector2();
    }
    getAtomGroups() {
        const atomGroups = [];
        this.structureGroup.children.forEach((group) => {
            if (group.name === ATOM_GROUP_NAME) {
                atomGroups.push(...group.children);
            }
        });
        return atomGroups;
    }
    handleSetSelected(intersectItem) {
        var _a, _b;
        intersectItem.userData.selected = true;
        (_b = (_a = intersectItem.material) === null || _a === void 0 ? void 0 : _a.emissive) === null || _b === void 0 ? void 0 : _b.setHex(0xff0000);
        this.render();
    }
    checkMouseCoordinates(event) {
        const canvas = this.renderer.domElement;
        this.pointer.x = (event.offsetX / canvas.width) * 2 - 1;
        this.pointer.y = -(event.offsetY / canvas.height) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);
    }
    setHexForAtom(intersectItem) {
        var _a, _b;
        if (this.highlightedAtom !== intersectItem) {
            if (this.highlightedAtom) {
                (_b = (_a = this.highlightedAtom.material) === null || _a === void 0 ? void 0 : _a.emissive) === null || _b === void 0 ? void 0 : _b.setHex(this.highlightedAtom.currentHex);
            }
            this.highlightedAtom = intersectItem;
            this.highlightedAtom.currentHex = this.highlightedAtom.material.emissive.getHex();
            this.highlightedAtom.material.emissive.setHex(COLORS.RED);
            this.render();
        }
    }
    setDefaultHexForAtom() {
        if (this.highlightedAtom) {
            this.highlightedAtom.material.emissive.setHex(this.highlightedAtom.currentHex);
        }
    }
    /**
     * Set the current measurement mode, deactivating the previous one
     * @param {string} mode - The measurement mode to activate
     * @returns {boolean} True if the mode was activated, false if it was deactivated
     */
    setMeasurementMode(mode) {
        if (this.currentMeasurementMode === mode) {
            this.currentMeasurementMode = MEASUREMENT_MODES.NONE;
            this.resetMeasurements();
            return false;
        }
        this.resetMeasurements();
        this.currentMeasurementMode = mode;
        this._updateMeasurementVisibility();
        return true;
    }
    /**
     * Update the visibility of measurement UI elements based on current mode
     * @private
     */
    _updateMeasurementVisibility() {
        this.measurementsGroup.visible = this.currentMeasurementMode !== MEASUREMENT_MODES.NONE;
        this.render();
    }
    createMeasurementLabel(text, name, position) {
        const label = this.createLabelSprite(text, name, this.settings.measurementLabelsConfig);
        label.position.copy(position);
        label.visible = true;
        this.measurementsGroup.add(label);
        this.scene.add(this.measurementsGroup);
        this.render();
        return label;
    }
    /**
     * Checks if the given measurement mode is currently active
     * @param mode The measurement mode to check
     * @returns True if the specified mode is active
     */
    isMeasurementModeActive(mode) {
        return this.currentMeasurementMode === mode;
    }
    /**
     * Function that handles clicks on atoms, forwarding to the appropriate handler
     * based on the current measurement mode.
     */
    onClick(updateState, event) {
        this.checkMouseCoordinates(event);
        const intersects = this.raycaster.intersectObjects(this.getAtomGroups(), true);
        if (!intersects.length)
            return;
        const intersectItem = intersects[0].object;
        if (intersectItem.type === "Mesh") {
            if (this.atomClickHandlers) {
                this.atomClickHandlers
                    .filter((handler) => handler.mode === this.currentMeasurementMode)
                    .forEach((handler) => {
                    handler.handleClick(intersectItem, updateState);
                });
            }
            this.render();
        }
    }
    onPointerMove(event) {
        var _a;
        this.checkMouseCoordinates(event);
        const intersects = this.raycaster.intersectObjects([...this.getAtomGroups()], true);
        for (const { object: intersectItem } of intersects) {
            if (this.highlightedAtom && this.highlightedAtom !== intersectItem) {
                this.setDefaultHexForAtom();
            }
            if (!((_a = intersectItem.userData) === null || _a === void 0 ? void 0 : _a.selected)) {
                if (intersectItem.type === "Mesh") {
                    this.setHexForAtom(intersectItem);
                    break;
                }
            }
        }
        if (!intersects.length) {
            if (this.highlightedAtom) {
                this.setDefaultHexForAtom();
            }
        }
        this.render();
    }
    /**
     * Resets all measurements and clears selected atoms
     */
    resetMeasurements() {
        if (this.selectedAtoms.length) {
            this.selectedAtoms.forEach((atom) => {
                if (atom) {
                    atom.userData.selected = false;
                    atom.material.emissive.setHex(atom.currentHex);
                }
            });
            this.selectedAtoms = [];
        }
        while (this.measurementsGroup.children.length) {
            this.measurementsGroup.remove(this.measurementsGroup.children[0]);
        }
        this.render();
    }
};
