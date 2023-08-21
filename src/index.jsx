import "./stylesheets/main.scss";
import "./MuiClassNameSetup";

import { Made } from "@exabyte-io/made.js";
import React from "react";
import ReactDOM from "react-dom";

import { ThreeDEditor } from "./components/ThreeDEditor";

const domElement = document.getElementById("root");
const newAtom = [
    { id: 3, value: "Au" },
    { id: 4, value: "O" },
    { id: 5, value: "U" },
    { id: 6, value: "Cl" },
    { id: 7, value: "H" },
    { id: 8, value: "Fr" },
];
const newCoordinates = [
    { id: 3, value: [0.5, 0.5, 0.5] },
    { id: 4, value: [0.75, 0.95, 0.5] },
    { id: 5, value: [0.25, 0.25, 0.5] },
    { id: 6, value: [0.75, 0.75, 0.5] },
    { id: 7, value: [0.2, 0.75, 0.2] },
    { id: 8, value: [0.75, 0.75, 0.7] },
];

// Adding the new atom to the defaultMaterialConfig
Made.defaultMaterialConfig.basis.elements.push(...newAtom);
Made.defaultMaterialConfig.basis.coordinates.push(...newCoordinates);

const material = new Made.Material(Made.defaultMaterialConfig);
// eslint-disable-next-line  react/no-render-return-value
window.threeDEditor = ReactDOM.render(<ThreeDEditor editable material={material} />, domElement);
