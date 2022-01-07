import React from 'react';
import PropTypes from 'prop-types';
import _ from "underscore";
import { IconButton } from 'material-ui';
import { Tooltip } from 'material-ui';

/**
 * Round icon button with toggle logic
 */
export class RoundIconButton extends React.Component {

    constructor(props) {
        super(props);
        this.state = {isToggled: this.props.isToggled || false};
        this.handleToggle = this.handleToggle.bind(this);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.isToggled !== newProps.isToggled) this.setState({isToggled: newProps.isToggled || false});
    }

    handleToggle() {
        this.setState({isToggled: !this.state.isToggled})
    }

    render() {
        return (
            <Tooltip id={this.props.id} title={this.props.title.toUpperCase()} placement={this.props.tooltipPlacement}>
                <IconButton
                    aria-checked={this.props.isToggleable && this.state.isToggled}
                    aria-label={this.props.label || this.props.title.toLowerCase()}
                    onClick={(...args) => {
                        this.props.onClick(...args);
                        this.handleToggle();
                    }}
                    {..._.omit(this.props, "title", "tooltipPlacement", "id", "label", "onClick", "isToggleable", "isToggled")}
                />
            </Tooltip>
        );
    }
}

RoundIconButton.propTypes = {
    title: PropTypes.string,
    id: PropTypes.string,
    label: PropTypes.string,
    tooltipPlacement: PropTypes.string,
    isToggleable: PropTypes.bool,
    isToggled: PropTypes.bool,
};

RoundIconButton.defaultProps = {
    isToggleable: true,
};
