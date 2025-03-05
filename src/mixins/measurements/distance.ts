import * as THREE from "three";

import { MEASUREMENT_MODES_ENUM } from "../../enums";
import { LabelsManagerConstructor } from "../labels/base";
import { DistanceLabelsManager } from "../labels/distance";
import { LinesManager } from "../lines/LinesManager";
import { calculateDistanceBetweenAtoms } from "../threeJsUtils";
import { BaseMeasurementManager } from "./base";

export class DistancesMeasurementManager extends BaseMeasurementManager<DistanceLabelsManager> {
    measurementType = MEASUREMENT_MODES_ENUM.DISTANCE;

    override LabelsManagerCls: LabelsManagerConstructor<DistanceLabelsManager> =
        DistanceLabelsManager;

    currentSelectedLine: THREE.Line | null = null;

    linesManager: LinesManager;

    constructor(
        waveStructureGroup: THREE.Group,
        waveCamera: THREE.Camera,
        wave: any,
        updateState: (arg: object) => void,
    ) {
        const groupName = MEASUREMENT_MODES_ENUM.DISTANCE;
        super(waveStructureGroup, waveCamera, wave, groupName, updateState);
        this.labelsManager = new DistanceLabelsManager(
            waveStructureGroup,
            waveCamera,
            wave,
            groupName,
        );
        this.currentSelectedLine = null;
        this.linesManager = new LinesManager(waveStructureGroup, waveCamera, wave, groupName);
    }

    override onClick(updateState: (arg: object) => void, event: MouseEvent) {
        super.onClick(event);
        updateState(this.getSettings());
        this.createMeasurements();
        // Select Line
    }

    override toggleAtomSelection(atom: THREE.Object3D): void {
        // The same atom can be selected multiple times for different pairs
        this.setAtomAsSelected(atom);
    }

    override setAtomAsSelected(atom: THREE.Object3D): void {
        atom.userData.selected = true;
        this.selectedAtoms.push(atom);
    }

    override extractMeasurementValues(): number[] {
        return this.getLineLengthsFromSelectedAtoms();
    }

    override getLabelObjectsFromSelectedObjects(): THREE.Object3D[] {
        const lineCenters = this.getLineCentersFromSelectedAtoms();
        const distances = this.getLineLengthsFromSelectedAtoms();

        return lineCenters.map((position, index) => {
            const object = new THREE.Object3D();
            object.position.copy(position);
            object.userData.distance = distances[index];
            return object;
        });
    }

    override getAdditionalObjectsFromSelectedAtoms(): THREE.Line[] {
        return this.getLinesFromSelectedAtoms();
    }

    getPairsOfSelectedAtoms(): THREE.Object3D[][] {
        const arr = this.selectedAtoms;
        return Array.from({ length: Math.floor(arr.length / 2) }, (_, i) =>
            arr.slice(i * 2, i * 2 + 2),
        );
    }

    getLinesFromSelectedAtoms(): THREE.Line[] {
        const pairs = this.getPairsOfSelectedAtoms();
        return this.linesManager.createLinesFromAtomPairs(pairs);
    }

    getLineLengthsFromSelectedAtoms(): number[] {
        return this.getPairsOfSelectedAtoms().map((atoms) =>
            calculateDistanceBetweenAtoms(atoms[0], atoms[1]),
        );
    }

    getLineCentersFromSelectedAtoms(): THREE.Vector3[] {
        const lines = this.getLinesFromSelectedAtoms();
        return lines.map((line) => this.linesManager.getLineCenterPosition(line));
    }
}
