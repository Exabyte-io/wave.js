import expect from "expect";
import fs from "fs";
import path from "path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import * as THREE from "three";

export const WIDTH = 500;
export const HEIGHT = 1000;

/**
 * Creates a DOM element with given properties.
 * @param name {String} element name.
 * @param elementProperties {Object} element object properties.
 * @returns {HTMLElement}
 */
export function createElement(name, elementProperties) {
    const element = document.createElement(name);
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in elementProperties) {
        const properties = {
            ...elementProperties[key],
            writable: true,
        };
        Object.defineProperty(element, key, properties);
    }
    return element;
}

/**
 * Divides the pixels into two halves, top and bottom and switch (flip) them.
 * WebGlRenderingContext.readPixels() returns the pixels upside down.
 * Source: https://stackoverflow.com/questions/41969562/how-can-i-flip-the-result-of-webglrenderingcontext-readpixels
 */
export function flipPixels(pixels) {
    // eslint-disable-next-line no-bitwise
    const halfHeight = (HEIGHT / 2) | 0; // the | 0 keeps the result an int
    const bytesPerRow = WIDTH * 4;

    // make a temp buffer to hold one row
    const temp = new Uint8Array(WIDTH * 4);
    for (let y = 0; y < halfHeight; ++y) {
        const topOffset = y * bytesPerRow;
        const bottomOffset = (HEIGHT - y - 1) * bytesPerRow;

        // make copy of a row on the top half
        temp.set(pixels.subarray(topOffset, topOffset + bytesPerRow));

        // copy a row from the bottom half to the top
        pixels.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);

        // copy the copy of the top half row to the bottom half
        pixels.set(temp, bottomOffset);
    }
}

/**
 * Takes a snapshot and saves it as PNG.
 * @param {Object} webGLContext - WebGLRenderer context
 * @param {String} imagePath - Path to save the snapshot
 * @returns {boolean} - Returns true if the snapshot is saved successfully
 */
export function takeSnapshot(webGLContext, imagePath) {
    const pixels = new Uint8Array(WIDTH * HEIGHT * 4);
    webGLContext.readPixels(
        0,
        0,
        WIDTH,
        HEIGHT,
        webGLContext.RGBA,
        webGLContext.UNSIGNED_BYTE,
        pixels,
    );

    flipPixels(pixels);

    const png = new PNG({
        width: WIDTH,
        height: HEIGHT,
    });
    png.data = pixels;

    // Write the PNG data synchronously
    const buffer = PNG.sync.write(png);
    fs.writeFileSync(imagePath, buffer);

    return true;
}
export function getExpectedImageFilePath(snapshotDir, imagePrefix) {
    const prefix = "expected";
    return path.resolve(snapshotDir, `${prefix}/${imagePrefix}.expected.png`);
}

/**
 * Takes snapshot, saves the image and compares it with the reference.
 * @param webGLContext {Object} WebGLRenderer context
 * @param imagePrefix {String} the prefix for actual/expected image names
 * @returns {Promise}
 */
export async function takeSnapshotAndAssertEqualityAsync(webGLContext, imagePrefix) {
    const snapshotDir = path.resolve(__dirname, "__tests__", "__snapshots__");
    const actualImageFilePath = path.resolve(snapshotDir, `${imagePrefix}.actual.png`);
    const expectedImageFilePath = getExpectedImageFilePath(snapshotDir, imagePrefix);
    const diffImageFilePath = path.resolve(snapshotDir, `${imagePrefix}.diff.png`);

    // Take the snapshot and save it as the actual image
    const isSnapshotSaved = await takeSnapshot(webGLContext, actualImageFilePath);
    expect(isSnapshotSaved).toBe(true);

    // Read the actual and expected images
    const actualImage = PNG.sync.read(fs.readFileSync(actualImageFilePath));
    const expectedImage = PNG.sync.read(fs.readFileSync(expectedImageFilePath));

    // Ensure dimensions match
    if (actualImage.width !== expectedImage.width || actualImage.height !== expectedImage.height) {
        throw new Error("Image dimensions do not match.");
    }

    // Create a diff image
    const diff = new PNG({ width: actualImage.width, height: actualImage.height });

    // Compare the images using pixelmatch
    const numDiffPixels = pixelmatch(
        actualImage.data,
        expectedImage.data,
        diff.data,
        actualImage.width,
        actualImage.height,
        {
            // Due to the differences in rendering across different OS platforms,
            // we use the threshold value below to avoid false negatives (0.7).
            // This appears to work well for the cases when differences are negligible,
            // yet still allows to spot significant difference caused by real malfunctions.
            threshold: 0.7, // Adjust this threshold for minor differences
            // includeAA: false,
        },
    );

    // Save the diff image if differences are found
    if (numDiffPixels > 0) {
        fs.writeFileSync(diffImageFilePath, PNG.sync.write(diff));
    }

    expect(numDiffPixels).toBe(0);
}

