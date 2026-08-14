import { jsx as _jsx } from "react/jsx-runtime";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
/**
 * Square icon button with toggle logic
 */
function SquareIconButton(props) {
    const { title, id, label, onClick, tooltipPlacement = "top", disabled } = props;
    // Everything this component consumes itself is stripped out; the remainder - `disabled`
    // included, which is read above but still forwarded - passes through to IconButton.
    const { title: consumedTitle, tooltipPlacement: consumedTooltipPlacement, id: consumedId, label: consumedLabel, onClick: consumedOnClick, isToggleable, isToggled, sx: callerSx, ...iconButtonProps } = props;
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
            outline: (theme) => `2px solid ${theme.palette.primary.main}`,
            outlineOffset: "-2px",
        },
    };
    const iconButton = (_jsx(IconButton, { disableFocusRipple: true, disableTouchRipple: true, size: "large", "aria-label": label || title.toLowerCase(), onClick: onClick, 
        // Caller styles merge on top rather than replacing the defaults: passing `sx` used to
        // drop borderRadius (and now the focus ring) entirely, since the spread came after it.
        sx: [defaultIconButtonStyle, ...(Array.isArray(callerSx) ? callerSx : [callerSx])], ...iconButtonProps }, id));
    return (_jsx(Tooltip, { id: id, title: title, placement: tooltipPlacement, disableInteractive: true, children: disabled ? _jsx("span", { children: iconButton }) : iconButton }));
}
export default SquareIconButton;
