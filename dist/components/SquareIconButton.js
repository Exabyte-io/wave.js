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
    const { title: consumedTitle, tooltipPlacement: consumedTooltipPlacement, id: consumedId, label: consumedLabel, onClick: consumedOnClick, isToggleable, isToggled, ...iconButtonProps } = props;
    const defaultIconButtonStyle = {
        borderRadius: 0,
    };
    const iconButton = (_jsx(IconButton, { disableFocusRipple: true, disableTouchRipple: true, size: "large", "aria-label": label || title.toLowerCase(), onClick: onClick, sx: defaultIconButtonStyle, ...iconButtonProps }, id));
    return (_jsx(Tooltip, { id: id, title: title, placement: tooltipPlacement, disableInteractive: true, children: disabled ? _jsx("span", { children: iconButton }) : iconButton }));
}
export default SquareIconButton;
