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
            const maxNumberOfRepetitions = Math.max(XRepetitions, YRepetitions, ZRepetitions)
            if (XRepetitions > 1 && YRepetitions === 1 && ZRepetitions === 1)
                return this.getCoordinatesByXAxis(coordinates, XRepetitions)
            if (XRepetitions === 1 && YRepetitions > 1 && ZRepetitions === 1)
                return this.getCoordinatesByYAxis(coordinates, YRepetitions)
            if (XRepetitions === 1 && YRepetitions === 1 && ZRepetitions > 1)
                return this.getCoordinatesByZAxis(coordinates, ZRepetitions)
            if (XRepetitions > 1 && YRepetitions > 1 && ZRepetitions === 1)
                return this.getCoordinatesByNumberOfRepetitions(this.getCoordinatesByXYAxes(coordinates, maxNumberOfRepetitions), XRepetitions, YRepetitions)
            if (XRepetitions > 1 && YRepetitions === 1 && ZRepetitions > 1)
                return this.getCoordinatesByNumberOfRepetitions(this.getCoordinatesByXZAxes(coordinates), XRepetitions, ZRepetitions)
            if (XRepetitions === 1 && YRepetitions > 1 && ZRepetitions > 1)
                return this.getCoordinatesByNumberOfRepetitions(this.getCoordinatesByYZAxes(coordinates, maxNumberOfRepetitions), YRepetitions, ZRepetitions)
            if (XRepetitions > 1 && YRepetitions > 1 && ZRepetitions > 1)
                return this.getCoordinatesByXYZAxes(coordinates, maxNumberOfRepetitions, XRepetitions, YRepetitions, ZRepetitions)
            return coordinates
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
        getCoordinatesByYZAxes(coordinates, repetitions) {
            return coordinates.reduce((res, item, index) => {
                if(index < repetitions**2)
                    res.push(item)
                return res
            }, [])
        }

        // eslint-disable-next-line class-methods-use-this
        getCoordinatesByNumberOfRepetitions(coordinates, a, b) {
            if (a > b)
                return coordinates.filter((item, index) => index%a < b)
            if (b > a)
                return coordinates.slice(0, a*b)
            return coordinates
        }

        // eslint-disable-next-line class-methods-use-this
        getCoordinatesByXYZAxes(coordinates, repetitions, X, Y, Z) {
            let columns = coordinates.reduce((res, item, index) => {
                if (index%repetitions === 0) {
                    res[res.length] = [item]
                } else {
                    res[res.length - 1].push(item)
                }
                return res
            }, [])
            if (X < repetitions)
                columns = columns.slice(0, repetitions * X)
            if (Y < repetitions)
                columns = columns.filter((item, index) => index%repetitions < Y)
            if (Z < repetitions)
                columns = columns.map(arr => arr.filter((item, index) => index < Z))
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
            this.coordinatesByAxis(coordinates, {XRepetitions, YRepetitions, ZRepetitions}).slice(1).forEach((point) => {
                const object3DClone = object3D.clone();
                object3DClone.position.add(new THREE.Vector3(...point));
                this.structureGroup.add(object3DClone);
            });
        }
    };
