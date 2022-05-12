import { Made } from "@exabyte-io/made.js";
import * as THREE from "three";

export const RepetitionMixin = (superclass) =>
    class extends superclass {
        /**
         * Returns an array of coordinates (lattice points) to repeat the 3D objects bases on the number of repetitions.
         */
        repetitionCoordinates(value) {
            const basis = new Made.Basis({
                ...this.basis.toJSON(),
                elements: ["Si"],
                coordinates: [[0, 0, 0]],
            });
            // avoid repeating in z direction if boundaries are enabled.
            const repetitions = [value, value, this.areNonPeriodicBoundariesPresent ? 1 : value];
            return Made.tools.basis.repeat(basis, repetitions).coordinates.map((c) => c.value);
        }

        // eslint-disable-next-line class-methods-use-this
        coordinatesByAxes(coordinates, repetitions) {
            const {XRepetitions, YRepetitions, ZRepetitions} = repetitions
            const maxNumberOfRepetitions = Math.max(XRepetitions, YRepetitions, ZRepetitions)

            let columns = coordinates.reduce((res, item, index) => {
                if (index%maxNumberOfRepetitions === 0) {
                    res[res.length] = [item]
                } else {
                    res[res.length - 1].push(item)
                }
                return res
            }, [])

            if (XRepetitions < maxNumberOfRepetitions)
                columns = columns.slice(0, maxNumberOfRepetitions * XRepetitions)
            if (YRepetitions < maxNumberOfRepetitions)
                columns = columns.filter((item, index) => index%maxNumberOfRepetitions < YRepetitions)
            if (ZRepetitions < maxNumberOfRepetitions)
                columns = columns.map(arr => arr.filter((item, index) => index < ZRepetitions))
            return columns.reduce((res, item) => {
                res.push(...item)
                return res
            }, [])
        }

        /**
         * Repeats a given 3D object at the lattice points given by repetitionCoordinates function.
         */
        repeatObject3DAtRepetitionCoordinates(object3D) {
            const { settings: {XRepetitions, YRepetitions, ZRepetitions} } = this
            const coordinates = this.repetitionCoordinates(Math.max(XRepetitions, YRepetitions, ZRepetitions));
            this.structureGroup.add(object3D);
            this.coordinatesByAxes(coordinates, {XRepetitions, YRepetitions, ZRepetitions}).slice(1).forEach((point) => {
                const object3DClone = object3D.clone();
                object3DClone.position.add(new THREE.Vector3(...point));
                this.structureGroup.add(object3DClone);
            });
        }
    };
