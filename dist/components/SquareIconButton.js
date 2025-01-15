import { jsx as _jsx } from "react/jsx-runtime";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import _ from "underscore";
/**
 * Square icon button with toggle logic
 */
function SquareIconButton(props) {
    const { title, id, label, onClick, tooltipPlacement = "top" } = props;
    const defaultIconButtonStyle = {
        borderRadius: 0,
    };
    return (_jsx(Tooltip, { id: id, title: title, placement: tooltipPlacement, disableInteractive: true, children: _jsx(IconButton, { disableFocusRipple: true, disableTouchRipple: true, size: "large", "aria-label": label || title.toLowerCase(), onClick: onClick, sx: defaultIconButtonStyle, ..._.omit(props, "title", "tooltipPlacement", "id", "label", "onClick", "isToggleable", "isToggled") }, id) }));
}
export default SquareIconButton;
