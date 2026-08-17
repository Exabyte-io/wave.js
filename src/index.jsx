import "./stylesheets/main.css";
import "./MuiClassNameSetup";

import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import allSchemas from "@mat3ra/esse/dist/js/schemas.json";
import { Made } from "@mat3ra/made";
import React from "react";
import ReactDOM from "react-dom";

import { ThreeDEditor } from "./components/ThreeDEditor";
import { parseViewSettingsFromUrlParams } from "./utils/viewSettingsUrl";

// Registering ESSE schemas is the host application's job, not the library's - so this lives in the
// standalone entry point, not in `ThreeDEditor` or anything reachable from `exports.js`. Consumers
// (materials-designer, web-app) register their own at startup.
//
// This file is the host for the standalone build, and without this it had no registry at all: since
// @mat3ra/made 2026.8.13-0 (#202) `Material.clone()` resolves `material-enhanced-hashed` through
// this interface, and `ThreeDEditor`'s constructor clones the material it is given - so the demo
// threw before React mounted anything.
JSONSchemasInterface.setSchemas(allSchemas);

// eslint-disable-next-line  react/no-render-return-value
const renderThreeDEditor = (materialConfig, newDomElement, options = {}) => {
    const config = materialConfig || Made.defaultMaterialConfig;
    const domElement = newDomElement || document.getElementById("root");
    if (!domElement) {
        console.warn("No root element found for rendering the 3D editor");
        return;
    }

    // Read view settings from URL query params unless explicitly provided
    const initialViewSettings =
        options.initialViewSettings ||
        parseViewSettingsFromUrlParams(
            Object.fromEntries(new URLSearchParams(window.location.search)),
        );

    const currentMaterial = new Made.Material(config);
    ReactDOM.render(
        <ThreeDEditor
            editable
            isStandalone
            material={currentMaterial}
            initialViewSettings={initialViewSettings}
        />,
        domElement,
    );
};

window.renderThreeDEditor = renderThreeDEditor;
export { renderThreeDEditor };
