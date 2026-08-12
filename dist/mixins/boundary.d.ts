export function BoundaryMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        boundaryConditions: any;
        /**
         * Boundaries are drawn only if type is "bc1", "bc2", or "bc3".
         *  bc1 : Immerse the slab between two semi-infinite vacuum regions;
         *  bc2 : Immerse the slab between two semi-infinite metallic electrodes, with optional fixed field applied between them.
         *  bc3 : Immerse the slab between one semi-infinite vacuum region (left) and one semi-infinite metallic electrode (right).
         */
        readonly areNonPeriodicBoundariesPresent: boolean;
        /**
         * Returns a plane-like mesh object with given corner vertices in counterclockwise order.
         * @param color {Number} mesh object color.
         * @param coordinates1 {Array} first point.
         * @param coordinates2 {Array} second point.
         * @param coordinates3 {Array} third point.
         * @param coordinates4 {Array} fourth point.
         * @param zOffset {Number} offset to add to the z coordinate of points forming the object.
         */
        getBoundaryMeshObject(color: number, coordinates1: any[], coordinates2: any[], coordinates3: any[], coordinates4: any[], zOffset?: number): THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
        /**
         * Returns the z offset to add to the boundary planes. Note that the c axis of the cell and z axis of coordinate system
         * are always aligned by convention, hence this.cVectorLength / 2.
         */
        readonly boundaryMeshObjectZOffset: any;
        /**
         * Draw boundaries with +/- [L_z/2 + this.boundaryConditions.offset] z coordinates.
         */
        drawBoundaries(): void;
        /**
         * Returns a basis with elements inside boundary conditions.
         */
        readonly basisWithElementsInsideNonPeriodicBoundaries: any;
    };
    [x: string]: any;
};
import * as THREE from "three";
