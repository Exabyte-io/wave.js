import * as THREE from "three";
const TV3 = THREE.Vector3;
/*
 * Mixin containing the logic for dealing with the calculation/unit cell.
 * Draws cell edges as lines.
 * NOTE: `this._cell` is set inside WaveBase.constructor.
 */
export const CellMixin = (superclass) => class extends superclass {
    constructor(config) {
        super(config);
        this.drawUnitCell = this.drawUnitCell.bind(this);
    }
    get cell() {
        return this._cell;
    }
    set cell(s) {
        this._cell = s;
    }
    setCell(s) {
        // Don't set the cell if it's undefined
        if (!s) {
            console.warn('Attempted to set undefined cell');
            return;
        }
        this.cell = s;
    }
    /**
     * Returns an array of vertices in 3D space forming the cell.
     * @param cell {Object} unitCell class instance.
     * @param zMultiplier {Number} specifies a multiplier to adjust the z coordinates of the cell vertices with.
     */
    getCellVertices(cell, zMultiplier = 1) {
        // Handle case when cell is undefined
        if (!cell) {
            // Return default vertices (all zeros)
            return [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];
        }
        return [
            [0, 0, 0],
            [cell.ax, cell.ay, cell.az],
            [cell.bx, cell.by, cell.bz],
            [cell.ax + cell.bx, cell.ay + cell.by, cell.az + cell.bz],
            [cell.cx, cell.cy, cell.cz * zMultiplier],
            [cell.cx + cell.ax, cell.cy + cell.ay, cell.cz * zMultiplier + cell.az],
            [cell.cx + cell.bx, cell.cy + cell.by, cell.cz * zMultiplier + cell.bz],
            [
                cell.cx + cell.ax + cell.bx,
                cell.cy + cell.ay + cell.by,
                cell.cz * zMultiplier + cell.az + cell.bz,
            ],
        ];
    }
    /**
     * Returns the cell's center point in 3D space in the form of coordinate array,
     * as well as cell height, width, and the maximum between the height and width.
     * @param cell {Object} unitCell class instance.
     * @returns {{center:Array<Number>, width:Number, height:Number, maxSize:Number}}
     */
    getCellViewParams(cell = this.cell) {
        // Return reasonable defaults if cell is undefined
        if (!cell) {
            return {
                center: [0, 0, 0],
                width: 1,
                height: 1,
                maxSize: 1
            };
        }
        let diagonal;
        if (this.areNonPeriodicBoundariesPresent) {
            const verticesUp = this.getCellVertices(cell, 0.5);
            const verticesDown = this.getCellVertices(cell, -0.5);
            diagonal = [verticesUp[4], verticesDown[7]];
        }
        else {
            const vertices = this.getCellVertices(cell);
            diagonal = [vertices[0], vertices[7]];
        }
        const center = [
            (diagonal[0][0] + diagonal[1][0]) / 2,
            (diagonal[0][1] + diagonal[1][1]) / 2,
            (diagonal[0][2] + diagonal[1][2]) / 2,
        ];
        const width = Math.abs(diagonal[0][1] + diagonal[1][1]);
        const height = Math.abs(diagonal[0][2] + diagonal[1][2]);
        const maxSize = Math.max(width, height);
        return {
            center,
            width,
            height,
            maxSize,
        };
    }
    /**
     * Returns a LineSegments object representing the cell with given edges.
     * @param cell {Object} unitCell class instance.
     * @param edges {Array} an array of vertex indices used to form the line segments.
     * @param zMultiplier {Number} specifies a multiplier to adjust the z coordinates of the cell vertices with.
     * @param lineColor {Number} line segment color
     * @returns {LineSegments}
     */
    getUnitCellObjectByEdges(cell, edges, zMultiplier = 1, lineColor = this.settings.defaultColor) {
        // Handle case when cell is undefined
        if (!cell) {
            // Create a minimal line segment object if cell is missing
            const points = [new TV3(0, 0, 0), new TV3(0, 0, 0)];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: lineColor,
                linewidth: this.settings.lineWidth,
            });
            return new THREE.LineSegments(geometry, lineMaterial);
        }
        const vertices = this.getCellVertices(cell, zMultiplier);
        const points = edges.map((edge) => new TV3(vertices[edge][0], vertices[edge][1], vertices[edge][2]));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: lineColor,
            linewidth: this.settings.lineWidth,
        });
        return new THREE.LineSegments(geometry, lineMaterial);
    }
    /**
     * Returns a LineSegments object representing the full unitCell (with all edges).
     */
    getUnitCellObject(cell) {
        if (!cell) {
            // Return a minimal cell object if cell is missing
            const points = [new TV3(0, 0, 0), new TV3(0, 0, 0)];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: this.settings.defaultColor,
                linewidth: this.settings.lineWidth,
            });
            this.unitCellObject = new THREE.LineSegments(geometry, lineMaterial);
            this.unitCellObject.name = "Cell";
            return this.unitCellObject;
        }
        const edges = [0, 1, 0, 2, 1, 3, 2, 3, 4, 5, 4, 6, 5, 7, 6, 7, 0, 4, 1, 5, 2, 6, 3, 7];
        this.unitCellObject = this.getUnitCellObjectByEdges(cell, edges);
        this.unitCellObject.name = "Cell";
        return this.unitCellObject;
    }
    /**
     * Draw unitCell in canvas. 2 half up/down cells (without top edges) are drawn if boundary conditions are present.
     */
    drawUnitCell(cell = this.cell) {
        // Skip drawing if cell is undefined
        if (!cell) {
            return;
        }
        if (this.areNonPeriodicBoundariesPresent) {
            const edges = [0, 1, 0, 2, 1, 3, 2, 3, 0, 4, 1, 5, 2, 6, 3, 7];
            const cellObjectUp = this.getUnitCellObjectByEdges(cell, edges, 0.5);
            const cellObjectDown = this.getUnitCellObjectByEdges(cell, edges, -0.5, this.settings.colors.gray);
            this.structureGroup.add(cellObjectDown);
            this.structureGroup.add(cellObjectUp);
        }
        else {
            const unitCellObject = this.getUnitCellObject(cell);
            this.structureGroup.add(unitCellObject);
        }
    }
    /**
     * Returns an array of THREE.Plane corresponding to the cell's faces.
     */
    getCellPlanes(cell) {
        // Return empty array if cell is undefined
        if (!cell) {
            return [];
        }
        const vertices = this.getCellVertices(cell).map((a) => new THREE.Vector3(...a));
        return [
            [0, 1, 2],
            [0, 1, 4],
            [1, 3, 5],
            [3, 2, 7],
            [0, 2, 4],
            [4, 6, 5],
        ].map((face) => {
            const slide1 = new THREE.Vector3().subVectors(vertices[face[0]], vertices[face[1]]);
            const slide2 = new THREE.Vector3().subVectors(vertices[face[0]], vertices[face[2]]);
            return new THREE.Plane(new THREE.Vector3().crossVectors(slide1, slide2));
        });
    }
    /**
     * Return the length of unitCell c vector.
     */
    get cVectorLength() {
        if (!this.cell) {
            return 0;
        }
        return new THREE.Vector3(this.cell.cx, this.cell.cy, this.cell.cz).length();
    }
};
