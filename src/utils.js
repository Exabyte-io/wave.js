import * as THREE from "three";
import {sprintf} from 'sprintf-js';
import {Made} from "@exabyte-io/made.js";

import {Wave} from "./wave";

/**
 * Helper to save textual/bitmap data to a file.
 * @param {String} strData - Textual data
 * @param {String} filename
 */
export function saveFile(strData, filename) {
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.download = filename;
    link.href = strData;
    link.click();
    document.body.removeChild(link);
}

/**
 * Save image data file with type
 * @param {String} imgData
 * @param {String} type
 */
export function saveImageDataToFile(imgData, type = 'png') {
    try {
        saveFile(imgData, `screenshot.${type}`);

    } catch (e) {
        console.error(e);
    }
}

/**
 * Exports and downloads the content.
 * @param content {String} Content to be saved in downloaded file
 * @param name {String} File name to be written on disk.
 * @param extension {String} File extension.
 */
export const exportToDisk = function (content, name = 'file', extension = 'txt') {
    const pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    pom.setAttribute('download', sprintf(`%s.${extension}`, name));
    pom.click();
};

/**
 * Extracts the lattice from the LineSegments object vertices.
 */
function extractLatticeFromScene(scene) {
    const unitCellObject = scene.getObjectByProperty("type", "LineSegments");
    const vertices = unitCellObject.geometry.vertices;
    const a = vertices[1].sub(vertices[0]).toArray();
    const b = vertices[3].sub(vertices[0]).toArray();
    const c = vertices[17].sub(vertices[0]).toArray();
    return Made.Lattice.fromVectors({
        a,
        b,
        c
    });
}

/**
 * Extracts basis from all SphereMesh objects.
 * The name of the element is extracted from the name of the corresponding 3D object.
 */
function extractBasisFromScene(scene, cell) {
    const elements = [];
    const coordinates = [];
    scene.traverse((object) => {
        if (object.type === "Mesh") {
            elements.push(object.name.split("-")[0] || "Si");
            coordinates.push(object.getWorldPosition().toArray())
        }
    });
    return new Made.Basis({
        cell,
        elements,
        coordinates,
        units: "cartesian"
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
        cell: materials[0].Lattice.unitCell,
        DOMElement: document.createElement("div")
    });
    if (materials.length > 1) {
        wave.structureGroup.name = "New Material";
        materials.slice(1).forEach(material => {
            material.toCartesian();
            const structureGroup = new THREE.Group();
            structureGroup.name = material.name || material.formula;
            const atomsGroup = wave.createAtomsGroup(material.Basis);
            structureGroup.add(atomsGroup);
            const unitCellObject = wave.createUnitCellObject(material.Lattice.unitCell);
            unitCellObject.visible = false;
            structureGroup.add(unitCellObject);
            structureGroup.position.set(...shift); //slightly shift along x axis
            wave.structureGroup.add(structureGroup);
        });
        wave.render();
    }
    return wave.scene.toJSON();
}
