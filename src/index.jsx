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
    if (!domElement) {
        console.warn("No root element found for rendering the 3D editor");
        return;
    }

    const currentMaterial = new Made.Material(config);
    ReactDOM.render(<ThreeDEditor editable isStandalone material={currentMaterial} />, domElement);
};

window.renderThreeDEditor = renderThreeDEditor;
export { renderThreeDEditor };
