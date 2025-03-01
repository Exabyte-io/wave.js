import * as THREE from "three";

import { ATOM_CONNECTIONS_GROUP_NAME, MEASUREMENT_MODES } from "../../enums";
import { BaseMeasurementManager } from "./base";
import {
    calculateDistanceBetweenAtoms,
    drawLineBetweenAtoms,
    getLineCenterCoordinate,
} from "../threeJsUtils";

type Constructor<T = {}> = new (...args: any[]) => T;

export class DistancesMeasurementManager extends BaseMeasurementManager {
    atomConnections: THREE.Group;

    currentSelectedLine: THREE.Line | null;

    drawLineBetweenAtoms: (
        selectedAtoms: THREE.Object3D[],
        structureGroup: THREE.Object3D,
    ) => THREE.Line;

    constructor(config: any) {
        super(config);
        this.atomConnections = new THREE.Group();
        this.atomConnections.name = ATOM_CONNECTIONS_GROUP_NAME;

        this.measurementsGroup.add(this.atomConnections);
        this.scene.add(this.atomConnections);

        this.currentSelectedLine = null;
        this.drawLineBetweenAtoms = drawLineBetweenAtoms.bind(this);
        this.initializeMeasurement(MEASUREMENT_MODES.DISTANCE, this.handleDistanceAtomClick);
    }

    drawDistanceText(distance: number, line: THREE.Line): void {
        const label = this.createMeasurementLabel(
            `${distance.toFixed(3)}Å`,
            `label-for-${distance}`,
            getLineCenterCoordinate(line),
        );
        line.userData.label = label;
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

    addConnectionDataToAtom(atom: THREE.Object3D, connectionId: string) {
        if (!atom.userData.connections) {
            atom.userData.connections = [];
        }
        atom.userData.connections.push(connectionId);
    }

    handleDistanceAtomClick(
        atom: THREE.Object3D,
        updateState: (state: { distance: number }) => void,
    ): void {
        if (!this.isMeasurementModeActive(MEASUREMENT_MODES.DISTANCE)) return;
        if (this.selectedAtoms.length < 2) {
            this.selectedAtoms.push(atom);
            this.handleSetSelected(atom);

            if (this.selectedAtoms.length === 2) {
                const [firstAtom, secondAtom] = this.selectedAtoms;
                const distance = calculateDistanceBetweenAtoms(firstAtom, secondAtom);
                const line = this.drawLineBetweenAtoms(
                    this.selectedAtoms as THREE.Object3D[],
                    this.measurementsGroup,
                );
                this.addConnectionDataToAtom(firstAtom, line.uuid);
                this.addConnectionDataToAtom(secondAtom, line.uuid);
                this.measurementsGroup.add(line);
                this.scene.add(this.measurementsGroup);
                this.drawDistanceText(distance, line);
                this.render();
                updateState({ distance });
                this.selectedAtoms = [];
            }
        }
    }
}
