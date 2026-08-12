import { jsx as _jsx } from "react/jsx-runtime";
import "./stylesheets/main.css";
import "./MuiClassNameSetup";
import { Made } from "@mat3ra/made";
import React from "react";
import ReactDOM from "react-dom";
import { ThreeDEditor } from "./components/ThreeDEditor";
import { parseViewSettingsFromUrlParams } from "./utils/viewSettingsUrl";
// eslint-disable-next-line  react/no-render-return-value
const renderThreeDEditor = (materialConfig, newDomElement, options = {}) => {
    const config = materialConfig || Made.defaultMaterialConfig;
    const domElement = newDomElement || document.getElementById("root");
    if (!domElement) {
        console.warn("No root element found for rendering the 3D editor");
        return;
    }
    // Read view settings from URL query params unless explicitly provided
    const initialViewSettings = options.initialViewSettings ||
        parseViewSettingsFromUrlParams(Object.fromEntries(new URLSearchParams(window.location.search)));
    const currentMaterial = new Made.Material(config);
    ReactDOM.render(_jsx(ThreeDEditor, { editable: true, isStandalone: true, material: currentMaterial, initialViewSettings: initialViewSettings }), domElement);
};
window.renderThreeDEditor = renderThreeDEditor;
export { renderThreeDEditor };
