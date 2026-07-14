import { Made } from "@mat3ra/made";
import * as THREE from "three";

import { ATOM_GROUP_NAME } from "./enums";
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
 * Returns the THREE.Group Wave itself creates to hold the entire visible structure (atoms, unit
 * cell, bonds, boundary planes, labels, measurements - see
 * Wave.initStructureGroup()/createStructureGroup() in src/wave.js). It is the only object of
 * type "Group" added directly to the scene, and it is added before any editor-only helper object
 * (e.g. TransformControls, also a direct child of the scene but never of type "Group"), so this
 * lookup - already relied on below to read the structure's name - unambiguously finds it.
 */
function getStructureGroup(scene) {
    return scene.getObjectByProperty("type", "Group");
}

/**
 * Returns the direct-child LineSegments object(s) of the structure group that make up the
 * unit-cell wireframe. CellMixin.drawUnitCell() (src/mixins/cell.ts) is the only place that adds
 * LineSegments to the structure group, and it always adds them as direct children of it, so there
 * is no need to search any deeper (and risk matching an unrelated LineSegments object elsewhere).
 */
function getUnitCellLineSegments(structureGroup) {
    return structureGroup.children.filter((child) => child.isLineSegments);
}

/**
 * Extracts the lattice from the LineSegments object(s) that draw the unit cell.
 *
 * CellMixin.getUnitCellObject() draws the full cell as a single LineSegments object named "Cell"
 * with 24 vertices (12 edges x 2 endpoints) when boundary conditions are periodic. Under
 * non-periodic boundary conditions, CellMixin.drawUnitCell() instead draws it as two unnamed,
 * 16-vertex LineSegments objects split at z=0 (a "down" half added first with z-multiplier -0.5,
 * then an "up" half added second with +0.5 - see getUnitCellObjectByEdges/getCellVertices) - so
 * there is no single 24-vertex object to index into the way the periodic case allows, and picking
 * "the first LineSegments found by scanning the scene" (the previous approach) is not reliable
 * either, since it can return the wrong half or, given an unrelated future addition to the scene,
 * an unrelated object entirely. Both cases are handled explicitly here by locating the actual
 * cell object(s) via the structure group instead of guessing.
 */
function extractLatticeFromScene(scene) {
    const structureGroup = getStructureGroup(scene);
    const cellObjects = getUnitCellLineSegments(structureGroup);

    if (cellObjects.length === 1) {
        // Periodic case: getCellVertices(cell) with the default zMultiplier of 1 places corner 4
        // at the untouched tip of `c`, so vertex 17 - matching the `edges` array in
        // getUnitCellObject - is the full c vector, exactly as vertex 1/3 are the full a/b.
        const [cellObject] = cellObjects;
        const vertices = convertPositionToVertices(
            cellObject,
            cellObject.geometry.attributes.position,
        );
        if (vertices.length !== 24) {
            throw new Error(
                `extractLatticeFromScene: expected the periodic unit cell object to have 24 vertices, got ${vertices.length}`,
            );
        }
        const a = vertices[1].sub(vertices[0]).toArray();
        const b = vertices[3].sub(vertices[0]).toArray();
        const c = vertices[17].sub(vertices[0]).toArray();
        return Made.Lattice.fromVectors({ a, b, c });
    }

    if (cellObjects.length === 2) {
        // Non-periodic case: both halves carry the full a/b vectors (getCellVertices only scales
        // the z-multiplier into the z component of corner 4, never x/y), so a/b are read the same
        // way as the periodic case above. Only c is split: the "up" half (added second) has
        // vertex 9 - matching its own 16-entry `edges` array - at [cx, cy, cz * 0.5], so c is
        // recovered by doubling just the z component of that delta rather than the whole vector.
        const [, upCellObject] = cellObjects;
        const vertices = convertPositionToVertices(
            upCellObject,
            upCellObject.geometry.attributes.position,
        );
        if (vertices.length !== 16) {
            throw new Error(
                `extractLatticeFromScene: expected the non-periodic half unit cell object to have 16 vertices, got ${vertices.length}`,
            );
        }
        const a = vertices[1].sub(vertices[0]).toArray();
        const b = vertices[3].sub(vertices[0]).toArray();
        const halfC = vertices[9].sub(vertices[0]);
        const c = [halfC.x, halfC.y, halfC.z * 2];
        return Made.Lattice.fromVectors({ a, b, c });
    }

    throw new Error(
        `extractLatticeFromScene: expected 1 (periodic) or 2 (non-periodic) unit cell LineSegments objects in the structure group, found ${cellObjects.length}`,
    );
}

/**
 * Extracts basis from the atom sphere meshes belonging to the base structure.
 * The name of the element is extracted from the name of the corresponding 3D object.
 *
 * Traversal is scoped to the first child of the structure group named ATOM_GROUP_NAME - the group
 * AtomsMixin.createAtomsGroup() builds for the base (un-repeated) structure. Scoping to it, plus
 * the isMesh/isInstancedMesh check below, is what keeps the following out of the basis:
 *  - bond InstancedMeshes (BondsMixin.createInstancedMeshForBonds): in the installed three.js
 *    version InstancedMesh does not override the base Object3D "type", so
 *    `bondMesh.type === "Mesh"` is true and a plain type check cannot tell a bond from an atom -
 *    hence checking `isMesh && !isInstancedMesh` explicitly instead of `type === "Mesh"`;
 *  - boundary condition planes (BoundaryMixin.getBoundaryMeshObject): plain Meshes added directly
 *    to the structure group, never inside an ATOM_GROUP_NAME group;
 *  - repetition clones (RepetitionMixin.repeatAtomsAtRepetitionCoordinates): each clone is its own
 *    group also named ATOM_GROUP_NAME, but always added *after* the real one (the base group is
 *    added first, then every clone), so taking only the first match keeps this to the base
 *    structure's own atoms.
 */
function extractBasisFromScene(scene, cellVectorsArray) {
    const structureGroup = getStructureGroup(scene);
    const atomsGroup = structureGroup.children.find((child) => child.name === ATOM_GROUP_NAME);

    const elements = [];
    const coordinates = [];
    if (atomsGroup) {
        atomsGroup.traverse((object) => {
            if (object.isMesh && !object.isInstancedMesh) {
                elements.push(object.name.split("-")[0] || "Si");
                const vector = new THREE.Vector3();
                coordinates.push(object.getWorldPosition(vector).toArray());
            }
        });
    }

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
 * Lattice is constructed from the LineSegments object(s) representing the unit cell.
 * Basis is constructed from the base structure's atom sphere meshes (see
 * extractBasisFromScene above for what that excludes).
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
        cell: materials[0].Lattice.unitCell,
        DOMElement: document.createElement("div"),
    });
    if (materials.length > 1) {
        wave.structureGroup.name = "New Material";
        materials.slice(1).forEach((material) => {
            material.toCartesian();
            const structureGroup = new THREE.Group();
            structureGroup.name = material.name || material.formula;
            const atomsGroup = wave.createAtomsGroup(material.Basis);
            structureGroup.add(atomsGroup);
            const unitCellObject = wave.getUnitCellObject(material.Lattice.unitCell);
            unitCellObject.visible = false;
            structureGroup.add(unitCellObject);
            structureGroup.position.set(...shift); // slightly shift along x axis
            wave.structureGroup.add(structureGroup);
        });
        wave.render();
    }
    return wave.scene.toJSON();
}
