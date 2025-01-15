"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Box = _interopRequireDefault(require("@mui/material/Box"));
var _Stack = _interopRequireDefault(require("@mui/material/Stack"));
var _TextField = _interopRequireDefault(require("@mui/material/TextField"));
var _Typography = _interopRequireDefault(require("@mui/material/Typography"));
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ParametersMenu(props) {
  const {
    viewerSettings,
    handleCellRepetitionsChange,
    handleSphereRadiusChange,
    handleChemicalConnectivityFactorChange
  } = props;
  return /*#__PURE__*/_react.default.createElement(_Stack.default, {
    spacing: 1.5,
    margin: 2
  }, /*#__PURE__*/_react.default.createElement(_Typography.default, {
    variant: "body1"
  }, "Atomic radius"), /*#__PURE__*/_react.default.createElement(_Box.default, null, /*#__PURE__*/_react.default.createElement(_TextField.default, {
    fullWidth: true,
    label: "Value",
    type: "number",
    size: "small",
    className: "inverse stepper sphere-radius",
    id: "sphere-radius",
    value: viewerSettings.atomRadiiScale,
    onChange: handleSphereRadiusChange,
    inputProps: {
      max: 10,
      min: 0.1,
      step: 0.1
    }
  })), /*#__PURE__*/_react.default.createElement(_Typography.default, {
    variant: "body1"
  }, "Repetition along vectors:"), /*#__PURE__*/_react.default.createElement(_Stack.default, {
    key: "repetition",
    direction: "row",
    spacing: 1
  }, ["A", "B", "C"].map(label => {
    const key = `repetitionsAlongLatticeVector${label}`;
    return /*#__PURE__*/_react.default.createElement(_Box.default, {
      key: label
    }, /*#__PURE__*/_react.default.createElement(_TextField.default, {
      label: label,
      size: "small",
      type: "number",
      className: "inverse stepper cell-repetitions",
      id: `repetitionsAlongLatticeVector${label}`,
      value: viewerSettings[key],
      onChange: handleCellRepetitionsChange,
      inputProps: {
        max: 10,
        min: 1,
        step: 1
      }
    }));
  })), /*#__PURE__*/_react.default.createElement(_Typography.default, {
    variant: "body1"
  }, "Chemical connectivity factor"), /*#__PURE__*/_react.default.createElement(_Box.default, null, /*#__PURE__*/_react.default.createElement(_TextField.default, {
    fullWidth: true,
    size: "small",
    label: "Value",
    type: "number",
    className: "inverse stepper cell-repetitions",
    id: "chemical-connectivity-factor",
    value: viewerSettings.chemicalConnectivityFactor,
    onChange: handleChemicalConnectivityFactorChange,
    inputProps: {
      max: 2,
      min: 0,
      step: 0.01
    }
  })));
}
var _default = exports.default = ParametersMenu;