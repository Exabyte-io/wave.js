import * as THREE from "three";
import {Made} from "@exabyte-io/made.js";
import {getElementsBondsData} from "@exabyte-io/periodic-table.js";

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
    areElementsBonded(element1, coordinate1, element2, coordinate2, bondsData) {
        const distance = Made.math.vDist(coordinate1, coordinate2);
        return Boolean(bondsData.find(b => b.length.value && b.length.value >= distance));
    }

    getBondsData() {
        const bonds = [];
        const uniqueElements = this.basis.uniqueElements;
        uniqueElements.forEach((element1, index1) => {
            uniqueElements.forEach((element2, index2) => {
                if (index2 >= index1) Array.prototype.push.apply(bonds, getElementsBondsData(element1, element2));
            })
        });
        return bonds;
    }

    /**
     * Iterates over all combination of atoms and draws bonds.
     */
    addBonds() {
        const bondsData = this.getBondsData();
        const elementsAndCoordinatesArray = this.basis.elementsAndCoordinatesArray;
        elementsAndCoordinatesArray.forEach(([element1, coordinate1], index1) => {
            elementsAndCoordinatesArray.forEach(([element2, coordinate2], index2) => {
                // skip if elements pair is already examined or elements are not bonded.
                if (index2 <= index1 || !this.areElementsBonded(element1, coordinate1, element2, coordinate2, bondsData)) return;
                const bond = this.getBondObject(element1, index1, coordinate1, element2, index2, coordinate2);
                this.bondsGroup.add(bond);
            });
        });
        this.structureGroup.add(this.bondsGroup);
        this.latticePoints.slice(1).forEach(point => {
            const bondsGroupClone = this.bondsGroup.clone();
            bondsGroupClone.position.add(new THREE.Vector3(...point));
            this.structureGroup.add(bondsGroupClone);
        });

    }

    /**
     * Draw bond as cylinder geometry.
     */
    getBondObject(element1, index1, coordinate1, element2, index2, coordinate2) {
        const vector1 = new THREE.Vector3(...coordinate1);
        const vector2 = new THREE.Vector3(...coordinate2);
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
     * Draw bond with line geometry.
     */
    getBondObjectAsLine(element1, index1, coordinate1, element2, index2, coordinate2) {
        const material = new THREE.LineBasicMaterial();
        const geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(...coordinate1));
        geometry.vertices.push(new THREE.Vector3(...coordinate2));
        const bond = new THREE.Line(geometry, material);
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