export function dispatchMouseDownMoveOrUpEvent(element, type, clientX, clientY, button = 0) {
    element.dispatchEvent(
        new MouseEvent(type, {
            button,
            clientX,
            clientY,
        }),
    );
}

/**
 * This function is helps to get event by atom position for clicking on atom or hovering on it.
 * @param {THREE.Vector3} position - position of the atom should be instance of THREE.Vector3()
 * @param {THREE.Camera} camera - camera of the wave object
 * @param {HTMLCanvasElement} canvas - object on which we render scene
 */
export function getEventObjectBy3DPosition(position, camera, canvas) {
    const vector = position.clone();

    vector.project(camera);
    vector.x = Math.round(((vector.x + 1) * canvas.width) / 2);
    vector.y = Math.round(((-vector.y + 1) * canvas.height) / 2);
    vector.z = 0;

    return {
        layerX: vector.x,
        layerY: vector.y,
    };
}

/**
 * This function is helps to get event by atom matrix for clicking on atom or hovering on it.
 * @param {THREE.Matrix4} matrix - matrix position of the atom.
 * @param {THREE.Camera} camera - camera of the wave object.
 * @param {HTMLCanvasElement} canvas - object on which we render scene
 */
export function getEventObjectBy3DMatrix(matrix, camera, canvas) {
    const vector = new THREE.Vector3().setFromMatrixPosition(matrix);

    vector.project(camera);
    vector.x = Math.round(((vector.x + 1) * canvas.width) / 2);
    vector.y = Math.round(((-vector.y + 1) * canvas.height) / 2);
    vector.z = 0;

    return {
        layerX: vector.x,
        layerY: vector.y,
    };
}

/**
 * This function is making clicks on 2 atoms. Used for testing.
 * @param {Wave} wave - wave instance object.
 * @param {Array<THREE.Mesh>} atoms - 2 atom mesh objects in array.
 * @param {Function} stateUpdate - in this context just a simple mocked jest.fn.
 */
export function makeClickOnTwoAtoms(wave, atoms, stateUpdate) {
    const [atomA, atomB] = atoms;
    const eventA = getEventObjectBy3DPosition(
        atomA.position,
        wave.camera,
        wave.renderer.domElement,
    );
    const eventB = getEventObjectBy3DPosition(
        atomB.position,
        wave.camera,
        wave.renderer.domElement,
    );
    wave.onClick(stateUpdate, eventA);
    wave.onClick(stateUpdate, eventB);
}

/**
 * This function is making clicks on 3 atoms. Used for testing.
 * @param {Wave} wave - wave instance object.
 * @param {Array<THREE.Mesh>} atoms - 3 atom mesh objects in array.
 * @param {Function} stateUpdate - in this context just a simple mocked jest.fn.
 */
export function makeClickOn3Atoms(wave, atoms, stateUpdate) {
    atoms.forEach((atom) => {
        const event = getEventObjectBy3DMatrix(
            atom.matrixWorld,
            wave.camera,
            wave.renderer.domElement,
        );
        wave.onClick(stateUpdate, event);
    });
}

// Create a proper MouseEvent-like object that the measurement manager expects
export function createMouseEventFromPosition(position, camera, canvas, type = "click") {
    const baseEvent = getEventObjectBy3DPosition(position, camera, canvas);
    return {
        ...baseEvent,
        offsetX: baseEvent.layerX,
        offsetY: baseEvent.layerY,
        clientX: baseEvent.layerX,
        clientY: baseEvent.layerY,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        type,
    };
}
