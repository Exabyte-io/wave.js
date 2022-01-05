/* eslint-disable prefer-promise-reject-errors */
import fs from "fs";
import looksSame from "looks-same";
import path from "path";
import { PNG } from "pngjs2";

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
 * Takes snapshot and saves it as PNG.
 * Note: The function returns a promise as the operation is asynchronous and should be awaited when called.
 * @param webGLContext {Object} WebGLRenderer context
 * @param imagePath {String} path to save the snapshot
 * @returns {Promise}
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
    return new Promise((resolve, reject) => {
        try {
            png.pack()
                .pipe(fs.createWriteStream(imagePath))
                .on("finish", () => resolve(true));
        } catch (err) {
            reject(false);
        }
    });
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
    const expectedImageFilePath = path.resolve(snapshotDir, `${imagePrefix}.expected.png`);
    await expect(takeSnapshot(webGLContext, actualImageFilePath)).resolves.toBe(true);
    const promise = new Promise((resolve, reject) => {
        try {
            looksSame(actualImageFilePath, expectedImageFilePath, (err, { equal }) => {
                if (err) reject(false);
                resolve(equal);
            });
        } catch (err) {
            reject(false);
        }
    });
    return expect(promise).resolves.toBe(true);
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
