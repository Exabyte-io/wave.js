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

function extractMaterialData(sceneData) {
    return sceneData.object.children.find(child => child.name !== "PerspectiveCamera");
}

function extractLattice(materialData, sceneData) {
    const cellObject = materialData.children.find(child => child.type === "LineSegments");
    const cellGeometries = sceneData.geometries.find(g => g.uuid === cellObject.geometry);
    const vertices = cellGeometries.data.vertices;
    const a = [vertices[3] - vertices[0], vertices[4] - vertices[1], vertices[5] - vertices[2]];
    const b = [vertices[9] - vertices[0], vertices[10] - vertices[1], vertices[11] - vertices[2]];
    const c = [vertices[51] - vertices[0], vertices[52] - vertices[1], vertices[53] - vertices[2]];
    return Made.Lattice.fromVectors({
        a,
        b,
        c
    });
}

function extractBasis(materialData, cell) {
    const elements = [];
    const coordinates = [];
    materialData.children.forEach(child => {
        if (child.type === "Mesh") {
            elements.push(child.name);
            coordinates.push([child.matrix[12], child.matrix[13], child.matrix[14]])
        }
    });
    return new Made.Basis({
        cell,
        elements,
        coordinates,
        units: "cartesian"
    });
}

function validateSceneData(sceneData) {
    // TODO
}

export function ThreeDSceneDataToMaterial(sceneData) {
    validateSceneData(sceneData);
    const materialData = extractMaterialData(sceneData);
    const lattice = extractLattice(materialData, sceneData);
    const basis = extractBasis(materialData, lattice.vectorArrays);
    basis.toCrystal();
    return new Made.Material({
        name: materialData.name,
        lattice: lattice.toJSON(),
        basis: basis.toJSON(),
    });
}

export function materialsToThreeDSceneData(materials) {
    const wave = new Wave({
        structure: materials[0],
        cell: materials[0].Lattice.unitCell,
        DOMElement: document.createElement("div")
    });
    materials.slice(1).forEach(material => {
        const structureGroup = wave.createStructureGroup(material);
        const unitCellObject = wave.createUnitCellObject(material.Lattice.unitCell);
        structureGroup.add(unitCellObject);
        const sphereMeshObjects = wave.createSphereMeshObjects(material.Basis);
        structureGroup.add(...sphereMeshObjects);
        wave.scene.add(structureGroup);
    });
    wave.render();
    return wave.scene.toJSON();
}
