import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import setClass from "classnames";
import PropTypes from "prop-types";
import React from "react";

/**
 * Toolbar Menu that can be opened and closed
 */
// eslint-disable-next-line react/prefer-stateless-function
export class ToolbarMenu extends React.Component {
    // eslint-disable-next-line no-useless-constructor
    constructor(props) {
        super(props);
        // this.state = { isActive: false };
    }

    render() {
        const { className, children, isHidden, title } = this.props;

        return (
            <div className={setClass(className, { hidden: isHidden })} data-name={title}>
                <Paper
                    sx={{
                        width: "300px",
                        height: "50px",
                        display: "flex",
                        flexDirection: "column",
                        marginLeft: "60px",
                    }}
                >
                    <MenuList>
                        <MenuItem disabled>{title}</MenuItem>
                        {children.map((el, idx) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <MenuItem key={idx}>{el}</MenuItem>
                        ))}
                    </MenuList>
                </Paper>
            </div>
        );
    }
}

ToolbarMenu.propTypes = {
    title: PropTypes.string.isRequired,
    isHidden: PropTypes.bool.isRequired,
    className: PropTypes.string.isRequired,
    children: PropTypes.node,
};

ToolbarMenu.defaultProps = {
    children: [],
};
