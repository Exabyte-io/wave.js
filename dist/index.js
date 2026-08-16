import { jsx as _jsx } from "react/jsx-runtime";
import "./stylesheets/main.css";
import "./MuiClassNameSetup";
import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import { Made } from "@mat3ra/made";
import React from "react";
import ReactDOM from "react-dom";
import { ThreeDEditor } from "./components/ThreeDEditor";
import { parseViewSettingsFromUrlParams } from "./utils/viewSettingsUrl";
// Registering the ESSE schemas is the *host application's* job, not the library's - which is why
// this sits in the standalone entry point and not in `ThreeDEditor` or anything reachable from
// `exports.js`. A consumer (materials-designer, web-app) registers its own at startup, and
// bundling `schemas.json` into the library would both bloat every consumer and risk clobbering a
// registry the host had already populated.
//
// This file *is* the host for the standalone build - `index.html` imports it and nothing
// re-exports it - so without this the demo has no registry at all. Since @mat3ra/made
// 2026.8.13-0 (SOF-7926, #202) `Material.clone()` and `toJSON()` resolve `material-enhanced-hashed`
// through this interface, and `ThreeDEditor`'s constructor clones the material it is given, so an
// unregistered demo threw before React could mount anything - a blank page, no error card, because
// the throw happens above `ViewerErrorBoundary` rather than inside it.
//
// Imported dynamically so `schemas.json` lands in its own chunk: it is 2.96 MB, and a static import
// grew the app shell from 5.5 MB to 8.6 MB, all of which the browser has to parse before rendering.
// Split, it is fetched in parallel with the shell and parsed only as JSON.
let schemasPromise = null;
function registerSchemas() {
    if (!schemasPromise) {
        schemasPromise = import("@mat3ra/esse/dist/js/schemas.json").then((module) => {
            JSONSchemasInterface.setSchemas(module.default);
        });
    }
    return schemasPromise;
}
// Async because of the schema chunk above. `index.html` calls this without awaiting, which is
// fine - the await is *inside*, before the first `Material` is constructed, so no caller can race
// it.
// eslint-disable-next-line  react/no-render-return-value
const renderThreeDEditor = async (materialConfig, newDomElement, options = {}) => {
    const config = materialConfig || Made.defaultMaterialConfig;
    const domElement = newDomElement || document.getElementById("root");
    if (!domElement) {
        console.warn("No root element found for rendering the 3D editor");
        return;
    }
    await registerSchemas();
    // Read view settings from URL query params unless explicitly provided
    const initialViewSettings = options.initialViewSettings ||
        parseViewSettingsFromUrlParams(Object.fromEntries(new URLSearchParams(window.location.search)));
    const currentMaterial = new Made.Material(config);
    ReactDOM.render(_jsx(ThreeDEditor, { editable: true, isStandalone: true, material: currentMaterial, initialViewSettings: initialViewSettings }), domElement);
};
window.renderThreeDEditor = renderThreeDEditor;
export { renderThreeDEditor };
