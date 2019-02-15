import path from "path";
import {Made} from "made.js";

// canvas element width/height
import {Wave} from "../src/wave";
import {createElement} from "./utils";

export const WIDTH = 500;
export const HEIGHT = 1000;

// used to override width/height element getters.
export const ELEMENT_PROPERTIES = {
    width: {value: WIDTH},
    height: {value: HEIGHT},
    clientWidth: {value: WIDTH},
    clientHeight: {value: HEIGHT},
};

import fs from "fs-extra";
import _ from "underscore";
import {expect} from "chai";

export function readFile(filePath, coding = 'utf8') {
    return fs.readFileSync(filePath, coding);
}

export function readJSONFile(filePath) {
    return JSON.parse(readFile(filePath));
}

export function assertDeepAlmostEqual(leftHandOperand, rightHandOperand, excludedKeys = []) {
    expect(_.omit(leftHandOperand, excludedKeys)).to.be.deep.almost.equal(_.omit(rightHandOperand, excludedKeys));
}

// default material config
const materialJsonFilePath = path.resolve(__dirname, "material.json");
export const MATERIAL_CONFIG = JSON.parse(readFile(fs.readFileSync(materialJsonFilePath)));

export const WAVE_SETTINGS = {
    atomRadiiScale: 0.2,
    atomRepetitions: 1,
};

export function getWaveInstance() {
    const material = new Made.Material(MATERIAL_CONFIG);
    return new Wave({
        DOMElement: createElement("div", ELEMENT_PROPERTIES),
        structure: material,
        cell: material.Lattice.unitCell,
        settings: WAVE_SETTINGS
    });
}
