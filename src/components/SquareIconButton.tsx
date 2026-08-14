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
        sx: callerSx,
        ...iconButtonProps
    } = props;

    /**
     * `disableFocusRipple` removes MUI's only focus affordance, and neither MUI nor the browser
     * leaves an outline on a ButtonBase - measured on the running app, a keyboard-focused toolbar
     * button had `outline: none`, `box-shadow: none` and a transparent background, so focus was
     * completely invisible (finding F9). The ripple is a poor focus indicator anyway (it fades),
     * so it stays disabled and an explicit ring takes its place.
     *
     * `:focus-visible` rather than `:focus`, so a mouse click does not leave a ring behind.
     */
    const defaultIconButtonStyle = {
        borderRadius: 0,
        "&:focus-visible": {
            outline: (theme: { palette: { primary: { main: string } } }) =>
                `2px solid ${theme.palette.primary.main}`,
            outlineOffset: "-2px",
        },
    };

    const iconButton = (
        <IconButton
            disableFocusRipple
            disableTouchRipple
            size="large"
            key={id}
            aria-label={label || title.toLowerCase()}
            onClick={onClick}
            // Caller styles merge on top rather than replacing the defaults: passing `sx` used to
            // drop borderRadius (and now the focus ring) entirely, since the spread came after it.
            sx={[defaultIconButtonStyle, ...(Array.isArray(callerSx) ? callerSx : [callerSx])]}
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
