import { Made } from "@exabyte-io/made.js";
import * as THREE from "three";

export const RepetitionMixin = (superclass) =>
    class extends superclass {
        /**
         * Returns an array of coordinates (lattice points) to repeat the 3D objects bases on the number of repetitions.
         */
        get repetitionCoordinates() {
            const {
                settings: { coordinates },
            } = this;
            const basis = new Made.Basis({
                ...this.basis.toJSON(),
                elements: ["Si"],
                coordinates: [[0, 0, 0]],
            });
            const value = this.settings.repetitions;
            // avoid repeating in z direction if boundaries are enabled.
            const repetitions = [value, value, this.areNonPeriodicBoundariesPresent ? 1 : value];
            const basicCoordinates = Made.tools.basis
                .repeat(basis, repetitions)
                .coordinates.map((c) => c.value);
            if (coordinates && coordinates.length > 0) {
                if (coordinates.length >= basicCoordinates.length)
                    return coordinates.slice(0, basicCoordinates.length);
                return basicCoordinates.map((item, index) =>
                    coordinates[index] ? coordinates[index] : item,
                );
            }
            return basicCoordinates;
        }

        /**
         * Repeats a given 3D object at the lattice points given by repetitionCoordinates function.
         */
        repeatObject3DAtRepetitionCoordinates(object3D, coordinates) {
            const repetitionCoordinates = coordinates || this.repetitionCoordinates;
            this.structureGroup.add(object3D);
            repetitionCoordinates.slice(1).forEach((point) => {
                const object3DClone = object3D.clone();
                object3DClone.position.add(new THREE.Vector3(...point));
                this.structureGroup.add(object3DClone);
            });
        }
    };
