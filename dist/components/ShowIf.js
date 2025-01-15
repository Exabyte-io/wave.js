"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShowIf = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Renders children depending on a Boolean condition
 * @property {boolean} condition The condition
 * @property {node} children Children element that are required for this component
 */
class ShowIf extends _react.default.Component {
  render() {
    const {
      condition,
      children
    } = this.props;
    return condition ? children : null;
  }
}
exports.ShowIf = ShowIf;
ShowIf.propTypes = {
  condition: _propTypes.default.bool.isRequired,
  children: _propTypes.default.node.isRequired
};