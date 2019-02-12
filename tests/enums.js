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

// default material config
export const MATERIAL_CONFIG = {
    "name": "Silicon FCC",
    "basis": {
        "elements": [
            {
                "id": 0,
                "value": "Si"
            },
            {
                "id": 1,
                "value": "Si"
            }
        ],
        "coordinates": [
            {
                "id": 0,
                "value": [
                    0,
                    0,
                    0
                ]
            },
            {
                "id": 1,
                "value": [
                    0.25,
                    0.25,
                    0.25
                ]
            }
        ],
        "units": "crystal"
    },
    "lattice": {
        "a": 3.867,
        "b": 3.867,
        "c": 3.867,
        "alpha": 60,
        "beta": 60,
        "gamma": 59.99999,
        "units": {
            "length": "angstrom",
            "angle": "degree"
        },
        "type": "FCC"
    }
};

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
