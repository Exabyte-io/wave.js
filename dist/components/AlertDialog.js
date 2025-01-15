"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.AlertDialog = void 0;
var _Button = _interopRequireDefault(require("@mui/material/Button"));
var _Dialog = _interopRequireDefault(require("@mui/material/Dialog"));
var _DialogActions = _interopRequireDefault(require("@mui/material/DialogActions"));
var _DialogContent = _interopRequireDefault(require("@mui/material/DialogContent"));
var _DialogContentText = _interopRequireDefault(require("@mui/material/DialogContentText"));
var _DialogTitle = _interopRequireDefault(require("@mui/material/DialogTitle"));
var _react = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// TODO: move that component to cove.js and reuse it here

const AlertDialog = exports.AlertDialog = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const [isOpened, setIsOpened] = (0, _react.useState)(false);
  const [content, setContent] = (0, _react.useState)("");
  const [buttons, setButtons] = (0, _react.useState)([]);
  const [title, setTitle] = (0, _react.useState)("");

  /* eslint-disable no-shadow */
  const handleOpen = ({
    content,
    buttons = [],
    title
  }) => {
    setTitle(title);
    setButtons(buttons);
    setContent(content);
    setIsOpened(true);
  };
  const handleClose = () => {
    setIsOpened(false);
  };
  const renderButtons = () => {
    return buttons.map(({
      text,
      onClick
    }) => {
      return /*#__PURE__*/_react.default.createElement(_Button.default, {
        key: text,
        onClick: onClick
      }, text);
    });
  };
  (0, _react.useImperativeHandle)(ref, () => {
    return {
      open: handleOpen,
      close: handleClose
    };
  }, []);
  return /*#__PURE__*/_react.default.createElement(_Dialog.default, {
    open: isOpened,
    onClose: handleClose,
    "aria-labelledby": "alert-dialog-title",
    "aria-describedby": "alert-dialog-description"
  }, /*#__PURE__*/_react.default.createElement(_DialogTitle.default, {
    id: "alert-dialog-title"
  }, title), /*#__PURE__*/_react.default.createElement(_DialogContent.default, null, /*#__PURE__*/_react.default.createElement(_DialogContentText.default, {
    id: "alert-dialog-description"
  }, content)), /*#__PURE__*/_react.default.createElement(_DialogActions.default, null, renderButtons()));
});
var _default = exports.default = AlertDialog;