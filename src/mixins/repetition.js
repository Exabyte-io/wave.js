import * as THREE from "three";
import {Made} from "@exabyte-io/made.js";

export const RepetitionMixin = (superclass) => class extends superclass {

    /**
     * Returns an array of coordinates (lattice points) to repeat the 3D objects bases on the number of repetitions.
     */
    get repetitionCoordinates() {
        const basis = new Made.Basis({
            ...this.basis.toJSON(),
            elements: ["Si"],
            coordinates: [[0, 0, 0]],
        });
        const value = this.settings.repetitions;
        const repetitions = [value, value, this.areBoundariesEnabled ? 1 : value];
        return Made.tools.basis.repeat(basis, repetitions).coordinates.map(c => c.value);
    }

    /**
     * Repeats a given 3D object at the lattice points given by repetitionCoordinates function.
     */
    repeatObject3DAtRepetitionCoordinates(object3D) {
        this.structureGroup.add(object3D);
        this.repetitionCoordinates.slice(1).forEach(point => {
            const object3DClone = object3D.clone();
            object3DClone.position.add(new THREE.Vector3(...point));
            this.structureGroup.add(object3DClone);
        });
    }

};
