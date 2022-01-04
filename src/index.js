import "./stylesheets/main.scss";

import { Made } from "@exabyte-io/made.js";
import React from "react";
import ReactDOM from "react-dom";

import { ThreeDEditor } from "./components/ThreeDEditor";

const domElement = document.getElementById("root");
const material = new Made.Material(Made.defaultMaterialConfig);
window.threeDEditor = ReactDOM.render(<ThreeDEditor editable material={material} />, domElement);
