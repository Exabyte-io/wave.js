import * as THREE from "three";
import { MEASUREMENT_MODES_ENUM } from "../../enums";
import { DistanceLabelsManager } from "../labels/distance";
import { calculateDistanceBetweenAtoms } from "../utils_three";
import { BaseMeasurementManager } from "./base";
export class DistancesMeasurementManager extends BaseMeasurementManager {
    constructor(waveStructureGroup, waveCamera, wave, updateState) {
        const groupName = MEASUREMENT_MODES_ENUM.DISTANCE;
        super(waveStructureGroup, waveCamera, wave, groupName, updateState);
        this.measurementType = MEASUREMENT_MODES_ENUM.DISTANCE;
        this.LabelsManagerCls = DistanceLabelsManager;
        this.labelsManager = new DistanceLabelsManager(waveStructureGroup, waveCamera, wave, groupName);
        this.currentSelectedLine = null;
    }
    // @ts-ignore
    onClick(updateState, event) {
        super.onClick(event);
        updateState(this.getSettings());
        this.createMeasurements();
    }
    toggleAtomSelection(atom) {
        // The same atom can be selected multiple times for different pairs
        this.setAtomAsSelected(atom);
    }
    setAtomAsSelected(atom) {
        atom.userData.selected = true;
        this.selectedAtoms.push(atom);
    }
    extractMeasurementValues() {
        return this.getLineLengthsFromSelectedAtoms();
    }
    getLabelObjectsFromSelectedObjects() {
        const lineCenters = this.getLineCentersFromSelectedAtoms();
        const distances = this.getLineLengthsFromSelectedAtoms();
        return lineCenters.map((position, index) => {
            const object = new THREE.Object3D();
            object.position.copy(position);
            object.userData.distance = distances[index];
            return object;
        });
    }
    getAdditionalObjectsFromSelectedObjects() {
        return this.getLinesFromSelectedAtoms();
    }
    getPairsOfSelectedAtoms() {
        const arr = this.selectedAtoms;
        return Array.from({ length: Math.floor(arr.length / 2) }, (_, i) => arr.slice(i * 2, i * 2 + 2));
    }
    getLinesFromSelectedAtoms() {
        const pairs = this.getPairsOfSelectedAtoms();
        return this.linesManager.createLinesFromAtomPairs(pairs);
    }
    getLineLengthsFromSelectedAtoms() {
        return this.getPairsOfSelectedAtoms().map((atoms) => calculateDistanceBetweenAtoms(atoms[0], atoms[1]));
    }
    getLineCentersFromSelectedAtoms() {
        const lines = this.getLinesFromSelectedAtoms();
        return lines.map((line) => this.linesManager.getLineCenterPosition(line));
    }
}
