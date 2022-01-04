import React from 'react';
import PropTypes from 'prop-types';

/**
 * Renders children depending on a Boolean condition
 * @property {boolean} condition The condition
 * @property {node} children Children element that are required for this component
 */
class ShowIf extends React.Component {
    render() {
        return (this.props.condition ? this.props.children : null);
    }
}

ShowIf.propTypes = {
    condition: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired
};

export {ShowIf}
