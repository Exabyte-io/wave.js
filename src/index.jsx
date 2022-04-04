import "./stylesheets/main.scss";

import { Made } from "@exabyte-io/made.js";
import React from "react";
import ReactDOM from "react-dom";

import { H2O } from "./fixture-boundary-H2O";
// import { fixtureLaAgPO34 } from "./fixture-LaPo";

import { ThreeDEditor } from "./components/ThreeDEditor";

const domElement = document.getElementById("root");
const material = new Made.Material(H2O);
// const material = new Made.Material(fixtureLaAgPO34);
// const material = new Made.Material(Made.defaultMaterialConfig);
// eslint-disable-next-line  react/no-render-return-value
window.threeDEditor = ReactDOM.render(
    <ThreeDEditor
        editable
        material={material}
        boundaryConditions={H2O.metadata.boundaryConditions}
    />,
    domElement,
);
