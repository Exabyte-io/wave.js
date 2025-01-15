export function CellMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        /**
         * Draw unitCell in canvas. 2 half up/down cells (without top edges) are drawn if boundary conditions are present.
         */
        drawUnitCell(cell?: any): void;
        cell: any;
        _cell: any;
        setCell(s: any): void;
        /**
         * Returns an array of vertices in 3D space forming the cell.
         * @param cell {Object} unitCell class instance.
         * @param zMultiplier {Number} specifies a multiplier to adjust the z coordinates of the cell vertices with.
         */
        getCellVertices(cell: Object, zMultiplier?: number): any[][];
        /**
         * Returns the cell's center point in 3D space in the form of coordinate array,
         * as well as cell height, width, and the maximum between the height and width.
         * @param cell {Object} unitCell class instance.
         * @returns {{center:Array<Number>, width:Number, height:Number, maxSize:Number}}
         */
        getCellViewParams(cell?: Object): {
            center: Array<number>;
            width: number;
            height: number;
            maxSize: number;
        };
        /**
         * Returns a LineSegments object representing the cell with given edges.
         * @param cell {Object} unitCell class instance.
         * @param edges {Array} an array of vertex indices used to form the line segments.
         * @param zMultiplier {Number} specifies a multiplier to adjust the z coordinates of the cell vertices with.
         * @param lineColor {Number} line segment color
         * @returns {LineSegments}
         */
        getUnitCellObjectByEdges(cell: Object, edges: any[], zMultiplier?: number, lineColor?: number): LineSegments;
        /**
         * Returns a LineSegments object representing the full unitCell (with all edges).
         */
        getUnitCellObject(cell: any): any;
        unitCellObject: any;
        /**
         * Returns an array of THREE.Plane corresponding to the cell's faces.
         */
        getCellPlanes(cell: any): any[];
        /**
         * Return the length of unitCell c vector.
         */
        readonly cVectorLength: any;
    };
    [x: string]: any;
};
