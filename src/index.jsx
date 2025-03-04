import "./stylesheets/main.css";
import "./MuiClassNameSetup";

import { ATOMIC_COORD_UNITS, units } from "@mat3ra/code/constants";
import { Made } from "@mat3ra/made";
import React from "react";
import ReactDOM from "react-dom";

import { ThreeDEditor } from "./components/ThreeDEditor";

const debugMaterialConfig = {
    name: "Silicon FCC",
    basis: {
        elements: [
            {
                id: 1,
                value: "Si",
            },
            {
                id: 2,
                value: "Si",
            },
            {
                id: 3,
                value: "C",
            },
            {
                id: 4,
                value: "C",
            },
        ],
        coordinates: [
            {
                id: 1,
                value: [0.0, 0.0, 0.0],
            },
            {
                id: 2,
                value: [0.25, 0.25, 0.25],
            },
            {
                id: 3,
                value: [0.5, 0.5, 0.75],
            },
            {
                id: 4,
                value: [0.25, 0.5, 0.5],
            },
        ],
        units: ATOMIC_COORD_UNITS.crystal,
    },
    lattice: {
        // Primitive cell for Diamond FCC Silicon at ambient conditions
        type: "FCC",
        a: 3.867,
        b: 3.867,
        c: 3.867,
        alpha: 60,
        beta: 60,
        gamma: 60,
        units: {
            length: units.angstrom,
            angle: units.degree,
        },
    },
};
// eslint-disable-next-line  react/no-render-return-value
const renderThreeDEditor = (materialConfig, newDomElement) => {
    const config = debugMaterialConfig;
    const domElement = newDomElement || document.getElementById("root");
    if (!domElement) {
        console.warn("No root element found for rendering the 3D editor");
        return;
    }

    const currentMaterial = new Made.Material(config);
    ReactDOM.render(<ThreeDEditor editable material={currentMaterial} />, domElement);
};

window.renderThreeDEditor = renderThreeDEditor;
export { renderThreeDEditor };
