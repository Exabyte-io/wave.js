import * as THREE from "three";

import {
    ATOM_CONNECTIONS_GROUP_NAME,
    MEASUREMENT_MODES,
    MIN_ANGLE_POINTS_DISTANCE,
} from "../../enums";
import { BaseMeasurementManager } from "./base";
import {
    calculateAngleBetweenAtoms,
    calculateAngleLabelPosition,
    drawLineBetweenAtoms,
    getObjectCoordinate,
} from "../threeJsUtils";

type Constructor<T = {}> = new (...args: any[]) => T;

export class AnglesMeasurementManager extends BaseMeasurementManager {
    angleConnections: THREE.Group;

    currentSelectedAngle: THREE.Line | null = null;

    drawLineBetweenAtoms: (selectedAtoms: THREE.Object3D[]) => THREE.Line;

    constructor(config: any) {
        super(config);
        this.angleConnections = new THREE.Group();
        this.angleConnections.name = ATOM_CONNECTIONS_GROUP_NAME;
        this.measurementsGroup.add(this.angleConnections);
        // TODO: add to structure group instead
        this.waveStructureGroup.add(this.angleConnections);

        this.currentSelectedAngle = null;
        this.drawLineBetweenAtoms = drawLineBetweenAtoms.bind(this);
        this.initializeMeasurement(MEASUREMENT_MODES.ANGLE, this.handleAngleAtomClick);
    }

    /**
     * Creates and adds a label for the angle measurement
     */
    drawAngleText(angle: number, line: THREE.Line): void {
        const labelPosition = calculateAngleLabelPosition(line, MIN_ANGLE_POINTS_DISTANCE);

        const label = this.createMeasurementLabel(
            `${angle}°`,
            `angle-label-${angle}`,
            labelPosition,
        );

        line.userData.label = label;
    }

    /**
     * Creates a connection between two atoms
     */
    createConnection(atomA: THREE.Object3D, atomB: THREE.Object3D): THREE.Line {
        const line = this.drawLineBetweenAtoms([atomA, atomB]);
        this.addConnectionDataToAtom(atomA, line.uuid);
        this.addConnectionDataToAtom(atomB, line.uuid);
        this.angleConnections.add(line);
        return line;
    }

    /**
     * Adds connection ID to atom userData
     */
    addConnectionDataToAtom(atom: THREE.Object3D, connectionId: string): void {
        if (!atom.userData.connections) {
            atom.userData.connections = [];
        }
        atom.userData.connections.push(connectionId);
    }

    /**
     * Creates an angle visualization between three atoms
     */
    drawAngle(atomA: THREE.Object3D, atomB: THREE.Object3D, atomC: THREE.Object3D): void {
        const angleValue = calculateAngleBetweenAtoms([atomA, atomB, atomC]);

        const connectionA = this.createConnection(atomA, atomB);
        const connectionB = this.createConnection(atomB, atomC);

        // Get world positions of the atoms
        const pointA = getObjectCoordinate(atomA);
        const pointB = getObjectCoordinate(atomB);
        const pointC = getObjectCoordinate(atomC);

        // Create the angle line
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
            const atom = this.waveStructureGroup.getObjectByProperty("uuid", uuid);
            if (atom) {
                atom.userData.connections = atom.userData.connections.filter(
                    (conn: string) => !connections.includes(conn),
                );
            }
        });

        // Remove connections and label
        connections.forEach((uuid: string) => {
            const connection = this.waveStructureGroup.getObjectByProperty("uuid", uuid);
            if (connection) this.angleConnections.remove(connection);
        });

        this.measurementsGroup.remove(label);
        this.angleConnections.remove(this.currentSelectedAngle);
        this.currentSelectedAngle = null;

        this.render();
    }

    /**
     * Handles atom selection for angle measurement
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

                this.drawAngle(atomA, atomB, atomC);
                updateState({ angle });

                this.selectedAtoms = [];
            }
        }
    }
}
