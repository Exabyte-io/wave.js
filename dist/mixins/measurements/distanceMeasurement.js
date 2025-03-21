import * as THREE from "three";
import { BaseMeasurementMixin } from "./baseMeasurement";
import { ATOM_CONNECTION_LINE_NAME, ATOM_CONNECTIONS_GROUP_NAME } from "../../enums";
export const DistanceMeasurementMixin = (superclass) => class extends BaseMeasurementMixin(superclass) {
    constructor(config) {
        super(config);
        this.atomConnections = new THREE.Group();
        this.atomConnections.name = ATOM_CONNECTIONS_GROUP_NAME;
        this.currentSelectedLine = null;
    }
    drawLineBetweenAtoms(selectedAtoms) {
        const [firstAtom, secondAtom] = selectedAtoms;
        const [firstAtomPoint, secondAtomPoint] = this.getPointsFromMatrixWorld(firstAtom.matrixWorld, secondAtom.matrixWorld);
        const geometry = new THREE.BufferGeometry().setFromPoints([
            firstAtomPoint,
            secondAtomPoint,
        ]);
        const material = new THREE.LineBasicMaterial({ color: this.settings.colors.amber });
        const line = new THREE.Line(geometry, material);
        this.addConnection(firstAtom, line.uuid);
        this.addConnection(secondAtom, line.uuid);
        line.userData.atoms = [firstAtom.uuid, secondAtom.uuid];
        line.name = ATOM_CONNECTION_LINE_NAME;
        this.atomConnections.add(line);
        this.scene.add(this.atomConnections);
        return line;
    }
    drawDistanceText(distance) {
        const label = this.createMeasurementLabel(`${distance.toFixed(3)}Å`, `label-for-${distance}`, this.atomConnections.children[this.atomConnections.children.length - 1].geometry
            .boundingSphere.center);
        const line = this.atomConnections.children[this.atomConnections.children.length - 1];
        line.userData.label = label;
    }
    calculateDistanceBetweenAtoms(atoms) {
        const [firstAtom, secondAtom] = atoms;
        const [firstAtomPoint, secondAtomPoint] = this.getPointsFromMatrixWorld(firstAtom.matrixWorld, secondAtom.matrixWorld);
        return firstAtomPoint.distanceTo(secondAtomPoint);
    }
    deleteConnection() {
        const { userData: { atoms, label }, } = this.currentSelectedLine;
        atoms.forEach((uuid) => {
            const atom = this.scene.getObjectByProperty("uuid", uuid);
            if (atom) {
                atom.userData.connections = atom.userData.connections.filter((connection) => connection !== this.currentSelectedLine.uuid);
            }
        });
        this.measurementLabelsGroup.remove(label);
        this.atomConnections.remove(this.currentSelectedLine);
        this.currentSelectedLine = null;
        this.render();
    }
    resetDistanceMeasurements() {
        const connections = [...this.atomConnections.children];
        connections.forEach((connection) => {
            this.currentSelectedLine = connection;
            this.deleteConnection();
        });
    }
    handleAtomClick(atom, updateState) {
        if (this.selectedAtoms.length < 2) {
            this.selectedAtoms.push(atom);
            this.handleSetSelected(atom);
            if (this.selectedAtoms.length === 2) {
                const distance = this.calculateDistanceBetweenAtoms(this.selectedAtoms);
                this.drawLineBetweenAtoms(this.selectedAtoms);
                this.drawDistanceText(distance);
                updateState(distance);
                this.selectedAtoms = [];
            }
        }
    }
};
