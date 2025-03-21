import * as THREE from "three";
import { BaseMeasurementMixin } from "./baseMeasurement";
export const AngleMeasurementMixin = (superclass) => class extends BaseMeasurementMixin(superclass) {
    constructor(config) {
        super(config);
        this.angles = new THREE.Group();
        this.angles.name = "Angles";
        this.currentSelectedLine = null;
    }
    radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    calculateAngleBetweenAtoms(atoms) {
        const [firstAtom, centerAtom, lastAtom] = atoms;
        const ab = this.calculateDistanceBetweenAtoms([firstAtom, centerAtom]);
        const bc = this.calculateDistanceBetweenAtoms([centerAtom, lastAtom]);
        const ac = this.calculateDistanceBetweenAtoms([firstAtom, lastAtom]);
        const angle = (ab ** 2 + bc ** 2 - ac ** 2) / (2 * ab * bc);
        return this.radiansToDegrees(Math.acos(angle)).toFixed(2);
    }
    drawAngle(selectedAtoms, connections) {
        const angle = this.calculateAngleBetweenAtoms(selectedAtoms);
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
        const label = this.createMeasurementLabel(`${angle}°`, `label-for-${angle}`, centerPoint);
        line.userData.label = label;
    }
    deleteConnectionsUsingAngle() {
        const { userData: { atomConnections: [connectionA, connectionB], label, }, } = this.currentSelectedLine;
        this.selectedAtoms.forEach((atom, index) => {
            const atomConnections = atom.userData.connections;
            if (!atomConnections)
                return;
            const isAtomUseThisConnection = atomConnections.some((connection) => connection === connectionA.uuid || connection === connectionB.uuid);
            if (isAtomUseThisConnection) {
                atom.userData.connections = atomConnections.filter((connection) => connection !== connectionA.uuid && connection !== connectionB.uuid);
                this.selectedAtoms[index] = null;
            }
            if (!atom.userData.connections.length) {
                atom.userData.selected = false;
                atom.material.emissive.setHex(atom.currentHex);
            }
        });
        this.selectedAtoms = this.selectedAtoms.filter((atom) => atom);
        this.measurementLabelsGroup.remove(label);
        this.angles.remove(this.currentSelectedLine);
        this.atomConnections.remove(connectionA);
        this.atomConnections.remove(connectionB);
        this.currentSelectedLine = null;
        this.render();
    }
    resetAngleMeasurements() {
        const lines = [...this.angles.children];
        lines.forEach((line) => {
            this.currentSelectedLine = line;
            this.deleteConnectionsUsingAngle();
        });
    }
    handleAtomClick(atom, updateState) {
        if (this.selectedAtoms.length < 3) {
            this.selectedAtoms.push(atom);
            this.handleSetSelected(atom);
            if (this.selectedAtoms.length === 3) {
                const angle = this.calculateAngleBetweenAtoms(this.selectedAtoms);
                this.drawAngle(this.selectedAtoms);
                updateState(angle);
                this.selectedAtoms = [];
            }
        }
    }
};
