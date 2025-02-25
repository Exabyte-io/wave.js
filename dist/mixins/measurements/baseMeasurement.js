import * as THREE from "three";
import { ATOM_GROUP_NAME, COLORS, MEASUREMENT_LABELS_GROUP_NAME } from "../../enums";
let clickFunction = null;
let pointerMoveFunction = null;
export const BaseMeasurementMixin = (superclass) => class extends superclass {
    constructor(config) {
        super(config);
        this.initRaycaster();
        this.selectedAtoms = [];
        this.intersected = null;
        this.measurementLabelsGroup = new THREE.Group();
        this.measurementLabelsGroup.name = MEASUREMENT_LABELS_GROUP_NAME;
    }
    destroyListeners() {
        const canvas = this.renderer.domElement;
        canvas.removeEventListener("click", clickFunction);
        canvas.removeEventListener("mousemove", pointerMoveFunction);
    }
    /**
     * Function to initialize listeners for checking DOM events.
     * @param {Function} updateState - functions for updating data in react.
     * @param settings - measurements settings object, this object helps to define state in this class.
     */
    initListeners(updateState, settings) {
        this.measurementSettings = settings;
        if (settings.areCoordinatesShown) {
            this.toggleCoordinateMeasurement();
            if (!this.scene.children.includes(this.coordinateMeasurementGroup)) {
                this.scene.add(this.coordinateMeasurementGroup);
            }
        }
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
        intersectItem.userData.selected = true;
        intersectItem.material.emissive.setHex("0xff0000");
        this.render();
    }
    getPointsFromMatrixWorld(firstMatrix, secondMatrix) {
        const firstPoint = new THREE.Vector3().setFromMatrixPosition(firstMatrix);
        const secondPoint = new THREE.Vector3().setFromMatrixPosition(secondMatrix);
        return [firstPoint, secondPoint];
    }
    checkMouseCoordinates(event) {
        const canvas = this.renderer.domElement;
        this.pointer.x = (event.layerX / canvas.width) * 2 - 1;
        this.pointer.y = -(event.layerY / canvas.height) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);
    }
    setHexForAtom(intersectItem) {
        var _a;
        if (this.intersected !== intersectItem) {
            if (this.intersected) {
                (_a = this.intersected.material.emissive) === null || _a === void 0 ? void 0 : _a.setHex(this.intersected.currentHex);
            }
            this.intersected = intersectItem;
            this.intersected.currentHex = this.intersected.material.emissive.getHex();
            this.intersected.material.emissive.setHex(COLORS.RED);
            this.render();
        }
    }
    setDefaultHexForAtom() {
        this.intersected.material.emissive.setHex(this.intersected.currentHex);
    }
    createMeasurementLabel(text, name, position) {
        const label = this.createLabelSprite(text, name, this.settings.measurementLabelsConfig);
        label.position.set(...position);
        label.visible = true;
        this.measurementLabelsGroup.add(label);
        this.scene.add(this.measurementLabelsGroup);
        this.render();
        return label;
    }
    onClick(updateState, event) {
        this.checkMouseCoordinates(event);
        const intersects = this.raycaster.intersectObjects(this.getAtomGroups(), true);
        if (!intersects.length)
            return;
        const intersectItem = intersects[0].object;
        if (intersectItem.type === "Mesh") {
            this.handleAtomClick(intersectItem, updateState);
        }
    }
    onPointerMove(event) {
        var _a;
        this.checkMouseCoordinates(event);
        const intersects = this.raycaster.intersectObjects([...this.getAtomGroups()], true);
        for (const { object: intersectItem } of intersects) {
            if (this.intersected && this.intersected !== intersectItem) {
                this.setDefaultHexForAtom();
                this.intersected = null;
            }
            if (!((_a = intersectItem.userData) === null || _a === void 0 ? void 0 : _a.selected)) {
                if (intersectItem.type === "Mesh") {
                    this.setHexForAtom(intersectItem);
                    break;
                }
            }
        }
        if (!intersects.length) {
            if (this.intersected) {
                this.setDefaultHexForAtom();
            }
            this.intersected = null;
        }
    }
    resetMeasurements() {
        var _a, _b, _c;
        // Each measurement type handles its own reset
        if (this.measurementSettings) {
            if (this.measurementSettings.isDistanceShown) {
                (_a = this.resetDistanceMeasurements) === null || _a === void 0 ? void 0 : _a.call(this);
            }
            else if (this.measurementSettings.areAnglesShown) {
                (_b = this.resetAngleMeasurements) === null || _b === void 0 ? void 0 : _b.call(this);
            }
            else if (this.measurementSettings.areCoordinatesShown) {
                (_c = this.resetCoordinateMeasurements) === null || _c === void 0 ? void 0 : _c.call(this);
            }
        }
        // Common reset logic
        if (this.selectedAtoms.length) {
            this.selectedAtoms.forEach((atom) => {
                atom.userData.selected = false;
                atom.material.emissive.setHex(atom.currentHex);
            });
            this.selectedAtoms = [];
        }
        while (this.measurementLabelsGroup.children.length) {
            this.measurementLabelsGroup.remove(this.measurementLabelsGroup.children[0]);
        }
        this.render();
    }
    addConnection(atom, connectionId) {
        if (!atom.userData.connections) {
            atom.userData.connections = [];
        }
        atom.userData.connections.push(connectionId);
    }
    calculateDistanceBetweenAtoms(atoms) {
        const [firstAtom, secondAtom] = atoms;
        const [firstAtomPoint, secondAtomPoint] = this.getPointsFromMatrixWorld(firstAtom.matrixWorld, secondAtom.matrixWorld);
        return firstAtomPoint.distanceTo(secondAtomPoint);
    }
};
