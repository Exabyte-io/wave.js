import "./stylesheets/main.css";
import "./MuiClassNameSetup";

import { Made } from "@mat3ra/made";
import React from "react";
import ReactDOM from "react-dom";

import { ThreeDEditor } from "./components/ThreeDEditor";

const domElement = document.getElementById("root");
const material = new Made.Material(Made.defaultMaterialConfig);

window.addEventListener("message", (event) => {
    console.log("Received message from parent: " + JSON.stringify(event.data));
    if (event.data && event.data.material) {
        try {
            const newMaterial = new Made.Material(event.data.material);
            console.log("Created material: " + newMaterial.toJSON());
            if (window.threeDEditor) {
                window.threeDEditor.setState(
                    {
                        originalMaterial: newMaterial,
                        material: newMaterial.clone(),
                    },
                    () => {
                        // Force Wave component to update after state change
                        if (window.threeDEditor.WaveComponent) {
                            window.threeDEditor.WaveComponent.reloadViewer(true);
                        }
                    },
                );
            }
        } catch (error) {
            alert("Error creating material: " + error.message);
        }
    }
});

// eslint-disable-next-line  react/no-render-return-value
window.threeDEditor = ReactDOM.render(<ThreeDEditor editable material={material} />, domElement);
