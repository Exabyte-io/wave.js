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
        coordinatesByAxis(coordinates, repetitions) {
            const {XRepetitions, YRepetitions, ZRepetitions} = repetitions
            if (XRepetitions > 1 && YRepetitions === 1 && ZRepetitions === 1)
                return this.getCoordinatesByXAxis(coordinates, XRepetitions)
            if (XRepetitions === 1 && YRepetitions > 1 && ZRepetitions === 1)
                return this.getCoordinatesByYAxis(coordinates, YRepetitions)
            if (XRepetitions === 1 && YRepetitions === 1 && ZRepetitions > 1)
                return this.getCoordinatesByZAxis(coordinates, ZRepetitions)
            // TODO changes in these methods
            if (XRepetitions > 1 && YRepetitions > 1 && ZRepetitions === 1) {
                return this.getCoordinatesByXYAxes(coordinates, XRepetitions, YRepetitions)
            }
            if (XRepetitions > 1 && YRepetitions === 1 && ZRepetitions > 1) {
                return this.getCoordinatesByXZAxes(coordinates, ZRepetitions)
            }
            if (XRepetitions === 1 && YRepetitions > 1 && ZRepetitions > 1) {
                return this.getCoordinatesByXZAxes(coordinates, ZRepetitions)
            }
            // TODO method for XYZ
            if (XRepetitions > 1 && YRepetitions > 1 && ZRepetitions > 1) {
                return coordinates
            }
            return coordinates
        }

        // side
        // eslint-disable-next-line class-methods-use-this
        getCoordinatesByYZAxes(coordinates, repetitions) {
            return coordinates.reduce((res, item, index) => {
                if(index < repetitions*repetitions)
                    res.push(item)
                return res
            }, [])
        }

        // down
        // eslint-disable-next-line class-methods-use-this
        getCoordinatesByXYAxes(coordinates, X, Y) {
            const result = coordinates.reduce((res, item, index) => {
                if (index % Math.max(X, Y) === 0)
                    res.push(item)
                return res
            }, [])

            if (X > Y)
                return result.filter((item, index) => index%X < Y)
            if (Y > X)
                return result.slice(0, X*Y)
            return result
        }

        // front
        // eslint-disable-next-line class-methods-use-this
        getCoordinatesByXZAxes(coordinates) {
            return coordinates.filter(item => item[1] === 0)
        }

        // eslint-disable-next-line class-methods-use-this
        getCoordinatesByXAxis(coordinates, repetitions) {
            return coordinates.reduce((res, item, index) => {
                if (item[1] === 0 && index%repetitions === 0 && res.length < repetitions) {
                    res.push(item)
                }
                return res
            }, [])
        }

        // eslint-disable-next-line class-methods-use-this
        getCoordinatesByYAxis(coordinates, repetitions) {
            return coordinates.reduce((res, item, index) => {
                if (index % repetitions === 0 && res.length < repetitions) {
                    res.push(item)
                }
                return res
            }, [])
        }

        // eslint-disable-next-line class-methods-use-this
        getCoordinatesByZAxis(coordinates) {
            return coordinates.filter(item => item[0] === 0)
        }

        /**
         * Repeats a given 3D object at the lattice points given by repetitionCoordinates function.
         */
        repeatObject3DAtRepetitionCoordinates(object3D) {
            const { settings: {XRepetitions, YRepetitions, ZRepetitions} } = this
            const coordinates = this.repetitionCoordinates(Math.max(XRepetitions, YRepetitions, ZRepetitions));
            this.structureGroup.add(object3D);
            this.coordinatesByAxis(coordinates, {XRepetitions, YRepetitions, ZRepetitions}).forEach((point) => {
                const object3DClone = object3D.clone();
                object3DClone.position.add(new THREE.Vector3(...point));
                this.structureGroup.add(object3DClone);
            });
        }
    };
