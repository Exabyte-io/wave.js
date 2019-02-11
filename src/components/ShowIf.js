import React from 'react';

/**
 * @summary Renders children depending on the condition which is either true or false.
 * @property {boolean} condition The condition
 * @property {node} children Children element that are required for this component
 */
class ShowIf extends React.Component {
    render() {
        return (this.props.condition ? this.props.children : null);
    }
}

ShowIf.propTypes = {
    condition: React.PropTypes.bool.isRequired,
    children: React.PropTypes.node.isRequired
};

export {ShowIf}
