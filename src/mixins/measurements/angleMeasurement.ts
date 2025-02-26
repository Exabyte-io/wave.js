import * as THREE from "three";

import {
    ATOM_CONNECTIONS_GROUP_NAME,
    MEASUREMENT_MODES,
    MIN_ANGLE_POINTS_DISTANCE,
} from "../../enums";
import { BaseMeasurementMixin } from "./baseMeasurement";
import {
    calculateAngleBetweenAtoms,
    drawLineBetweenAtoms,
    getPointsFromMatrixWorld,
} from "./threeJsUtils";

// Define a constructor type for the mixin pattern
type Constructor<T = {}> = new (...args: any[]) => T;

export const AngleMeasurementMixin = <T extends Constructor>(superclass: T) =>
    class extends BaseMeasurementMixin(superclass) {
        angleConnections: THREE.Group;

        drawLineBetweenAtoms: (
            selectedAtoms: THREE.Object3D[],
            structureGroup: THREE.Object3D,
        ) => THREE.Line;

        currentSelectedAngle: THREE.Line | null = null;

        constructor(config: any) {
            super(config);
            this.angleConnections = new THREE.Group();
            this.angleConnections.name = ATOM_CONNECTIONS_GROUP_NAME;

            this.measurementsGroup.add(this.angleConnections);
            this.scene.add(this.angleConnections);

            this.currentSelectedAngle = null;
            this.drawLineBetweenAtoms = drawLineBetweenAtoms.bind(this);
            this.initializeMeasurement(MEASUREMENT_MODES.ANGLE, this.handleAngleAtomClick);
        }

        /**
         * Creates a connection between two atoms
         */
        createConnection(atomA: THREE.Object3D, atomB: THREE.Object3D): THREE.Line {
            const line = this.drawLineBetweenAtoms([atomA, atomB], this.measurementsGroup);
            this.addConnectionDataToAtom(atomA, line.uuid);
            this.addConnectionDataToAtom(atomB, line.uuid);
            this.angleConnections.add(line);
            return line;
        }

        /**
         * Adds connection ID to atom userData
         */
        addConnectionDataToAtom(atom: THREE.Object3D, connectionId: string) {
            if (!atom.userData.connections) {
                atom.userData.connections = [];
            }
            atom.userData.connections.push(connectionId);
        }

        /**
         * Creates an angle visualization and label between three atoms
         */
        drawAngle(atomA: THREE.Object3D, atomB: THREE.Object3D, atomC: THREE.Object3D): void {
            const angleValue = calculateAngleBetweenAtoms([atomA, atomB, atomC]);

            // Create connections between atoms
            const connectionA = this.createConnection(atomA, atomB);
            const connectionB = this.createConnection(atomB, atomC);

            // Get points from the center atom to create the angle marker
            const [pointA] = getPointsFromMatrixWorld(atomA.matrixWorld, atomB.matrixWorld);
            const [, pointB] = getPointsFromMatrixWorld(atomA.matrixWorld, atomB.matrixWorld);
            const [, pointC] = getPointsFromMatrixWorld(atomB.matrixWorld, atomC.matrixWorld);

            // Create angle indicator
            const material = new THREE.LineBasicMaterial({ color: this.settings.colors.amber });
            const geometry = new THREE.BufferGeometry().setFromPoints([pointA, pointB, pointC]);

            const angleLine = new THREE.Line(geometry, material);
            angleLine.userData.connections = [connectionA.uuid, connectionB.uuid];
            angleLine.userData.atoms = [atomA.uuid, atomB.uuid, atomC.uuid];
            this.angleConnections.add(angleLine);

            // Calculate better label position using the angle bisector
            // Get vectors from center atom to the other atoms
            const vecA = new THREE.Vector3().subVectors(pointA, pointB);
            const vecC = new THREE.Vector3().subVectors(pointC, pointB);

            vecA.normalize();
            vecC.normalize();

            const bisector = new THREE.Vector3().addVectors(vecA, vecC).normalize();

            // Position the label along the bisector, offset from the center atom
            const labelPosition = new THREE.Vector3()
                .setFromMatrixPosition(atomB.matrixWorld)
                .add(bisector.multiplyScalar(MIN_ANGLE_POINTS_DISTANCE));

            const label = this.createMeasurementLabel(
                `${angleValue}°`,
                `angle-label-${angleValue}`,
                labelPosition,
            );

            angleLine.userData.label = label;
            this.render();
        }

        /**
         * Deletes selected angle connection
         */
        deleteConnection(): void {
            if (!this.currentSelectedAngle) return;

            const {
                userData: { atoms, connections, label },
            } = this.currentSelectedAngle;

            // Remove connection references from atoms
            atoms.forEach((uuid: string) => {
                const atom = this.scene.getObjectByProperty("uuid", uuid);
                if (atom) {
                    atom.userData.connections = atom.userData.connections.filter(
                        (conn: string) => !connections.includes(conn),
                    );
                }
            });

            connections.forEach((uuid: string) => {
                const connection = this.scene.getObjectByProperty("uuid", uuid);
                if (connection) {
                    this.angleConnections.remove(connection);
                }
            });

            this.measurementsGroup.remove(label);
            this.angleConnections.remove(this.currentSelectedAngle);
            this.currentSelectedAngle = null;
            this.render();
        }

        /**
         * Handles click on atoms when in angle measurement mode
         */
        handleAngleAtomClick(
            atom: THREE.Object3D,
            updateState: (state: { angle: number }) => void,
        ): void {
            if (!this.isMeasurementModeActive(MEASUREMENT_MODES.ANGLE)) return;

            if (this.selectedAtoms.length < 3) {
                this.selectedAtoms.push(atom);
                this.handleSetSelected(atom);

                if (this.selectedAtoms.length === 3) {
                    const [atomA, atomB, atomC] = this.selectedAtoms;
                    const angle = calculateAngleBetweenAtoms([atomA, atomB, atomC]);

                    const connectionA = this.drawLineBetweenAtoms(
                        [atomA, atomB] as THREE.Object3D[],
                        this.measurementsGroup,
                    );
                    const connectionB = this.drawLineBetweenAtoms(
                        [atomB, atomC] as THREE.Object3D[],
                        this.measurementsGroup,
                    );

                    this.drawAngle(atomA, atomB, atomC);
                    this.render();

                    updateState({ angle });
                    this.selectedAtoms = [];
                }
            }
        }
    };
