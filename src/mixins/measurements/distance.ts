import * as THREE from "three";

import {
    ATOM_CONNECTIONS_GROUP_NAME,
    MEASUREMENT_MODES,
    MEASUREMENT_MODES_ENUM,
} from "../../enums";
import { LabelsManagerConstructor } from "../labels/base";
import { DistanceLabelsManager } from "../labels/distance";
import {
    calculateDistanceBetweenAtoms,
    drawLineBetweenTwoAtoms,
    getLineCenterCoordinate,
} from "../threeJsUtils";
import { BaseMeasurementManager } from "./base";

export class DistancesMeasurementManager extends BaseMeasurementManager<DistanceLabelsManager> {
    measurementType = MEASUREMENT_MODES_ENUM.DISTANCE;

    override LabelsManagerCls: LabelsManagerConstructor<DistanceLabelsManager> =
        DistanceLabelsManager;

    atomConnections: THREE.Group;

    currentSelectedLine: THREE.Line | null;

    constructor(
        waveStructureGroup: THREE.Group,
        waveCamera: THREE.Camera,
        wave: any,
        updateState: any,
    ) {
        super(waveStructureGroup, waveCamera, wave, MEASUREMENT_MODES.DISTANCE, updateState);
        this.labelsManager = this.getLabelsManagerInstance();
    }

    deleteConnection(): void {
        if (!this.currentSelectedLine) return;

        const {
            userData: { atoms, label },
        } = this.currentSelectedLine;

        atoms.forEach((uuid: string) => {
            const atom = this.scene.getObjectByProperty("uuid", uuid);
            if (atom) {
                atom.userData.connections = atom.userData.connections.filter(
                    (connection: string) => connection !== this.currentSelectedLine!.uuid,
                );
            }
        });

        this.measurementsGroup.remove(label);
        this.atomConnections.remove(this.currentSelectedLine);
        this.currentSelectedLine = null;
        this.render();
    }

    onClick = (updateState: (arg: object) => void, event: MouseEvent) => {
        super.onClick(event);
        updateState(this.getSettings());
        // Select Line
    };

    getLabelObjectsFromSelectedAtoms() {
        const lineCenters = this.getLineCentersFromSelectedAtoms();
        const lineLenghts = this.getLineLengthsFromSelectedAtoms();
        const THREEObjects = lineCenters.map((position, index) => {
            const object = new THREE.Object3D();
            object.name = lineLenghts[index].toFixed(3);
            return object.position.copy(position);
        });
        return THREEObjects;
    }

    getAdditionalObjectsFromSelectedAtoms(): any[] {
        return this.getLinesFromSelectedAtoms();
    }

    getPairsOfSelectedAtoms() {
        const arr = this.selectedAtoms;
        return Array.from({ length: arr.length / 2 }, (_, i) => arr.slice(i * 2, i * 2 + 2));
    }

    getLinesFromSelectedAtoms() {
        const pairs = this.getPairsOfSelectedAtoms();
        return pairs.map((pair) => drawLineBetweenTwoAtoms(pair));
    }

    getLineLengthsFromSelectedAtoms() {
        return this.getPairsOfSelectedAtoms().map((atoms) =>
            calculateDistanceBetweenAtoms(atoms[0], atoms[1]),
        );
    }

    getLineCentersFromSelectedAtoms() {
        return this.getLinesFromSelectedAtoms().map((line) => getLineCenterCoordinate(line));
    }
}
