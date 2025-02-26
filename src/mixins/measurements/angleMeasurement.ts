import * as THREE from "three";
import { BaseMeasurementMixin } from "./baseMeasurement";
import { calculateAngleBetweenAtoms, drawLineBetweenAtoms } from "./threeJsUtils";
import { MEASUREMENT_MODES } from "../../enums";

// Define a constructor type for the mixin pattern
type Constructor<T = {}> = new (...args: any[]) => T;

export const AngleMeasurementMixin = <T extends Constructor>(superclass: T) =>
    class extends BaseMeasurementMixin(superclass) {
        angles: THREE.Group;

        atomConnections: THREE.Group;

        currentSelectedLine: THREE.Line | null;

        constructor(config: any) {
            super(config);
            this.angles = new THREE.Group();
            this.angles.name = "Angles";
            this.currentSelectedLine = null;
            this.atomConnections = new THREE.Group();
            this.atomConnections.name = "AtomConnections";
            this.initializeMeasurement(MEASUREMENT_MODES.ANGLE, this.handleAngleAtomClick);
        }

        drawAngle(selectedAtoms: THREE.Object3D[], connections: THREE.Line[]): void {
            const angle = calculateAngleBetweenAtoms(selectedAtoms);
            const [connectionA, connectionB] = connections;
            const material = new THREE.LineBasicMaterial({ color: this.settings.colors.amber });
            const geometry = new THREE.BufferGeometry().setFromPoints([
                connectionA.geometry.attributes.position.array,
                connectionB.geometry.attributes.position.array,
            ]);

            const line = new THREE.Line(geometry, material);
            line.userData.atomConnections = [connectionA, connectionB];
            this.angles.add(line);
            this.scene.add(this.angles);

            const centerPoint = selectedAtoms[1].position;
            const label = this.createMeasurementLabel(
                `${angle}°`,
                `label-for-${angle}`,
                centerPoint,
            );
            line.userData.label = label;
        }

        deleteConnectionsUsingAngle(): void {
            if (this.currentSelectedLine == null) return;
            const {
                userData: {
                    atomConnections: [connectionA, connectionB],
                    label,
                },
            } = this.currentSelectedLine;

            this.selectedAtoms.forEach((atom: THREE.Object3D, index: number) => {
                const atomConnections = atom.userData.connections;
                if (!atomConnections) return;

                const doesAtomUseThisConnection = atomConnections.some(
                    (connection: string) =>
                        connection === connectionA.uuid || connection === connectionB.uuid,
                );

                if (doesAtomUseThisConnection) {
                    atom.userData.connections = atomConnections.filter(
                        (connection: string) =>
                            connection !== connectionA.uuid && connection !== connectionB.uuid,
                    );
                    this.selectedAtoms = this.selectedAtoms.filter((_, i) => i !== index);
                }

                if (!atom.userData.connections.length) {
                    atom.userData.selected = false;
                    atom.material.emissive.setHex(atom.currentHex);
                }
            });

            this.selectedAtoms = this.selectedAtoms.filter((atom: THREE.Object3D | null) => atom);
            this.measurementsGroup.remove(label);
            this.angles.remove(this.currentSelectedLine);
            this.atomConnections.remove(connectionA);
            this.atomConnections.remove(connectionB);
            this.currentSelectedLine = null;
            this.render();
        }

        resetAngleMeasurements(): void {
            const lines = [...this.angles.children];
            lines.forEach((line) => {
                this.currentSelectedLine = line as THREE.Line;
                this.deleteConnectionsUsingAngle();
            });
        }

        handleAngleAtomClick(atom: THREE.Object3D, updateState: (angle: string) => void): void {
            if (!this.isMeasurementModeActive(MEASUREMENT_MODES.ANGLE)) return;

            if (this.selectedAtoms.length < 3) {
                this.selectedAtoms.push(atom);
                this.handleSetSelected(atom);

                if (this.selectedAtoms.length === 3) {
                    const angle = calculateAngleBetweenAtoms(this.selectedAtoms);

                    const connectionA = drawLineBetweenAtoms([
                        this.selectedAtoms[0],
                        this.selectedAtoms[1],
                    ]);
                    const connectionB = drawLineBetweenAtoms([
                        this.selectedAtoms[1],
                        this.selectedAtoms[2],
                    ]);

                    this.drawAngle(this.selectedAtoms, [connectionA, connectionB]);

                    updateState(angle);
                    this.selectedAtoms = [];
                }
            }
        }
    };
