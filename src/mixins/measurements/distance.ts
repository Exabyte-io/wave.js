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

    currentSelectedLine: THREE.Line | null;

    linesManager: LinesManager;

    constructor(
        waveStructureGroup: THREE.Group,
        waveCamera: THREE.Camera,
        wave: any,
        updateState: any,
    ) {
        super(waveStructureGroup, waveCamera, wave, MEASUREMENT_MODES_ENUM.DISTANCE, updateState);
        this.labelsManager = this.getLabelsManagerInstance();
        this.currentSelectedLine = null;
        this.linesManager = new LinesManager(waveStructureGroup, waveCamera, wave);
    }

    override onClick(updateState: (arg: object) => void, event: MouseEvent) {
        super.onClick(event);
        updateState(this.getSettings());
        // Select Line
    }

    override toggleAtomSelection(atom: THREE.Object3D) {
        // The same atom can be selected multiple times for different pairs
        this.setAtomAsSelected(atom);
    }

    override setAtomAsSelected(atom: THREE.Object3D): void {
        atom.userData.selected = true;
        this.selectedAtoms.push(atom);
    }

    override extractMeasurementValues(): any[] {
        return this.getLineLengthsFromSelectedAtoms();
    }

    override getLabelObjectsFromSelectedAtoms(): THREE.Vector3[] {
        const lineCenters = this.getLineCentersFromSelectedAtoms();
        return lineCenters;
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
