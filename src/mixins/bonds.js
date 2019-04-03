import * as THREE from "three";
import createKDTree from "static-kdtree";
import {Made} from "@exabyte-io/made.js";
import {getElementsBondsData} from "@exabyte-io/periodic-table.js";

/*
 * Mixin containing the logic for dealing with bonds.
 */
export const BondsMixin = (superclass) => class extends superclass {

    constructor(config) {
        super(config);
        this.createBondsAsync();
        this.isDrawBondsEnabled = false;
        this.drawBonds = this.drawBonds.bind(this);
        this.createBondsAsync = this.createBondsAsync.bind(this);
    }

    /**
     * Creates bond asynchronously as bonds creation takes time for large structures.
     */
    createBondsAsync() {
        const clsInstance = this;
        clsInstance.areBondsCreated = false;
        setTimeout(() => {
            clsInstance.bondsGroup = clsInstance.createBondsGroup();
            clsInstance.areBondsCreated = true;
        }, 10);
    }

    /**
     * Whether to draw a bond between given elements.
     */
    areElementsBonded(element1, coordinate1, element2, coordinate2, bondsData) {
        const distance = Made.math.vDist(coordinate1, coordinate2);
        return Boolean(bondsData.find(b => b.length.value && b.length.value >= distance));
    }

    /**
     * Returns bonds data for unique element pairs.
     * This is to avoid calling getElementsBondsData for all elements combinations.
     */
    getBondsDataForUniqueElementPairs() {
        const bonds = [];
        const uniqueElements = this.basis.uniqueElements;
        uniqueElements.forEach((element1, index1) => {
            uniqueElements.forEach((element2, index2) => {
                if (element1 && element2 && index2 >= index1) {
                    Array.prototype.push.apply(bonds, getElementsBondsData(element1, element2));
                }
            })
        });
        return bonds;
    }

    /**
     * Returns the maximum bond length for the structure.
     */
    getMaxBondLength(bondsData) {return Made.math.max(bondsData.map(b => b.length.value || 0))}

    /**
     * Returns an array of [element, coordinate] for all elements and their neighbors.
     * The basis is repeated once in all directions (-x,x,-y,y,-z,z) to find whether the elements at the edges have bonds
     * to neighbors cells elements. Only elements with distance to edge less or equal than the maximum bond length are repeated.
     */
    getElementsAndCoordinatesArrayWithEdgeNeighbors(maxBondLength) {

        const newBasis = this.basis.clone();
        const basisCloneInCrystalCoordinates = this.basis.clone();

        newBasis.toCrystal();
        basisCloneInCrystalCoordinates.toCrystal();

        const planes = this.getCellPlanes(this.cell);

        basisCloneInCrystalCoordinates.elements.forEach((element, index) => {
            const coord = basisCloneInCrystalCoordinates.getCoordinateByIndex(index);
            if (planes.find(plane => plane.distanceToPoint(new THREE.Vector3(...coord)) <= maxBondLength)) {
                [[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1]].forEach(shiftI => {
                    newBasis.addAtom({
                        element: element,
                        coordinate: [
                            coord[0] + shiftI[0],
                            coord[1] + shiftI[1],
                            coord[2] + shiftI[2]
                        ]
                    });
                });
            }
        });

        newBasis.toCartesian();
        return newBasis.elementsAndCoordinatesArray;

    }

    /**
     * Create the half bond objects between elements.
     * k-d tree algorithm is used to optimize the time to find the element's neighbors.
     * See https://en.wikipedia.org/wiki/K-d_tree for more information.
     */
    createBondsGroup() {
        const bondsGroup = new THREE.Group();
        const bondsData = this.getBondsDataForUniqueElementPairs();
        const maxBondLength = this.getMaxBondLength(bondsData);

        const elementsAndCoordinatesArray1 = this.basis.elementsAndCoordinatesArray;
        const elementsAndCoordinatesArray2 = this.getElementsAndCoordinatesArrayWithEdgeNeighbors(maxBondLength);

        const tree = createKDTree(elementsAndCoordinatesArray2.map(([element, coordinate]) => coordinate));

        elementsAndCoordinatesArray1.forEach(([element1, coordinate1], index1) => {
            // iterate over all elements in maxBodLength radius of this element. O(3n^(2/3))
            tree.rnn(coordinate1, maxBondLength, (index2) => {
                const [element2, coordinate2] = elementsAndCoordinatesArray2[index2];
                if (index2 === index1 || !this.areElementsBonded(element1, coordinate1, element2, coordinate2, bondsData)) return;
                const bond = this.getBondObject(element1, index1, coordinate1, element2, index2, coordinate2);
                bondsGroup.add(bond);
            })
        });
        return bondsGroup;
    }

    /**
     * Iterates over all combination of atoms and draws bonds.
     */
    drawBonds() {
        if (!this.areBondsCreated) {
            this.bondsGroup = this.createBondsGroup();
            this.areBondsCreated = true;
        }
        this.repeatObject3DAtRepetitionCoordinates(this.bondsGroup);
    }

    /**
     * Draw bond as cylinder geometry.
     */
    getBondObject(element1, index1, coordinate1, element2, index2, coordinate2) {
        const vector1 = new THREE.Vector3(...coordinate1);
        const vector2 = new THREE.Vector3(...coordinate2);
        const direction = new THREE.Vector3().subVectors(vector2, vector1);
        const height = direction.length() / 2;
        direction.normalize();
        // create quaternion to rotate the cylinder
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, height, 8, 1);
        // Move the cylinder by height / 2 as the cylinder position points to the center.
        geometry.translate(0, height / 2, 0);
        const material = new THREE.MeshBasicMaterial({color: this.getAtomColorByElement(element1)});
        const bond = new THREE.Mesh(geometry, material);
        // rotate the cylinder
        bond.applyQuaternion(quaternion);
        bond.position.set(vector1.x, vector1.y, vector1.z);
        bond.name = `${element1}-${index1}:${element2}-${index2}`;
        return bond;
    }

};
