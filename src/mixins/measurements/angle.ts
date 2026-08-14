import * as THREE from "three";

import { MEASUREMENT_MODES_ENUM } from "../../enums";
import { AngleLabelsManager } from "../labels/angle";
import { LabelsManagerConstructor } from "../labels/base";
import { calculateAngleBetweenAtoms, calculateAngleLabelPosition } from "../utils_three";
import { BaseMeasurementManager } from "./base";

export class AnglesMeasurementManager extends BaseMeasurementManager<AngleLabelsManager> {
    measurementType = MEASUREMENT_MODES_ENUM.ANGLE;

    override atomsPerMeasurement = 3;

    override LabelsManagerCls: LabelsManagerConstructor<AngleLabelsManager> = AngleLabelsManager;

    constructor(
        waveStructureGroup: THREE.Group,
        waveCamera: THREE.Camera,
        wave: any,
        updateState: (arg: object) => void,
    ) {
        const groupName = MEASUREMENT_MODES_ENUM.ANGLE;
        super(waveStructureGroup, waveCamera, wave, groupName, updateState);
        this.labelsManager = this.getLabelsManagerInstance();
    }

    // @ts-ignore
    override onClick(updateState: (arg: object) => void, event: MouseEvent) {
        super.onClick(event);
        updateState(this.getSettings());
        this.createMeasurements();
    }

    override toggleAtomSelection(atom: THREE.Object3D): void {
        this.setAtomAsSelected(atom);
    }

    override setAtomAsSelected(atom: THREE.Object3D): void {
        atom.userData.selected = true;
        this.selectedAtoms.push(atom);
    }

    override extractMeasurementValues(): number[] {
        return this.getAnglesFromSelectedAtoms().map((angle) => angle);
    }

    override getLabelObjectsFromSelectedObjects(): THREE.Object3D[] {
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

    override getAdditionalObjectsFromSelectedObjects(): THREE.Line[] {
        return this.getLinesFromSelectedAtoms();
    }

    getTripletsOfSelectedAtoms(): THREE.Object3D[][] {
        const arr = this.selectedAtoms;
        return Array.from({ length: Math.floor(arr.length / 3) }, (_, i) =>
            arr.slice(i * 3, i * 3 + 3),
        );
    }

    getLinesFromSelectedAtoms(): THREE.Line[] {
        const triplets = this.getTripletsOfSelectedAtoms();
        const lines: THREE.Line[] = [];

        triplets.forEach((triplet) => {
            if (triplet.length === 3) {
                const angleLine = this.linesManager.createAngleBetweenAtoms(
                    triplet[0],
                    triplet[1],
                    triplet[2],
                );
                lines.push(angleLine);
            }
        });

        return lines;
    }

    getAnglesFromSelectedAtoms(): number[] {
        return this.getTripletsOfSelectedAtoms().map((triplet) =>
            calculateAngleBetweenAtoms(triplet),
        );
    }
}
