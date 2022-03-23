import Close from "@material-ui/icons/Close";
import setClass from "classnames";
import PropTypes from "prop-types";
import React from "react";

import { RoundIconButton } from "./RoundIconButton";
import { ShowIf } from "./ShowIf";

/**
 * Icon toolbar that can be activated/deactivated
 */
export class IconToolbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isActive: false };
        this.handleToggleActive = this.handleToggleActive.bind(this);
    }

    // eslint-disable-next-line no-unused-vars
    handleToggleActive(e) {
        const { isActive } = this.state;
        this.setState({ isActive: !isActive });
    }

    render() {
        const { className, children, isHidden, title } = this.props;
        const { isActive } = this.state;
        return (
            <div className={setClass(className, { hidden: isHidden })} data-name={title}>
                <RoundIconButton
                    tooltipPlacement="top"
                    title={title}
                    onClick={this.handleToggleActive}
                >
                    {isActive ? <Close /> : <this.props.iconComponent />}
                </RoundIconButton>

                {children.map((el, idx) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <ShowIf condition={isActive} key={idx}>
                        {el}
                    </ShowIf>
                ))}
            </div>
        );
    }
}

IconToolbar.propTypes = {
    title: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types, react/forbid-prop-types
    iconComponent: PropTypes.func.isRequired,
    isHidden: PropTypes.bool.isRequired,
    className: PropTypes.string.isRequired,
    children: PropTypes.node,
};

IconToolbar.defaultProps = {
    children: [],
};
