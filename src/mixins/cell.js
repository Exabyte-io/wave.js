import * as THREE from "three";
import {Made} from "@exabyte-io/made.js";

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

    get latticePoints() {
        const basis = new Made.Basis({
            ...this.basis.toJSON(),
            elements: ["Si"],
            coordinates: [[0, 0, 0]],
        });
        return Made.tools.basis.repeat(basis, Array(3).fill(this.settings.atomRepetitions)).coordinates.map(c => c.value);
    }

    createUnitCellObject(cell) {
        const vertices = [
            [0, 0, 0],
            [cell.ax, cell.ay, cell.az],
            [cell.bx, cell.by, cell.bz],
            [(cell.ax + cell.bx), (cell.ay + cell.by), (cell.az + cell.bz)],
            [cell.cx, cell.cy, cell.cz],
            [(cell.cx + cell.ax), (cell.cy + cell.ay), (cell.cz + cell.az)],
            [(cell.cx + cell.bx), (cell.cy + cell.by), (cell.cz + cell.bz)],
            [(cell.cx + cell.ax + cell.bx), (cell.cy + cell.ay + cell.by), (cell.cz + cell.az + cell.bz)]
        ];

        // edges of the cell forming a continuous line
        const edges = [0, 1, 0, 2, 1, 3, 2, 3, 4, 5, 4, 6, 5, 7, 6, 7, 0, 4, 1, 5, 2, 6, 3, 7];

        const geometry = new THREE.Geometry();

        edges.forEach(edge => geometry.vertices.push(new TV3(vertices[edge][0], vertices[edge][1], vertices[edge][2])));

        const lineMaterial = new THREE.LineBasicMaterial({
            linewidth: this.settings.lineWidth,
            color: this.settings.defaultColor,
        });

        const unitCellObject = new THREE.LineSegments(geometry, lineMaterial);
        unitCellObject.name = "Cell";
        return unitCellObject;

    }

    drawUnitCell(cell = this.cell) {
        const cellObject = this.createUnitCellObject(cell);
        this.structureGroup.add(cellObject);
    }

};
