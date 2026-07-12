import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";
import React from "react";
import _ from "underscore";

interface SquareIconButtonProps extends IconButtonProps {
    title: string;
    id?: string;
    label?: string;
    onClick: (...args: React.MouseEvent[]) => void;
    tooltipPlacement?: TooltipProps["placement"];
    isToggleable?: boolean;
}

/**
 * Square icon button with toggle logic
 */
function SquareIconButton(props: SquareIconButtonProps) {
    const { title, id, label, onClick, tooltipPlacement = "top", disabled } = props;

    const defaultIconButtonStyle = {
        borderRadius: 0,
    };

    const iconButton = (
        <IconButton
            disableFocusRipple
            disableTouchRipple
            size="large"
            key={id}
            aria-label={label || title.toLowerCase()}
            onClick={onClick}
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
    );

    return (
        <Tooltip id={id} title={title} placement={tooltipPlacement} disableInteractive>
            {/* Tooltip needs a listenable child: a disabled button doesn't fire events, so
                give it a wrapping span to hover/focus on instead (MUI's documented fix). */}
            {disabled ? <span>{iconButton}</span> : iconButton}
        </Tooltip>
    );
}

export default SquareIconButton;
