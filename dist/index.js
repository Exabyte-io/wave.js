"use strict";

require("./stylesheets/main.css");
require("./MuiClassNameSetup");
var _made = require("@mat3ra/made");
var _react = _interopRequireDefault(require("react"));
var _reactDom = _interopRequireDefault(require("react-dom"));
var _ThreeDEditor = require("./components/ThreeDEditor");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const domElement = document.getElementById("root");
const material = new _made.Made.Material(_made.Made.defaultMaterialConfig);

// eslint-disable-next-line  react/no-render-return-value
window.threeDEditor = _reactDom.default.render(/*#__PURE__*/_react.default.createElement(_ThreeDEditor.ThreeDEditor, {
  editable: true,
  material: material
}), domElement);