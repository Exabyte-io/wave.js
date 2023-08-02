import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
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
    const theme = useTheme();

    const defaultIconButtonStyle = {
        borderRadius: 0,
        fontSize: theme.typography.h2.fontSize,
        height: theme.spacing(6),
        width: theme.spacing(6),
        backgroundColor: theme.palette.background.paper,
    };

    useEffect(() => {
        setStateIsToggled(isToggled);
    }, [isToggled]);

    const handleToggle = () => {
        setStateIsToggled((prevState) => !prevState);
    };

    return (
        <Tooltip
            id={id}
            title={title.toUpperCase()}
            placement={tooltipPlacement}
            disableInteractive
        >
            <IconButton
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
