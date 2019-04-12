import * as THREE from "three";
import {Made} from "@exabyte-io/made.js";

export const BoundaryMixin = (superclass) => class extends superclass {

    constructor(config) {
        super(config);
        this.boundaryConditions = config.boundaryConditions || {};
    }

    get areBoundariesEnabled() {return ["bc1", "bc2", "bc3"].includes(this.boundaryConditions.type)}

    getPlaneObject(color, coordinates1, coordinates2, coordinates3, coordinates4, zOffset = 0) {

        const point1 = new THREE.Vector3(...coordinates1).add(new THREE.Vector3(0, 0, zOffset));
        const point2 = new THREE.Vector3(...coordinates2).add(new THREE.Vector3(0, 0, zOffset));
        const point3 = new THREE.Vector3(...coordinates3).add(new THREE.Vector3(0, 0, zOffset));
        const point4 = new THREE.Vector3(...coordinates4).add(new THREE.Vector3(0, 0, zOffset));

        const geometry = new THREE.Geometry();
        geometry.vertices.push(point1, point2, point3, point4);
        const face1 = new THREE.Face3(0, 1, 2);
        const face2 = new THREE.Face3(2, 3, 0);
        geometry.faces.push(face1, face2);
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        var material = new THREE.MeshBasicMaterial({
            color: color,
            opacity: 0.5,
            transparent: true,
            side: THREE.DoubleSide
        });

        return new THREE.Mesh(geometry, material);

    }

    drawBoundaries() {
        if (this.areBoundariesEnabled) {
            const vertices = this.getCellVertices(this.cell);
            const LZ = new THREE.Vector3(...vertices[4]).length();
            const colors = this.settings.boundaryConditionTypeColors[this.boundaryConditions.type];
            const offset = this.boundaryConditions.offset * Made.coefficients.BOHR_TO_ANGSTROM + LZ / 2;
            const plane1 = this.getPlaneObject(colors[0], vertices[0], vertices[1], vertices[3], vertices[2], -offset);
            const plane2 = this.getPlaneObject(colors[1], vertices[4], vertices[5], vertices[7], vertices[6], offset);
            this.repeatObject3DAtRepetitionCoordinates(plane1);
            this.repeatObject3DAtRepetitionCoordinates(plane2);
        }
    }

};
