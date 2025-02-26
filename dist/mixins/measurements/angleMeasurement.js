import * as THREE from "three";
import { ATOM_CONNECTIONS_GROUP_NAME, MEASUREMENT_MODES, MIN_ANGLE_POINTS_DISTANCE, } from "../../enums";
import { BaseMeasurementMixin } from "./baseMeasurement";
import { calculateAngleBetweenAtoms, calculateAngleLabelPosition, drawLineBetweenAtoms, getWorldPosition, } from "./threeJsUtils";
export const AngleMeasurementMixin = (superclass) => class extends BaseMeasurementMixin(superclass) {
    constructor(config) {
        super(config);
        this.currentSelectedAngle = null;
        this.angleConnections = new THREE.Group();
        this.angleConnections.name = ATOM_CONNECTIONS_GROUP_NAME;
        this.measurementsGroup.add(this.angleConnections);
        this.scene.add(this.angleConnections);
        this.currentSelectedAngle = null;
        this.drawLineBetweenAtoms = drawLineBetweenAtoms.bind(this);
        this.initializeMeasurement(MEASUREMENT_MODES.ANGLE, this.handleAngleAtomClick);
    }
    /**
     * Creates and adds a label for the angle measurement
     */
    drawAngleText(angle, line) {
        const labelPosition = calculateAngleLabelPosition(line, MIN_ANGLE_POINTS_DISTANCE);
        const label = this.createMeasurementLabel(`${angle}°`, `angle-label-${angle}`, labelPosition);
        line.userData.label = label;
    }
    /**
     * Creates a connection between two atoms
     */
    createConnection(atomA, atomB) {
        const line = this.drawLineBetweenAtoms([atomA, atomB]);
        this.addConnectionDataToAtom(atomA, line.uuid);
        this.addConnectionDataToAtom(atomB, line.uuid);
        this.angleConnections.add(line);
        this.measurementsGroup.add(this.angleConnections);
        return line;
    }
    /**
     * Adds connection ID to atom userData
     */
    addConnectionDataToAtom(atom, connectionId) {
        if (!atom.userData.connections) {
            atom.userData.connections = [];
        }
        atom.userData.connections.push(connectionId);
    }
    /**
     * Creates an angle visualization between three atoms
     */
    drawAngle(atomA, atomB, atomC) {
        const angleValue = calculateAngleBetweenAtoms([atomA, atomB, atomC]);
        const connectionA = this.createConnection(atomA, atomB);
        const connectionB = this.createConnection(atomB, atomC);
        // Get world positions of the atoms
        const pointA = getWorldPosition(atomA);
        const pointB = getWorldPosition(atomB);
        const pointC = getWorldPosition(atomC);
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
    deleteConnection() {
        if (!this.currentSelectedAngle)
            return;
        const { userData: { atoms, connections, label }, } = this.currentSelectedAngle;
        // Remove connection references from atoms
        atoms.forEach((uuid) => {
            const atom = this.scene.getObjectByProperty("uuid", uuid);
            if (atom) {
                atom.userData.connections = atom.userData.connections.filter((conn) => !connections.includes(conn));
            }
        });
        // Remove connections and label
        connections.forEach((uuid) => {
            const connection = this.scene.getObjectByProperty("uuid", uuid);
            if (connection)
                this.angleConnections.remove(connection);
        });
        this.measurementsGroup.remove(label);
        this.angleConnections.remove(this.currentSelectedAngle);
        this.currentSelectedAngle = null;
        this.render();
    }
    /**
     * Handles atom selection for angle measurement
     */
    handleAngleAtomClick(atom, updateState) {
        if (!this.isMeasurementModeActive(MEASUREMENT_MODES.ANGLE))
            return;
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
};
