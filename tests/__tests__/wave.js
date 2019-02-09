import GL from "gl";
import fs from "fs";
import path from "path";
import {PNG} from "pngjs2";
import {Made} from "made.js";
import * as THREE from "three";

import {Wave} from "../../src/wave";

global.THREE = THREE;

Wave.prototype.getWebGLRenderer = (config) => {
    const elementProperties = {
        width: {value: 500},
        height: {value: 800},
        clientWidth: {value: 500},
        clientHeight: {value: 800},
    };

    const context = GL(500, 800, {preserveDrawingBuffer: true});
    const canvas = createElement("canvas", elementProperties);
    Object.defineProperty(context, 'canvas', {value: canvas});
    return new THREE.WebGLRenderer({
        ...config,
        context
    })
};

function createElement(name, defineProperties) {
    const element = document.createElement(name);
    for (const key in defineProperties) {
        const properties = {
            ...defineProperties[key],
            writable: true
        };
        Object.defineProperty(element, key, properties)
    }
    return element;
}

function snapshotPng(gl, imagePath, width, height) {
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    let png = new PNG({
        width: width,
        height: height
    });
    png.data = pixels;

    return new Promise((resolve, reject) => {
        png.pack()
            .pipe(fs.createWriteStream(imagePath))
            .on('finish', () => resolve(imagePath))
    })
}

describe('WaveComponent', () => {
    it('WaveComponent', () => {

        const elementProperties = {
            width: {value: 500},
            height: {value: 800},
            clientWidth: {value: 500},
            clientHeight: {value: 800},
        };

        const domElement = createElement("div", elementProperties);

        const materialConfig = {
            "basis": {
                "elements": [
                    {
                        "id": 1,
                        "value": "Si"
                    },
                    {
                        "id": 2,
                        "value": "Si"
                    }
                ],
                "coordinates": [
                    {
                        "id": 1,
                        "value": [
                            0,
                            0,
                            0
                        ]
                    },
                    {
                        "id": 2,
                        "value": [
                            0.25,
                            0.25,
                            0.25
                        ]
                    }
                ]
            },
            "lattice": {
                "a": 5,
                "b": 5,
                "c": 5,
                "alpha": 90,
                "beta": 90,
                "gamma": 90,
                "type": "TRI",
                "units": {
                    "length": "angstrom",
                    "angle": "degree"
                }
            }
        };
        const material = new Made.Material(materialConfig);
        const wave = new Wave({
            DOMElement: domElement,
            structure: material,
            cell: material.Lattice.unitCell,
            settings: {
                atomRadiiScale: 0.2,
                atomRepetitions: 1,
            }
        });

        wave.toggleAxes();

        const snapshotPath = path.resolve(__dirname, "__snapshots__/snapshot.png");
        const promise = snapshotPng(wave.renderer.context, snapshotPath, 500, 800);
        expect(promise).resolves.not.toBe(undefined);

    });
});
