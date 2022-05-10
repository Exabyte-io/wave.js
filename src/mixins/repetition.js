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
            switch (axis) {
                case 'X':
                    return this.getCoordinatesByXAxis(coordinates, repetitions)
                case 'Y':
                    return this.getCoordinatesByYAxis(coordinates, repetitions)
                case 'Z':
                    return this.getCoordinatesByZAxis(coordinates)
                case 'XY':
                    return this.getCoordinatesByXYAxes(coordinates, repetitions)
                case 'XZ':
                    return this.getCoordinatesByXZAxes(coordinates)
                case 'YZ':
                    return this.getCoordinatesByYZAxes(coordinates, repetitions)
                default: return coordinates
            }
        }

        // eslint-disable-next-line class-methods-use-this
        getCoordinatesByYZAxes(coordinates, repetitions) {
            return coordinates.reduce((res, item, index) => {
                if(index < repetitions*repetitions)
                    res.push(item)
                return res
            }, [])
        }

        // eslint-disable-next-line class-methods-use-this
        getCoordinatesByXYAxes(coordinates, repetitions) {
            return coordinates.reduce((res, item, index) => {
                if (index % repetitions === 0)
                res.push(item)
                return res
            }, [])
        }

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
            const { settings: {repetitions, axisOfRepetitions} } = this
            const coordinates = this.repetitionCoordinates;
            this.structureGroup.add(object3D);
            this.coordinatesByAxis(axisOfRepetitions, coordinates, repetitions).forEach((point) => {
                const object3DClone = object3D.clone();
                object3DClone.position.add(new THREE.Vector3(...point));
                this.structureGroup.add(object3DClone);
            });
        }
    };
