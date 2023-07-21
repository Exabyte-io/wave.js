import React, { useState, useEffect, FC } from 'react';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import _ from "lodash";

interface SquareIconButtonProps {
    title: string;
    id?: string;
    label?: string;
    onClick: (...args: any[]) => void;
    tooltipPlacement?: string;
    isToggleable?: boolean;
    isToggled?: boolean;
}

// Should be imported from theme
const defaultIconButtonStyle = {
    size: "large",
    borderRadius: "0",
};

/**
 * Round icon button with toggle logic
 */
function SquareIconButton ({
                                                                title,
                                                                id,
                                                                label,
                                                                onClick,
                                                                tooltipPlacement = "top",
                                                                isToggleable = true,
                                                                isToggled = false,
                                                            }: SquareIconButtonProps)  {
    const [stateIsToggled, setStateIsToggled] = useState(isToggled);

    useEffect(() => {
        setStateIsToggled(isToggled);
    }, [isToggled]);

    const handleToggle = () => {
        setStateIsToggled(prevState => !prevState);
    };

    return (
        <Tooltip
            id={id}
            title={title.toUpperCase()}
            placement={tooltipPlacement}
            disableInteractive
        >
            <IconButton
                aria-checked={isToggleable && stateIsToggled}
                aria-label={label || title.toLowerCase()}
                onClick={(...args) => {
                    onClick(...args);
                    handleToggle();
                }}
                sx={defaultIconButtonStyle}
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
                size="large"
            />
        </Tooltip>
    );
}
