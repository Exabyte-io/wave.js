import "./stylesheets/main.css";
import "./MuiClassNameSetup";

import { Made } from "@mat3ra/made";
import React from "react";
import ReactDOM from "react-dom";

import { ThreeDEditor } from "./components/ThreeDEditor";
// eslint-disable-next-line  react/no-render-return-value
const renderThreeDEditor = (materialConfig, newDomElement) => {
    const config = materialConfig || Made.defaultMaterialConfig;
    const domElement = newDomElement || document.getElementById("root");

    const currentMaterial = new Made.Material(config);
    ReactDOM.render(<ThreeDEditor editable material={currentMaterial} />, domElement);
};

window.renderThreeDEditor = renderThreeDEditor;
export { renderThreeDEditor };
