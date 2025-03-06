import * as THREE from "three";
import { MEASUREMENT_MODES_ENUM } from "../../enums";
import { AngleLabelsManager } from "../labels/angle";
import { LinesManager } from "../lines/LinesManager";
import { calculateAngleBetweenAtoms, calculateAngleLabelPosition } from "../threeJsUtils";
import { BaseMeasurementManager } from "./base";
export class AnglesMeasurementManager extends BaseMeasurementManager {
    constructor(waveStructureGroup, waveCamera, wave, updateState) {
        const groupName = MEASUREMENT_MODES_ENUM.ANGLE;
        super(waveStructureGroup, waveCamera, wave, groupName, updateState);
        this.measurementType = MEASUREMENT_MODES_ENUM.ANGLE;
        this.LabelsManagerCls = AngleLabelsManager;
        this.labelsManager = this.getLabelsManagerInstance();
        this.linesManager = new LinesManager(waveStructureGroup, waveCamera, wave, groupName);
    }
    // @ts-ignore
    onClick(updateState, event) {
        super.onClick(event);
        updateState(this.getSettings());
        this.createMeasurements();
    }
    toggleAtomSelection(atom) {
        this.setAtomAsSelected(atom);
    }
    setAtomAsSelected(atom) {
        atom.userData.selected = true;
        this.selectedAtoms.push(atom);
    }
    extractMeasurementValues() {
        // Return as number[][] to match the interface in BaseMeasurementManager
        return this.getAnglesFromSelectedAtoms().map((angle) => [angle]);
    }
    getLabelObjectsFromSelectedObjects() {
        const triplets = this.getTripletsOfSelectedAtoms();
        const angles = this.getAnglesFromSelectedAtoms();
        return triplets.map((triplet, index) => {
            const object = new THREE.Object3D();
            const middleCoordinate = calculateAngleLabelPosition(triplet);
            object.position.copy(middleCoordinate);
            object.userData.angle = angles[index];
            return object;
        });
    }
    getAdditionalObjectsFromSelectedObjects() {
        return this.getLinesFromSelectedAtoms();
    }
    getTripletsOfSelectedAtoms() {
        const arr = this.selectedAtoms;
        return Array.from({ length: Math.floor(arr.length / 3) }, (_, i) => arr.slice(i * 3, i * 3 + 3));
    }
    getLinesFromSelectedAtoms() {
        const triplets = this.getTripletsOfSelectedAtoms();
        const lines = [];
        triplets.forEach((triplet) => {
            if (triplet.length === 3) {
                const line1 = this.linesManager.createLineBetweenAtoms(triplet[0], triplet[1]);
                const line2 = this.linesManager.createLineBetweenAtoms(triplet[1], triplet[2]);
                lines.push(line1, line2);
            }
        });
        return lines;
    }
    getAnglesFromSelectedAtoms() {
        return this.getTripletsOfSelectedAtoms().map((triplet) => calculateAngleBetweenAtoms(triplet));
    }
}
