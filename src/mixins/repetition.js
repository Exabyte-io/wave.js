import { Made } from "@exabyte-io/made.js";
import * as THREE from "three";

export const RepetitionMixin = (superclass) =>
    class extends superclass {
        /**
         * Returns an array of coordinates (lattice points) to repeat the 3D objects bases on the number of repetitions.
         * The method should get the maximum number of repetitions in one of the vectors (numberOfRepetitions)
         */
        repetitionCoordinates(numberOfRepetitions) {
            const basis = new Made.Basis({
                ...this.basis.toJSON(),
                elements: ["Si"],
                coordinates: [[0, 0, 0]],
            });
            // avoid repeating in z direction if boundaries are enabled.
            const repetitions = [numberOfRepetitions, numberOfRepetitions, this.areNonPeriodicBoundariesPresent ? 1 : numberOfRepetitions];
            return Made.tools.basis.repeat(basis, repetitions).coordinates.map((c) => c.value);
        }

        /**
         * The method receives coordinates in the form of a cube (NxNxN) and repetitions we want to display
         * Returns a new array based on the received data
         */
        // eslint-disable-next-line class-methods-use-this
        coordinatesByAxes(coordinates, repetitions) {
            const {repetitionsAlongLatticeVectorA, repetitionsAlongLatticeVectorB, repetitionsAlongLatticeVectorC} = repetitions
            const maxNumberOfRepetitions = Math.max(repetitionsAlongLatticeVectorA, repetitionsAlongLatticeVectorB, repetitionsAlongLatticeVectorC)

            if (!repetitionsAlongLatticeVectorA && !repetitionsAlongLatticeVectorB && !repetitionsAlongLatticeVectorC)
                return coordinates

            let columns = coordinates.reduce((res, item, index) => {
                if (index%maxNumberOfRepetitions === 0) {
                    res[res.length] = [item]
                } else {
                    res[res.length - 1].push(item)
                }
                return res
            }, [])

            if (repetitionsAlongLatticeVectorA < maxNumberOfRepetitions)
                columns = columns.slice(0, maxNumberOfRepetitions * repetitionsAlongLatticeVectorA)
            if (repetitionsAlongLatticeVectorB < maxNumberOfRepetitions)
                columns = columns.filter((item, index) => index%maxNumberOfRepetitions < repetitionsAlongLatticeVectorB)
            if (repetitionsAlongLatticeVectorC < maxNumberOfRepetitions)
                columns = columns.map(arr => arr.filter((item, index) => index < repetitionsAlongLatticeVectorC))
            return columns.reduce((res, item) => {
                res.push(...item)
                return res
            }, [])
        }

        /**
         * Repeats a given 3D object at the lattice points given by repetitionCoordinates function.
         */
        repeatObject3DAtRepetitionCoordinates(object3D) {
            const { settings: {repetitionsAlongLatticeVectorA, repetitionsAlongLatticeVectorB, repetitionsAlongLatticeVectorC} } = this
            const coordinates = this.repetitionCoordinates(Math.max(repetitionsAlongLatticeVectorA, repetitionsAlongLatticeVectorB, repetitionsAlongLatticeVectorC));
            this.structureGroup.add(object3D);
            this.coordinatesByAxes(coordinates, {repetitionsAlongLatticeVectorA, repetitionsAlongLatticeVectorB, repetitionsAlongLatticeVectorC}).slice(1).forEach((point) => {
                const object3DClone = object3D.clone();
                object3DClone.position.add(new THREE.Vector3(...point));
                this.structureGroup.add(object3DClone);
            });
        }
    };
