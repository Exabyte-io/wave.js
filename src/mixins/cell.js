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
     */
    getCellVertices(cell) {
        return [
            [0, 0, 0],
            [cell.ax, cell.ay, cell.az],
            [cell.bx, cell.by, cell.bz],
            [(cell.ax + cell.bx), (cell.ay + cell.by), (cell.az + cell.bz)],
            [cell.cx, cell.cy, cell.cz],
            [(cell.cx + cell.ax), (cell.cy + cell.ay), (cell.cz + cell.az)],
            [(cell.cx + cell.bx), (cell.cy + cell.by), (cell.cz + cell.bz)],
            [(cell.cx + cell.ax + cell.bx), (cell.cy + cell.ay + cell.by), (cell.cz + cell.az + cell.bz)]
        ]
    }

    createUnitCellObject(cell) {
        const vertices = this.getCellVertices(cell);

        // edges of the cell forming a continuous line
        const edges = [0, 1, 0, 2, 1, 3, 2, 3, 4, 5, 4, 6, 5, 7, 6, 7, 0, 4, 1, 5, 2, 6, 3, 7];

        const geometry = new THREE.Geometry();

        edges.forEach(edge => geometry.vertices.push(new TV3(vertices[edge][0], vertices[edge][1], vertices[edge][2])));

        const lineMaterial = new THREE.LineBasicMaterial({
            linewidth: this.settings.lineWidth,
            color: this.settings.defaultColor,
        });

        this.unitCellObject = new THREE.LineSegments(geometry, lineMaterial);
        this.unitCellObject.name = "Cell";
        return this.unitCellObject;

    }

    drawUnitCell(cell = this.cell) {
        const cellObject = this.createUnitCellObject(cell);
        this.structureGroup.add(cellObject);
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

};
