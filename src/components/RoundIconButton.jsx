import { IconButton, Tooltip } from "material-ui";
import PropTypes from "prop-types";
import React from "react";
import _ from "underscore";

/**
 * Round icon button with toggle logic
 */
export class RoundIconButton extends React.Component {
    constructor(props) {
        super(props);
        const { isToggled } = this.props;
        this.state = { isToggled };
        this.handleToggle = this.handleToggle.bind(this);
    }

    // eslint-disable-next-line no-unused-vars
    UNSAFE_componentWillReceiveProps({ isToggled: newToggled }, newContext) {
        const { isToggled } = this.props;
        if (isToggled !== newToggled) this.setState({ isToggled: newToggled || false });
    }

    handleToggle() {
        const { isToggled } = this.state;
        this.setState({ isToggled: !isToggled });
    }

    render() {
        const { id, label, title, onClick, tooltipPlacement, isToggleable } = this.props;
        const { isToggled } = this.state;
        return (
            <Tooltip id={id} title={title.toUpperCase()} placement={tooltipPlacement}>
                <IconButton
                    aria-checked={isToggleable && isToggled}
                    aria-label={label || title.toLowerCase()}
                    onClick={(...args) => {
                        onClick(...args);
                        this.handleToggle();
                    }}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {..._.omit(
                        this.props,
                        "title",
                        "tooltipPlacement",
                        "id",
                        "label",
                        "onClick",
                        "isToggleable",
                        "isToggled",
                    )}
                />
            </Tooltip>
        );
    }
}

RoundIconButton.propTypes = {
    title: PropTypes.string.isRequired,
    id: PropTypes.string,
    label: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    tooltipPlacement: PropTypes.string.isRequired,
    isToggleable: PropTypes.bool,
    isToggled: PropTypes.bool,
};

RoundIconButton.defaultProps = {
    isToggleable: true,
    isToggled: false,
    label: undefined,
    id: undefined,
};
