import * as THREE from "three";
import { BaseMeasurementMixin } from "./baseMeasurement";
import {
    ATOM_CONNECTION_LINE_NAME,
    ATOM_CONNECTIONS_GROUP_NAME,
    MEASUREMENT_MODES,
} from "../../enums";
import { calculateDistanceBetweenAtoms, drawLineBetweenAtoms } from "./threeJsUtils";

type Constructor<T = {}> = new (...args: any[]) => T;

export const DistanceMeasurementMixin = <T extends Constructor>(superclass: T) =>
    class extends BaseMeasurementMixin(superclass) {
        atomConnections: THREE.Group;

        currentSelectedLine: THREE.Line | null;

        drawLineBetweenAtoms: (selectedAtoms: THREE.Object3D[]) => THREE.Line;

        constructor(config: any) {
            super(config);
            this.atomConnections = new THREE.Group();
            this.atomConnections.name = ATOM_CONNECTIONS_GROUP_NAME;
            this.currentSelectedLine = null;
            this.drawLineBetweenAtoms = drawLineBetweenAtoms.bind(this);
            this.initializeMeasurement(MEASUREMENT_MODES.DISTANCE, this.handleDistanceAtomClick);
        }

        drawDistanceText(distance: number): void {
            const label = this.createMeasurementLabel(
                `${distance.toFixed(3)}Å`,
                `label-for-${distance}`,
                this.atomConnections.children[this.atomConnections.children.length - 1].geometry
                    .boundingSphere.center,
            );
            const line = this.atomConnections.children[this.atomConnections.children.length - 1];
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

        resetDistanceMeasurements(): void {
            const connections = [...this.atomConnections.children];
            connections.forEach((connection) => {
                this.currentSelectedLine = connection as THREE.Line;
                this.deleteConnection();
            });
        }

        handleDistanceAtomClick(
            atom: THREE.Object3D,
            updateState: (distance: number) => void,
        ): void {
            console.log(this);
            if (!this.isMeasurementModeActive(MEASUREMENT_MODES.DISTANCE)) return;
            if (this.selectedAtoms.length < 2) {
                this.selectedAtoms.push(atom);
                this.handleSetSelected(atom);
                console.log(this.selectedAtoms);

                if (this.selectedAtoms.length === 2) {
                    const [firstAtom, secondAtom] = this.selectedAtoms;
                    const distance = calculateDistanceBetweenAtoms(firstAtom, secondAtom);
                    this.drawLineBetweenAtoms(this.selectedAtoms as THREE.Object3D[]);
                    this.drawDistanceText(distance);
                    updateState(distance);
                    this.selectedAtoms = [];
                }
            }
        }
    };
