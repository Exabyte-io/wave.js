"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _IconButton = _interopRequireDefault(require("@mui/material/IconButton"));
var _Tooltip = _interopRequireDefault(require("@mui/material/Tooltip"));
var _react = _interopRequireDefault(require("react"));
var _underscore = _interopRequireDefault(require("underscore"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Square icon button with toggle logic
 */
function SquareIconButton(props) {
  const {
    title,
    id,
    label,
    onClick,
    tooltipPlacement = "top"
  } = props;
  const defaultIconButtonStyle = {
    borderRadius: 0
  };
  return /*#__PURE__*/_react.default.createElement(_Tooltip.default, {
    id: id,
    title: title,
    placement: tooltipPlacement,
    disableInteractive: true
  }, /*#__PURE__*/_react.default.createElement(_IconButton.default, _extends({
    disableFocusRipple: true,
    disableTouchRipple: true,
    size: "large",
    key: id,
    "aria-label": label || title.toLowerCase(),
    onClick: onClick,
    sx: defaultIconButtonStyle
    // eslint-disable-next-line react/jsx-props-no-spreading
  }, _underscore.default.omit(props, "title", "tooltipPlacement", "id", "label", "onClick", "isToggleable", "isToggled"))));
}
var _default = exports.default = SquareIconButton;