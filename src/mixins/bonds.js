import * as THREE from "three";
import {Made} from "@exabyte-io/made.js";
import {areElementsBonded} from "@exabyte-io/periodic-table.js";

/*
 * Mixin containing the logic for dealing with bonds.
 */
export const BondsMixin = (superclass) => class extends superclass {

    constructor(config) {
        super(config);
        this.areBondsDrawn = false;
        this.bondsGroup = new THREE.Group();
        this.bondsGroup.name = "Bonds";
        this.toggleBonds = this.toggleBonds.bind(this);
    }

    /**
     * Whether to draw a bond between given elements.
     */
    areElementsBonded(element1, coordinate1, element2, coordinate2) {
        return areElementsBonded(element1, element2, Made.math.vDist(coordinate1.value, coordinate2.value));
    }

    /**
     * Iterates over all combination of atoms and draws bonds.
     */
    addBonds() {
        const basis = Made.tools.basis.repeat(this.basis, Array(3).fill(this.settings.atomRepetitions));
        basis.coordinates.forEach((coordinate1, index1) => {
            const element1 = basis.getElementByIndex(index1);
            basis.coordinates.forEach((coordinate2, index2) => {
                const element2 = basis.getElementByIndex(index2);
                // skip if elements pair is already examined or elements are not bonded.
                if (index2 <= index1 || !this.areElementsBonded(element1, coordinate1, element2, coordinate2)) return;
                const bond = this.getBondObject(element1, index1, coordinate1, element2, index2, coordinate2);
                this.bondsGroup.add(bond);
            });
        });
        this.structureGroup.add(this.bondsGroup);
    }

    /**
     * Draw bond as cylinder geometry.
     */
    getBondObject(element1, index1, coordinate1, element2, index2, coordinate2) {
        const vector1 = new THREE.Vector3(...coordinate1.value);
        const vector2 = new THREE.Vector3(...coordinate2.value);
        const direction = new THREE.Vector3().subVectors(vector2, vector1);
        const height = direction.length();
        direction.normalize();
        // create quaternion to rotate the cylinder
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, height, 8, 1);
        // Move the cylinder by height / 2 as the cylinder position points to the center.
        geometry.translate(0, height / 2, 0);
        const material = new THREE.MeshBasicMaterial();
        const bond = new THREE.Mesh(geometry, material);
        // rotate the cylinder
        bond.applyQuaternion(quaternion);
        bond.position.set(vector1.x, vector1.y, vector1.z);
        bond.name = `${element1}-${index1}:${element2}-${index2}`;
        return bond;
    }

    /**
     * Remove bonds.
     */
    removeBonds() {
        this.structureGroup.remove(this.bondsGroup);
    }

    toggleBonds() {
        if (this.areBondsDrawn) {
            this.removeBonds();
            this.areBondsDrawn = false;
        } else {
            this.addBonds();
            this.areBondsDrawn = true;
        }
    }

};
