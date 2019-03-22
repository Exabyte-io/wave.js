import React from 'react';
import _ from "underscore";
import Button from 'material-ui-next/Button';
import Tooltip from 'material-ui-next/Tooltip';

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
                <Button
                    aria-toggled={this.props.isToggleable && this.state.isToggled}
                    aria-label={this.props.label || this.props.title.toLowerCase()}
                    variant="fab"
                    onClick={(...args) => {
                        this.props.onClick(...args);
                        this.handleToggle();
                    }}
                    {..._.omit(this.props, "title", "tooltipPlacement", "id", "label", "onClick", "isToggleable")}
                />
            </Tooltip>
        );
    }
}

RoundIconButton.propTypes = {
    title: React.PropTypes.string,
    id: React.PropTypes.string,
    label: React.PropTypes.string,
    tooltipPlacement: React.PropTypes.string,
    isToggleable: React.PropTypes.bool,
    isToggled: React.PropTypes.bool,
};

RoundIconButton.defaultProps = {
    isToggleable: true,
};
