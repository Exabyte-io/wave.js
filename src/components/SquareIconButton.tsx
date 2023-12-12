import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";
import React, { useEffect, useState } from "react";
import _ from "underscore";

interface SquareIconButtonProps extends IconButtonProps {
    title: string;
    id?: string;
    label?: string;
    onClick: (...args: React.MouseEvent[]) => void;
    tooltipPlacement?: TooltipProps["placement"];
    isToggleable?: boolean;
    isToggled?: boolean;
}

/**
 * Square icon button with toggle logic
 */
function SquareIconButton(props: SquareIconButtonProps) {
    const {
        title,
        id,
        label,
        onClick,
        tooltipPlacement = "top",
        isToggleable = true,
        isToggled = false,
    } = props;
    const [stateIsToggled, setStateIsToggled] = useState(isToggled);

    const defaultIconButtonStyle = {
        borderRadius: 0,
    };

    useEffect(() => {
        setStateIsToggled(isToggled);
    }, [isToggled]);

    const handleToggle = () => {
        setStateIsToggled((prevState) => !prevState);
    };

    return (
        <Tooltip id={id} title={title} placement={tooltipPlacement} disableInteractive>
            <IconButton
                disableFocusRipple
                disableTouchRipple
                size="large"
                key={id}
                aria-checked={isToggleable && stateIsToggled}
                aria-label={label || title.toLowerCase()}
                onClick={(...args) => {
                    onClick(...args);
                    handleToggle();
                }}
                sx={defaultIconButtonStyle}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {..._.omit(
                    props,
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

export default SquareIconButton;
