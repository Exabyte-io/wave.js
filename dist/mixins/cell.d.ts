import { UnitCell } from "@mat3ra/made";
import * as THREE from "three";
/**
 * Return type for getCellViewParams method
 */
interface CellViewParams {
    center: number[];
    width: number;
    height: number;
    maxSize: number;
}
export declare const CellMixin: (superclass: any) => {
    new (config: any): {
        [x: string]: any;
        cell: UnitCell;
        setCell(s: UnitCell): void;
        /**
         * Returns an array of vertices in 3D space forming the cell.
         * @param cell {Object} unitCell class instance.
         * @param zMultiplier {Number} specifies a multiplier to adjust the z coordinates of the cell vertices with.
         */
        getCellVertices(cell: UnitCell, zMultiplier?: number): number[][];
        /**
         * Returns the cell's center point in 3D space in the form of coordinate array,
         * as well as cell height, width, and the maximum between the height and width.
         * @param cell {Object} unitCell class instance.
         * @returns {{center:Array<Number>, width:Number, height:Number, maxSize:Number}}
         */
        getCellViewParams(cell?: UnitCell): CellViewParams;
        /**
         * Returns a LineSegments object representing the cell with given edges.
         * @param cell {Object} unitCell class instance.
         * @param edges {Array} an array of vertex indices used to form the line segments.
         * @param zMultiplier {Number} specifies a multiplier to adjust the z coordinates of the cell vertices with.
         * @param lineColor {Number} line segment color
         * @returns {LineSegments}
         */
        getUnitCellObjectByEdges(cell: UnitCell, edges: number[], zMultiplier?: number, lineColor?: any): THREE.LineSegments;
        /**
         * Returns a LineSegments object representing the full unitCell (with all edges).
         */
        getUnitCellObject(cell: UnitCell): THREE.LineSegments;
        /**
         * Draw unitCell in canvas. 2 half up/down cells (without top edges) are drawn if boundary conditions are present.
         */
        drawUnitCell(cell?: UnitCell): void;
        /**
         * Returns an array of THREE.Plane corresponding to the cell's faces.
         */
        getCellPlanes(cell: UnitCell): THREE.Plane[];
        /**
         * Return the length of unitCell c vector.
         */
        readonly cVectorLength: number;
    };
    [x: string]: any;
};
export {};
