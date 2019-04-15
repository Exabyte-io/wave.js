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

    get cell() {return this._cell}

    set cell(s) {this._cell = s}

    setCell(s) {this.cell = s}

    /**
     * Returns an array of vertices in 3D space forming the cell.
     * @param cell {Object} unitCell class instance.
     * @param zMultiplier {Number} specifies a multiplier to adjust the z coordinates of the cell.
     */
    getCellVertices(cell, zMultiplier = 1) {
        return [
            [0, 0, 0],
            [cell.ax, cell.ay, cell.az],
            [cell.bx, cell.by, cell.bz],
            [(cell.ax + cell.bx), (cell.ay + cell.by), (cell.az + cell.bz)],
            [cell.cx, cell.cy, cell.cz * zMultiplier],
            [(cell.cx + cell.ax), (cell.cy + cell.ay), (cell.cz * zMultiplier + cell.az)],
            [(cell.cx + cell.bx), (cell.cy + cell.by), (cell.cz * zMultiplier + cell.bz)],
            [(cell.cx + cell.ax + cell.bx), (cell.cy + cell.ay + cell.by), (cell.cz * zMultiplier + cell.az + cell.bz)]
        ]
    }

    getUnitCellObjectByEdges(cell, edges, zMultiplier = 1, lineColor = this.settings.defaultColor) {
        const vertices = this.getCellVertices(cell, zMultiplier);

        const geometry = new THREE.Geometry();

        edges.forEach(edge => geometry.vertices.push(new TV3(vertices[edge][0], vertices[edge][1], vertices[edge][2])));

        const lineMaterial = new THREE.LineBasicMaterial({
            color: lineColor,
            linewidth: this.settings.lineWidth,
        });

        return new THREE.LineSegments(geometry, lineMaterial);
    }

    getUnitCellObject(cell) {
        const edges = [0, 1, 0, 2, 1, 3, 2, 3, 4, 5, 4, 6, 5, 7, 6, 7, 0, 4, 1, 5, 2, 6, 3, 7];
        this.unitCellObject = this.getUnitCellObjectByEdges(cell, edges);
        this.unitCellObject.name = "Cell";
        return this.unitCellObject;
    }

    drawUnitCell(cell = this.cell) {
        if (this.areNonPeriodicBoundariesPresent) {
            const zMultiplier = this.boundaryMeshObjectZOffset / cell.cz;
            const edges = [0, 1, 0, 2, 1, 3, 2, 3, 0, 4, 1, 5, 2, 6, 3, 7];
            const cellObject = this.getUnitCellObjectByEdges(cell, edges, zMultiplier);
            const cellObjectClone = this.getUnitCellObjectByEdges(cell, edges, -zMultiplier, this.settings.colors.gray);
            this.structureGroup.add(cellObjectClone);
            this.structureGroup.add(cellObject);
        } else {
            const unitCellObject = this.getUnitCellObject(cell);
            this.structureGroup.add(unitCellObject);
        }
    }

    /**
     * Returns an array of THREE.Plane corresponding to the cell's faces.
     */
    getCellPlanes(cell) {
        const vertices = this.getCellVertices(cell).map(a => new THREE.Vector3(...a));
        return [[0, 1, 2], [0, 1, 4], [1, 3, 5], [3, 2, 7], [0, 2, 4], [4, 6, 5]].map(face => {
            const slide1 = new THREE.Vector3().subVectors(vertices[face[0]], vertices[face[1]]);
            const slide2 = new THREE.Vector3().subVectors(vertices[face[0]], vertices[face[2]]);
            return new THREE.Plane(new THREE.Vector3().crossVectors(slide1, slide2));
        });
    }

    /**
     * Return Lattice C constant.
     */
    get latticeCConstant() {
        return new THREE.Vector3(this.cell.cx, this.cell.cy, this.cell.cz).length();
    }

};
