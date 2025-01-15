"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModalDialog = void 0;
var _Dialog = _interopRequireDefault(require("@exabyte-io/cove.js/dist/mui/components/dialog/Dialog"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ModalDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    this.onHide = this.onHide.bind(this);
    this.renderBody = this.renderBody.bind(this);
  }
  onHide(e) {
    const {
      onHide
    } = this.props;
    onHide(e);
    this.removeStylingFromBody();
  }
  removeStylingFromBody() {
    const {
      backdropColor
    } = this.props;
    document.body.classList.remove("modal-backdrop-color-" + backdropColor);
  }

  // eslint-disable-next-line class-methods-use-this
  renderBody() {
    return null;
  }
  render() {
    const {
      className,
      isFullWidth,
      show,
      modalId
    } = this.props;
    return /*#__PURE__*/_react.default.createElement(_Dialog.default, {
      id: modalId,
      animation: false,
      sx: {
        height: "100%",
        width: "100%"
      },
      open: show,
      fullWidth: isFullWidth,
      maxWidth: false,
      onClose: this.onHide,
      className: className,
      renderHeaderCustom: () => null,
      renderFooterCustom: () => null,
      PaperProps: {
        sx: {
          maxWidth: "100%",
          maxHeight: "100%",
          width: "100%",
          height: "100%",
          m: 0
        }
      },
      renderBodyCustom: this.renderBody
    });
  }
}
exports.ModalDialog = ModalDialog;
ModalDialog.propTypes = {
  modalId: _propTypes.default.string.isRequired,
  show: _propTypes.default.bool.isRequired,
  onHide: _propTypes.default.func.isRequired,
  className: _propTypes.default.string.isRequired,
  isFullWidth: _propTypes.default.bool,
  backdropColor: _propTypes.default.string
};
ModalDialog.defaultProps = {
  isFullWidth: true,
  backdropColor: "white"
};