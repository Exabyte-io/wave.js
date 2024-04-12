import { Made } from "@mat3ra/made";
import * as THREE from "three";

import { BOUNDARY_CONDITIONS } from "../enums";

export const BoundaryMixin = (superclass) =>
    class extends superclass {
        /**
         * boundaryConditions.type {String}: type of the boundary.
         * boundaryConditions.offset {Number} boundary offset (esm_w).
         */
        constructor(config) {
            super(config);
            this.boundaryConditions = config.boundaryConditions || {};
        }

        /**
         * Boundaries are drawn only if type is "bc1", "bc2", or "bc3".
         *  bc1 : Immerse the slab between two semi-infinite vacuum regions;
         *  bc2 : Immerse the slab between two semi-infinite metallic electrodes, with optional fixed field applied between them.
         *  bc3 : Immerse the slab between one semi-infinite vacuum region (left) and one semi-infinite metallic electrode (right).
         */
        get areNonPeriodicBoundariesPresent() {
            return BOUNDARY_CONDITIONS.filter((e) => e.isNonPeriodic)
                .map((e) => e.type)
                .includes(this.boundaryConditions.type);
        }

        /**
         * Returns a plane-like mesh object with given corner vertices in counterclockwise order.
         * @param color {Number} mesh object color.
         * @param coordinates1 {Array} first point.
         * @param coordinates2 {Array} second point.
         * @param coordinates3 {Array} third point.
         * @param coordinates4 {Array} fourth point.
         * @param zOffset {Number} offset to add to the z coordinate of points forming the object.
         */
        // eslint-disable-next-line class-methods-use-this
        getBoundaryMeshObject(
            color,
            coordinates1,
            coordinates2,
            coordinates3,
            coordinates4,
            zOffset = 0,
        ) {
            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array(
                [coordinates1, coordinates2, coordinates3, coordinates3, coordinates4, coordinates1]
                    .map(([x, y, z]) => [x, y, z + zOffset])
                    .flat(),
            );
            geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

            const material = new THREE.MeshBasicMaterial({
                color,
                opacity: 0.5,
                transparent: true,
                side: THREE.DoubleSide,
            });

            return new THREE.Mesh(geometry, material);
        }

        /**
         * Returns the z offset to add to the boundary planes. Note that the c axis of the cell and z axis of coordinate system
         * are always aligned by convention, hence this.cVectorLength / 2.
         */
        get boundaryMeshObjectZOffset() {
            return this.boundaryConditions.offset + this.cVectorLength / 2;
        }

        /**
         * Draw boundaries with +/- [L_z/2 + this.boundaryConditions.offset] z coordinates.
         */
        drawBoundaries() {
            if (this.areNonPeriodicBoundariesPresent) {
                const vertices = this.getCellVertices(this.cell);
                const colors =
                    this.settings.boundaryConditionTypeColors[this.boundaryConditions.type];
                const boundaryMeshObjectVertices = [
                    vertices[0],
                    vertices[1],
                    vertices[3],
                    vertices[2],
                ];
                const plane1 = this.getBoundaryMeshObject(
                    colors[0],
                    ...boundaryMeshObjectVertices,
                    this.boundaryMeshObjectZOffset,
                );
                const plane2 = this.getBoundaryMeshObject(
                    colors[1],
                    ...boundaryMeshObjectVertices,
                    -this.boundaryMeshObjectZOffset,
                );
                this.repeatObject3DAtRepetitionCoordinates(plane1);
                this.repeatObject3DAtRepetitionCoordinates(plane2);
            }
        }

        /**
         * Returns a basis with elements inside boundary conditions.
         */
        get basisWithElementsInsideNonPeriodicBoundaries() {
            const newBasis = new Made.Basis({
                ...this._basis.toJSON(),
                elements: [],
                coordinates: [],
            });
            const basisCloneInCrystalCoordinates = this._basis.clone();

            newBasis.toCrystal();
            basisCloneInCrystalCoordinates.toCrystal();

            basisCloneInCrystalCoordinates.elements.forEach((element, index) => {
                const coord = basisCloneInCrystalCoordinates.getCoordinateByIndex(index);
                newBasis.addAtom({
                    element,
                    coordinate: [
                        coord[0],
                        coord[1],
                        Made.math.abs(coord[2]) <= 0.5 ? coord[2] : coord[2] - 1,
                    ],
                });
            });

            if (this._basis.isInCartesianUnits) newBasis.toCartesian();
            return newBasis;
        }
    };
