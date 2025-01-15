"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoadingIndicator = void 0;
var _CircularProgress = _interopRequireDefault(require("@mui/material/CircularProgress"));
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const LoadingIndicator = exports.LoadingIndicator = function LoadingIndicator() {
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "spinner-wrap"
  }, /*#__PURE__*/_react.default.createElement(_CircularProgress.default, {
    className: "spinner",
    color: "secondary"
  }));
};