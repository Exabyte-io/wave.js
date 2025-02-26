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

type Constructor<T = {}> = new (...args: any[]) => T;

export const AngleMeasurementMixin = <T extends Constructor>(superclass: T) =>
    class extends BaseMeasurementMixin(superclass) {
        angleConnections: THREE.Group;

        currentSelectedAngle: THREE.Line | null = null;

        drawLineBetweenAtoms: (
            selectedAtoms: THREE.Object3D[],
            structureGroup: THREE.Object3D,
        ) => THREE.Line;

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

        drawAngleText(angle: number, line: THREE.Line): void {
            const positions = line.geometry.attributes.position.array;
            const pointA = new THREE.Vector3(positions[0], positions[1], positions[2]);
            const pointB = new THREE.Vector3(positions[3], positions[4], positions[5]);
            const pointC = new THREE.Vector3(positions[6], positions[7], positions[8]);

            const coordinate = this.computeLabelPosition(pointB, pointA, pointC);

            const label = this.createMeasurementLabel(
                `${angle}°`,
                `angle-label-${angle}`,
                coordinate,
            );
            line.userData.label = label;
        }

        /**
         * Creates a connection between two atoms and adds it to the scene
         */
        createConnection(atomA: THREE.Object3D, atomB: THREE.Object3D): THREE.Line {
            const line = this.drawLineBetweenAtoms([atomA, atomB], this.measurementsGroup);
            this.addConnectionDataToAtom(atomA, line.uuid);
            this.addConnectionDataToAtom(atomB, line.uuid);
            this.angleConnections.add(line);
            return line;
        }

        /**
         * Adds connection ID to an atom's userData
         */
        addConnectionDataToAtom(atom: THREE.Object3D, connectionId: string): void {
            if (!atom.userData.connections) {
                atom.userData.connections = [];
            }
            atom.userData.connections.push(connectionId);
        }

        /**
         * Computes the label position for the angle measurement
         */
        computeLabelPosition(
            pointB: THREE.Vector3,
            pointA: THREE.Vector3,
            pointC: THREE.Vector3,
        ): THREE.Vector3 {
            const vecA = new THREE.Vector3().subVectors(pointA, pointB).normalize();
            const vecC = new THREE.Vector3().subVectors(pointC, pointB).normalize();
            const bisector = new THREE.Vector3().addVectors(vecA, vecC).normalize();

            return pointB.clone().add(bisector.multiplyScalar(MIN_ANGLE_POINTS_DISTANCE));
        }

        /**
         * Draws an angle visualization and its label
         */
        drawAngle(atomA: THREE.Object3D, atomB: THREE.Object3D, atomC: THREE.Object3D): void {
            const angleValue = calculateAngleBetweenAtoms([atomA, atomB, atomC]);

            // Create connections
            const connectionA = this.createConnection(atomA, atomB);
            const connectionB = this.createConnection(atomB, atomC);

            // Get three points to form the angle
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

            this.drawAngleText(angleValue, angleLine);
            this.render();
        }

        /**
         * Deletes the selected angle connection
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

            // Remove connections and label
            connections.forEach((uuid: string) => {
                const connection = this.scene.getObjectByProperty("uuid", uuid);
                if (connection) this.angleConnections.remove(connection);
            });

            this.measurementsGroup.remove(label);
            this.angleConnections.remove(this.currentSelectedAngle);
            this.currentSelectedAngle = null;

            this.render();
        }

        /**
         * Handles atom selection for angle measurement mode
         */
        handleAngleAtomSelection(
            atom: THREE.Object3D,
            updateState: (state: { angle: number }) => void,
        ): void {
            this.selectedAtoms.push(atom);
            this.handleSetSelected(atom);

            if (this.selectedAtoms.length === 3) {
                const [atomA, atomB, atomC] = this.selectedAtoms;
                const angle = calculateAngleBetweenAtoms([atomA, atomB, atomC]);

                this.drawAngle(atomA, atomB, atomC);
                this.render();
                updateState({ angle });

                this.selectedAtoms = [];
            }
        }

        /**
         * Handles click events when in angle measurement mode
         */
        handleAngleAtomClick(
            atom: THREE.Object3D,
            updateState: (state: { angle: number }) => void,
        ): void {
            if (!this.isMeasurementModeActive(MEASUREMENT_MODES.ANGLE)) return;
            if (this.selectedAtoms.length < 3) {
                this.handleAngleAtomSelection(atom, updateState);
            }
        }
    };
