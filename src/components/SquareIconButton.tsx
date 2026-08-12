import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";
import React from "react";

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
    const { title, id, label, onClick, tooltipPlacement = "top", disabled } = props;
    // Everything this component consumes itself is stripped out; the remainder - `disabled`
    // included, which is read above but still forwarded - passes through to IconButton.
    const {
        title: consumedTitle,
        tooltipPlacement: consumedTooltipPlacement,
        id: consumedId,
        label: consumedLabel,
        onClick: consumedOnClick,
        isToggleable,
        isToggled,
        ...iconButtonProps
    } = props;

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
            {...iconButtonProps}
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
