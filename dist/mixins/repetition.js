import { Made } from "@mat3ra/made";
import * as THREE from "three";
import { ATOM_GROUP_NAME } from "../enums";
export const RepetitionMixin = (superclass) => class extends superclass {
    /**
     * Returns an array of coordinates (lattice points) to repeat the 3D objects bases on the number of repetitions.
     * The method should get the maximum number of repetitions in one of the vectors (numberOfRepetitions)
     */
    repetitionCoordinates(numberOfRepetitions) {
        const basis = this.basis.clone();
        basis.removeAllAtoms();
        basis.addAtom({ element: "X", coordinate: [0, 0, 0] });
        // avoid repeating in z direction if boundaries are enabled.
        const repetitions = [
            numberOfRepetitions,
            numberOfRepetitions,
            this.areNonPeriodicBoundariesPresent ? 1 : numberOfRepetitions,
        ];
        return Made.tools.basis.repeat(basis, repetitions).coordinates.map((c) => c.value);
    }
    /**
     * The method receives coordinates in the form of a cube (NxNxN) and repetitions we want to display
     * Returns a new array based on the received data
     */
    coordinatesByAxes(coordinates, repetitions) {
        const { repetitionsAlongLatticeVectorA, repetitionsAlongLatticeVectorB, repetitionsAlongLatticeVectorC, } = repetitions;
        const maxNumberOfRepetitions = Math.max(repetitionsAlongLatticeVectorA, repetitionsAlongLatticeVectorB, repetitionsAlongLatticeVectorC);
        if (!repetitionsAlongLatticeVectorA &&
            !repetitionsAlongLatticeVectorB &&
            !repetitionsAlongLatticeVectorC)
            return coordinates;
        let columns = coordinates.reduce((res, item, index) => {
            if (index % maxNumberOfRepetitions === 0) {
                res[res.length] = [item];
            }
            else {
                res[res.length - 1].push(item);
            }
            return res;
        }, []);
        if (repetitionsAlongLatticeVectorA < maxNumberOfRepetitions) {
            columns = columns.slice(0, maxNumberOfRepetitions * repetitionsAlongLatticeVectorA);
        }
        if (repetitionsAlongLatticeVectorB < maxNumberOfRepetitions) {
            columns = columns.filter((item, index) => index % maxNumberOfRepetitions < repetitionsAlongLatticeVectorB);
        }
        if (repetitionsAlongLatticeVectorC < maxNumberOfRepetitions) {
            columns = columns.map((arr) => arr.filter((item, index) => index < repetitionsAlongLatticeVectorC));
        }
        return columns.reduce((res, item) => {
            res.push(...item);
            return res;
        }, []);
    }
    /**
     * Gets repetition information including coordinates and dimensions.
     * Used by both object and atom repetition functions.
     */
    getRepetitionInfo() {
        const { settings } = this;
        const repetitions = {
            repetitionsAlongLatticeVectorA: settings.repetitionsAlongLatticeVectorA,
            repetitionsAlongLatticeVectorB: settings.repetitionsAlongLatticeVectorB,
            repetitionsAlongLatticeVectorC: settings.repetitionsAlongLatticeVectorC,
        };
        const maxRepetitions = Math.max(...Object.values(repetitions));
        const allCoordinates = this.repetitionCoordinates(maxRepetitions);
        const addedObjectsCoordinates = this.coordinatesByAxes(allCoordinates, repetitions).slice(1); // Skip original position
        return {
            coordinates: addedObjectsCoordinates,
            originalRepetitions: { ...repetitions },
            dimensions: {
                dimA: repetitions.repetitionsAlongLatticeVectorA || 1,
                dimB: repetitions.repetitionsAlongLatticeVectorB || 1,
                dimC: repetitions.repetitionsAlongLatticeVectorC || 1,
            },
        };
    }
    /**
     * Repeats a given 3D object at the lattice points given by repetitionCoordinates function.
     */
    repeatObject3DAtRepetitionCoordinates(object3D) {
        this.structureGroup.add(object3D);
        const { coordinates } = this.getRepetitionInfo();
        coordinates.forEach((point) => {
            const object3DClone = object3D.clone();
            object3DClone.position.add(new THREE.Vector3(...point));
            this.structureGroup.add(object3DClone);
        });
    }
    /**
     * Repeats a given 3D atom at the lattice points given by repetitionCoordinates function.
     * This function was added because previous one function for repeating atoms is not correct for the atoms
     * with measurement functionality.
     */
    repeatAtomsAtRepetitionCoordinates(object3D) {
        this.structureGroup.add(object3D);
        const { coordinates, dimensions } = this.getRepetitionInfo();
        const { dimB, dimC } = dimensions;
        const originalAtomCount = object3D.children.length;
        coordinates.forEach((point, pointIndex) => {
            const object3DClone = new THREE.Group();
            object3DClone.name = ATOM_GROUP_NAME;
            const indexC = pointIndex % dimC;
            const indexB = Math.floor(pointIndex / dimC) % dimB;
            const indexA = Math.floor(pointIndex / (dimC * dimB));
            object3D.children.forEach((child) => {
                const newChild = this.createClonedAtomWithUniqueIndex(child, { indexA, indexB, indexC }, dimensions, originalAtomCount, point);
                object3DClone.add(newChild);
            });
            object3DClone.position.add(new THREE.Vector3(...point));
            this.structureGroup.add(object3DClone);
        });
    }
    /**
     * Creates a cloned atom with a unique atomic index based on its position in the repetition grid
     */
    createClonedAtomWithUniqueIndex(originalAtom, gridPosition, dimensions, originalAtomCount, point) {
        const { indexA, indexB, indexC } = gridPosition;
        const { dimB, dimC } = dimensions;
        const clonedAtom = originalAtom.clone(true);
        clonedAtom.material = originalAtom.material.clone(true);
        if (clonedAtom.userData && clonedAtom.userData.atomicIndex !== undefined) {
            // clonedAtom.userData.originalAtomicIndex = clonedAtom.userData.atomicIndex;
            const uniqueIndexOffset = (indexA * dimB * dimC + indexB * dimC + indexC + 1) * originalAtomCount;
            clonedAtom.userData.atomicIndex += uniqueIndexOffset;
            clonedAtom.userData.worldPosition = new THREE.Vector3(...point).add(clonedAtom.position);
        }
        return clonedAtom;
    }
};
