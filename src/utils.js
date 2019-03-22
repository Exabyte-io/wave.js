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

function findObjectsByType(data, type) {
    const objects = [];
    if (data.type === type) objects.push(data);
    if (data.children) data.children.forEach(child => {
        const childObjects = findObjectsByType(child, type);
        childObjects.forEach(childObject => {
            childObject.matrix[12] += child.matrix[12];
            childObject.matrix[13] += child.matrix[13];
            childObject.matrix[14] += child.matrix[14];
        });
        Array.prototype.push.apply(objects, childObjects);
    });
    return objects;
}

function extractLattice(sceneData) {
    const unitCellData = findObjectsByType(sceneData.object, "LineSegments")[0];
    const cellGeometries = sceneData.geometries.find(g => g.uuid === unitCellData.geometry);
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

function extractBasis(sceneData, cell) {
    const elements = [];
    const coordinates = [];
    findObjectsByType(sceneData.object, "Mesh").forEach(child => {
        elements.push(child.name);
        coordinates.push([child.matrix[12], child.matrix[13], child.matrix[14]])
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
    const lattice = extractLattice(sceneData);
    const basis = extractBasis(sceneData, lattice.vectorArrays);
    basis.toCrystal();
    return new Made.Material({
        name: sceneData.object.children.find(child => child.name !== "PerspectiveCamera").name,
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
    if (materials.length > 1) {
        wave.structureGroup.name = "New Material";
        materials.slice(1).forEach(material => {
            material.toCartesian();
            const sitesGroup = wave.createSitesGroup(material.Basis);
            wave.structureGroup.add(sitesGroup);
        });
        wave.render();
    }
    return wave.scene.toJSON();
}
