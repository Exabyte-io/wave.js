import * as THREE from "three";
import { ATOM_CONNECTIONS_GROUP_NAME, MEASUREMENT_MODES } from "../../enums";
import { BaseMeasurementMixin } from "./baseMeasurement";
import { calculateDistanceBetweenAtoms, drawLineBetweenAtoms, getLineCenterCoordinate, } from "./threeJsUtils";
export const DistanceMeasurementMixin = (superclass) => class extends BaseMeasurementMixin(superclass) {
    constructor(config) {
        super(config);
        this.atomConnections = new THREE.Group();
        this.atomConnections.name = ATOM_CONNECTIONS_GROUP_NAME;
        this.measurementsGroup.add(this.atomConnections);
        this.scene.add(this.atomConnections);
        this.currentSelectedLine = null;
        this.drawLineBetweenAtoms = drawLineBetweenAtoms.bind(this);
        this.initializeMeasurement(MEASUREMENT_MODES.DISTANCE, this.handleDistanceAtomClick);
    }
    drawDistanceText(distance, line) {
        const label = this.createMeasurementLabel(`${distance.toFixed(3)}Å`, `label-for-${distance}`, getLineCenterCoordinate(line));
        line.userData.label = label;
    }
    deleteConnection() {
        if (!this.currentSelectedLine)
            return;
        const { userData: { atoms, label }, } = this.currentSelectedLine;
        atoms.forEach((uuid) => {
            const atom = this.scene.getObjectByProperty("uuid", uuid);
            if (atom) {
                atom.userData.connections = atom.userData.connections.filter((connection) => connection !== this.currentSelectedLine.uuid);
            }
        });
        this.measurementsGroup.remove(label);
        this.atomConnections.remove(this.currentSelectedLine);
        this.currentSelectedLine = null;
        this.render();
    }
    addConnectionDataToAtom(atom, connectionId) {
        if (!atom.userData.connections) {
            atom.userData.connections = [];
        }
        atom.userData.connections.push(connectionId);
    }
    handleDistanceAtomClick(atom, updateState) {
        if (!this.isMeasurementModeActive(MEASUREMENT_MODES.DISTANCE))
            return;
        if (this.selectedAtoms.length < 2) {
            this.selectedAtoms.push(atom);
            this.handleSetSelected(atom);
            if (this.selectedAtoms.length === 2) {
                const [firstAtom, secondAtom] = this.selectedAtoms;
                const distance = calculateDistanceBetweenAtoms(firstAtom, secondAtom);
                const line = this.drawLineBetweenAtoms(this.selectedAtoms, this.measurementsGroup);
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
};
