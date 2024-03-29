import PropTypes from "prop-types";
import React from "react";

/**
 * Renders children depending on a Boolean condition
 * @property {boolean} condition The condition
 * @property {node} children Children element that are required for this component
 */
class ShowIf extends React.Component {
    render() {
        const { condition, children } = this.props;
        return condition ? children : null;
    }
}

ShowIf.propTypes = {
    condition: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
};

export { ShowIf };
