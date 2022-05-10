import { Made } from "@exabyte-io/made.js";
import * as THREE from "three";

export const RepetitionMixin = (superclass) =>
    class extends superclass {
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
            // avoid repeating in z direction if boundaries are enabled.
            const repetitions = [value, value, this.areNonPeriodicBoundariesPresent ? 1 : value];
            return Made.tools.basis.repeat(basis, repetitions).coordinates.map((c) => c.value);
        }

        // eslint-disable-next-line class-methods-use-this
        coordinatesByAxis(axis, coordinates, repetitions) {
            if (axis === 'X')
                return coordinates.reduce((res, item, index) => {
                    if (item[1] === 0 && index%repetitions === 0 && res.length < repetitions) {
                        res.push(item)
                    }
                    return res
                }, [])
            if (axis === 'Y')
                return coordinates.reduce((res, item, index) => {
                    if (index % repetitions === 0 && res.length < repetitions) {
                        res.push(item)
                    }
                    return res
                }, [])
            if (axis === 'Z')
                return coordinates.filter(item => item[0] === 0)
            return coordinates
        }

        /**
         * Repeats a given 3D object at the lattice points given by repetitionCoordinates function.
         */
        repeatObject3DAtRepetitionCoordinates(object3D) {
            const { settings: {repetitions} } = this
            const coordinates = this.repetitionCoordinates;
            this.structureGroup.add(object3D);
            this.coordinatesByAxis('X', coordinates, repetitions).forEach((point) => {
                const object3DClone = object3D.clone();
                object3DClone.position.add(new THREE.Vector3(...point));
                this.structureGroup.add(object3DClone);
            });
        }
    };
