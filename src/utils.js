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

function extractLattice(scene) {
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

function extractBasis(scene, cell) {
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

export function ThreeDSceneDataToMaterial(scene) {
    const lattice = extractLattice(scene);
    const basis = extractBasis(scene, lattice.vectorArrays);
    basis.toCrystal();
    return new Made.Material({
        name: scene.getObjectByProperty("type", "Group").name,
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
