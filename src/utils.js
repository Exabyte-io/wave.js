import { Made } from "@mat3ra/made";
import * as THREE from "three";

// eslint-disable-next-line import/no-cycle
import { Wave } from "./wave";

/**
 * @summary Converts position array of Buffer Geometry to vertices vectors
 * @param geometry {THREE.BufferGeometry} the buffer geometry
 * @param position {Float32Array} the position array
 */
function convertPositionToVertices(geometry, position) {
    const vertices = [];
    for (let i = 0, l = position.count; i < l; i++) {
        const vector = new THREE.Vector3();
        vector.fromBufferAttribute(position, i);
        vector.applyMatrix4(geometry.matrixWorld);
        vertices.push(vector);
    }
    return vertices;
}

/**
 * Extracts the lattice from the LineSegments object vertices.
 */
function extractLatticeFromScene(scene) {
    const unitCellObject = scene.getObjectByProperty("type", "LineSegments");
    const vertices = convertPositionToVertices(
        unitCellObject,
        unitCellObject.geometry.attributes.position,
    );
    const a = vertices[1].sub(vertices[0]).toArray();
    const b = vertices[3].sub(vertices[0]).toArray();
    const c = vertices[17].sub(vertices[0]).toArray();
    return Made.Lattice.fromVectors({ a, b, c });
}

/**
 * Extracts basis from all SphereMesh objects.
 * The name of the element is extracted from the name of the corresponding 3D object.
 */
function extractBasisFromScene(scene, cellVectorsArray) {
    const elements = [];
    const coordinates = [];
    scene.traverse((object) => {
        if (object.type === "Mesh") {
            elements.push(object.name.split("-")[0] || "Si");
            const vector = new THREE.Vector3();
            coordinates.push(object.getWorldPosition(vector).toArray());
        }
    });

    const newCell = Made.Cell.fromVectorsArray(cellVectorsArray);
    return Made.Basis.fromElementsAndCoordinates({
        elements,
        coordinates,
        units: "cartesian",
        cell: newCell,
    });
}

/**
 * Converts a given scene data to a material.
 * Lattice is constructed from the LineSegments object.
 * Basis is constructed based on all SphereMesh objects.
 */
export function ThreeDSceneDataToMaterial(scene) {
    const lattice = extractLatticeFromScene(scene);
    const basis = extractBasisFromScene(scene, lattice.vectorArrays);
    basis.toCrystal();
    return new Made.Material({
        name: scene.getObjectByProperty("type", "Group").name,
        lattice: lattice.toJSON(),
        basis: basis.toJSON(),
    });
}

/**
 * Converts given materials to scene data.
 * The first material is used as parent and it's unit cell is used in case multiple materials are passed.
 * Other materials are added as a group under the first material with their cell hidden by default.
 * Atoms are slightly shifted along X axis if multiple materials are passed.
 */
export function materialsToThreeDSceneData(materials, shift = [2, 0, 0]) {
    const wave = new Wave({
        structure: materials[0],
        cell: materials[0].getLattice().unitCell,
        DOMElement: document.createElement("div"),
    });
    if (materials.length > 1) {
        wave.structureGroup.name = "New Material";
        materials.slice(1).forEach((material) => {
            material.toCartesian();
            const structureGroup = new THREE.Group();
            structureGroup.name = material.name || material.formula;
            const atomsGroup = wave.createAtomsGroup(material.getBasis());
            structureGroup.add(atomsGroup);
            const unitCellObject = wave.getUnitCellObject(material.getLattice().unitCell);
            unitCellObject.visible = false;
            structureGroup.add(unitCellObject);
            structureGroup.position.set(...shift); // slightly shift along x axis
            wave.structureGroup.add(structureGroup);
        });
        wave.render();
    }
    return wave.scene.toJSON();
}
