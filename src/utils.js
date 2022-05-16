import { Made } from "@exabyte-io/made.js";
import { sprintf } from "sprintf-js";
import * as THREE from "three";

// eslint-disable-next-line import/no-cycle
import { Wave } from "./wave";

/**
 * Helper to save textual/bitmap data to a file.
 * @param {String} strData - Textual data
 * @param {String} filename
 */
export function saveFile(strData, filename) {
    const link = document.createElement("a");
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
export function saveImageDataToFile(imgData, type = "png") {
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
 * @param mime {String} type of the content.
 * Source: https://github.com/kennethjiang/js-file-download/blob/master/file-download.js
 */
export const exportToDisk = function exportToDisk(
    content,
    name = "file",
    extension = "txt",
    mime = "application/octet-stream",
) {
    const blob = new Blob([content], { type: mime });
    const filename = sprintf(`%s.${extension}`, name);
    if (typeof window.navigator.msSaveBlob !== "undefined") {
        // IE workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
    } else {
        const blobURL = window.URL.createObjectURL(blob);
        const tempLink = document.createElement("a");
        tempLink.style.display = "none";
        tempLink.href = blobURL;
        tempLink.setAttribute("download", filename);

        // Safari thinks _blank anchor are pop ups. We only want to set _blank
        // target if the browser does not support the HTML5 download attribute.
        // This allows you to download files in desktop safari if pop up blocking
        // is enabled.
        if (typeof tempLink.download === "undefined") tempLink.setAttribute("target", "_blank");

        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        window.URL.revokeObjectURL(blobURL);
    }
};

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
function extractBasisFromScene(scene, cell) {
    const elements = [];
    const coordinates = [];
    scene.traverse((object) => {
        if (object.type === "Mesh") {
            elements.push(object.name.split("-")[0] || "Si");
            const vector = new THREE.Vector3();
            coordinates.push(object.getWorldPosition(vector).toArray());
        }
    });
    return new Made.Basis({
        cell,
        elements,
        coordinates,
        units: "cartesian",
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

/**
 * Sets multiple parameters of the target object.
 * @param {Object} targetObject - the object to receive new property values.
 * @param {Object} parameters - the object containing key-value pairs to be set.
 */
export function setParameters(targetObject, parameters) {
    Object.keys(parameters).forEach((key) => {
        targetObject[key] = parameters[key];
    });
}
