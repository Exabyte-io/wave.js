import * as THREE from "three";
import { COORDINATE_LABELS_GROUP_NAME } from "../../enums";
import { CoordinateLabelsMixin } from "./coordinateLabels";
/*
 * Mixin containing the logic for coordinate measurements.
 * Handles selection, label creation, and clipboard operations for coordinate measurements.
 */
export const CoordinateMeasurementMixin = (superclass) => class extends CoordinateLabelsMixin(superclass) {
    constructor(config) {
        super(config);
        this.coordinateMeasurementGroup = new THREE.Group();
        this.coordinateMeasurementGroup.name = COORDINATE_LABELS_GROUP_NAME;
        this.selectedAtomsForCoordinates = new Set();
        this.coordinatesArray = [];
        this.isCoordinateMeasurementActive = false;
        this.structureGroup.add(this.coordinateMeasurementGroup);
    }
    /**
     * Toggles coordinate measurement mode on/off
     */
    toggleCoordinateMeasurement() {
        this.isCoordinateMeasurementActive = !this.isCoordinateMeasurementActive;
        if (!this.isCoordinateMeasurementActive) {
            this.clearCoordinateMeasurements();
        }
        this.coordinateMeasurementGroup.visible = this.isCoordinateMeasurementActive;
        this.render();
    }
    /**
     * Copies the current array of coordinates to clipboard
     */
    copyCoordinatesToClipboard() {
        if (this.coordinatesArray.length === 0)
            return;
        const coordsText = this.coordinatesArray.length === 1
            ? JSON.stringify(this.coordinatesArray[0])
            : JSON.stringify(this.coordinatesArray);
        navigator.clipboard.writeText(coordsText).catch(console.error);
    }
    /**
     * Selects or deselects an atom for coordinate measurement
     * @param {THREE.Mesh} atom - The atom to toggle selection for
     */
    toggleAtomCoordinateSelection(atom) {
        if (!this.isCoordinateMeasurementActive)
            return;
        if (this.selectedAtomsForCoordinates.has(atom.uuid)) {
            this.deselectAtomCoordinate(atom);
        }
        else {
            this.selectAtomCoordinate(atom);
        }
        this.copyCoordinatesToClipboard();
        this.render();
    }
    /**
     * Selects an atom and creates its coordinate label
     * @param {THREE.Mesh} atom - The atom to select
     */
    selectAtomCoordinate(atom) {
        this.selectedAtomsForCoordinates.add(atom.uuid);
        atom.userData.selected = true;
        atom.material.emissive.setHex(this.settings.colors.amber);
        const position = new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld);
        const { x, y, z } = position;
        atom.userData.coordinateArrayIndex = this.coordinatesArray.length;
        this.coordinatesArray.push([x, y, z]);
        const text = this.createCoordinateText([x, y, z]);
        const label = this.createSingleCoordinateLabel(text, position, "measurement");
        label.visible = true;
        atom.userData.coordinateLabel = label;
        this.coordinateMeasurementGroup.add(label);
    }
    /**
     * Deselects an atom and removes its coordinate label
     * @param {THREE.Mesh} atom - The atom to deselect
     */
    deselectAtomCoordinate(atom) {
        this.selectedAtomsForCoordinates.delete(atom.uuid);
        atom.userData.selected = false;
        atom.material.emissive.setHex(atom.currentHex || 0);
        if (typeof atom.userData.coordinateArrayIndex === "number") {
            this.coordinatesArray.splice(atom.userData.coordinateArrayIndex, 1);
            this.selectedAtomsForCoordinates.forEach((uuid) => {
                const otherAtom = this.scene.getObjectByProperty("uuid", uuid);
                if (otherAtom &&
                    otherAtom.userData.coordinateArrayIndex > atom.userData.coordinateArrayIndex) {
                    otherAtom.userData.coordinateArrayIndex -= 1;
                }
            });
            delete atom.userData.coordinateArrayIndex;
        }
        if (atom.userData.coordinateLabel) {
            this.coordinateMeasurementGroup.remove(atom.userData.coordinateLabel);
            atom.userData.coordinateLabel = null;
        }
    }
    /**
     * Clears all coordinate measurements and resets atoms
     */
    clearCoordinateMeasurements() {
        this.selectedAtomsForCoordinates.forEach((uuid) => {
            const atom = this.scene.getObjectByProperty("uuid", uuid);
            if (atom) {
                this.deselectAtomCoordinate(atom);
            }
        });
        this.selectedAtomsForCoordinates.clear();
        this.coordinatesArray = [];
        while (this.coordinateMeasurementGroup.children.length) {
            this.coordinateMeasurementGroup.remove(this.coordinateMeasurementGroup.children[0]);
        }
    }
    /**
     * Updates coordinate measurement labels during camera movement
     */
    adjustCoordinateMeasurementLabels() {
        if (!this.isCoordinateMeasurementActive)
            return;
        this.coordinateMeasurementGroup.children.forEach((label) => {
            const { atomPosition, atomName } = label.userData;
            const offsetVector = this.getCoordinateLabelOffsetVector(atomPosition, atomName);
            label.position.copy(atomPosition).add(offsetVector);
            label.lookAt(this.camera.position);
        });
    }
};
