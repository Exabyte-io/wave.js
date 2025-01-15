"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _icon = _interopRequireDefault(require("@exabyte-io/cove.js/dist/mui/components/icon"));
var _NestedDropdown = _interopRequireDefault(require("@exabyte-io/cove.js/dist/mui/components/nested-dropdown/NestedDropdown"));
var _PowerSettingsNew = _interopRequireDefault(require("@mui/icons-material/PowerSettingsNew"));
var _ButtonGroup = _interopRequireDefault(require("@mui/material/ButtonGroup"));
var _Paper = _interopRequireDefault(require("@mui/material/Paper"));
var _styles = require("@mui/material/styles");
var _useMediaQuery = _interopRequireDefault(require("@mui/material/useMediaQuery"));
var _react = _interopRequireDefault(require("react"));
var _SquareIconButton = _interopRequireDefault(require("./SquareIconButton"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function IconsToolbar(props) {
  const {
    isInteractive,
    handleToggleInteractive,
    toolbarConfig
  } = props;
  const theme = (0, _styles.useTheme)();
  const isMobile = (0, _useMediaQuery.default)(theme.breakpoints.down("sm"));
  const toolbarStyle = {
    position: "absolute",
    top: "1em",
    left: "1em",
    boxShadow: theme.shadows[4]
  };
  const paperSx = {
    marginLeft: theme.spacing(1),
    boxShadow: theme.shadows[4]
  };
  return /*#__PURE__*/_react.default.createElement(_Paper.default, {
    elevation: 2
  }, /*#__PURE__*/_react.default.createElement(_ButtonGroup.default, {
    key: "toolbar-button-group",
    orientation: "vertical",
    sx: toolbarStyle,
    variant: "outlined",
    color: "inherit"
  }, /*#__PURE__*/_react.default.createElement(_SquareIconButton.default, {
    key: "toggle-interactive",
    size: "large",
    title: "Interactive",
    "data-name": "Interactive",
    onClick: handleToggleInteractive
  }, isInteractive ? /*#__PURE__*/_react.default.createElement(_icon.default, {
    name: "actions.close",
    sx: {
      color: theme.palette.warning.main
    }
  }) : /*#__PURE__*/_react.default.createElement(_PowerSettingsNew.default, null)), isInteractive && toolbarConfig.map(config => {
    if (config.actions || config.contentObject) {
      return /*#__PURE__*/_react.default.createElement(_NestedDropdown.default
      /* eslint-disable-next-line react/jsx-props-no-spreading */, _extends({}, config, {
        actions: config.actions,
        contentObject: config.contentObject,
        key: config.key || config.id,
        "data-name": config.id,
        paperPlacement: config.paperPlacement || "right-start",
        paperSx: paperSx,
        isMobile: isMobile
      }), /*#__PURE__*/_react.default.createElement(_SquareIconButton.default, {
        "data-name": config.id,
        key: `button-${config.key}` || `button-${config.id}`,
        title: config.title,
        onClick: config.onClick
      }, config.leftIcon));
    }
    const {
      id,
      key,
      title,
      onClick,
      leftIcon
    } = config;
    return /*#__PURE__*/_react.default.createElement(_SquareIconButton.default, {
      key: key || id,
      "data-name": id,
      title: title,
      onClick: onClick
    }, leftIcon);
  })));
}
var _default = exports.default = IconsToolbar;