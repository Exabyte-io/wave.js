import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
/**
 * The on/off state of a menu toggle, plus its hotkey.
 *
 * This replaces `getCheckmark`, which drew every inactive item as a *grey checkmark* (finding
 * F2). A grey ✓ reads as "checked but disabled", not "off" - the one shape that means "yes" was
 * carrying both answers, separated only by colour, which also made the state invisible to anyone
 * who cannot compare two greens.
 *
 * A switch has exactly one reading. It is drawn rather than built from MUI's `Switch` on purpose:
 * the menu row is already the control, and nesting a real form control inside it would put a
 * second focusable, separately-clickable target in the same row. This is decorative, with the
 * state exposed as text for screen readers instead.
 *
 * The hotkey moves out of the label into a fixed slot next to it (F3). Spelled inside the label,
 * some rows read "Bonds [B]" and others just "Axes", and nothing keeps that consistent.
 *
 * That slot is *always* rendered, and the whole indicator is a fixed width. Omitting the keycap on
 * rows without a hotkey let each row size itself, so the switches landed at slightly different
 * offsets down the View menu - close enough to look like a rendering fault rather than a layout one.
 * A menu of toggles reads as a column, and a column has to line up.
 */
/** Keycap slot width. Fixed, so a row without a hotkey still reserves it. */
const KEY_SLOT_WIDTH = "1.35rem";
function ToggleIndicator({ isActive = false, hotKey }) {
    const theme = useTheme();
    return (_jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "flex-end", spacing: 1, "data-name": "ToggleIndicator", "data-active": isActive ? "true" : "false", children: [_jsx(Box, { component: "kbd", "data-name": "ToggleIndicatorKey", "aria-hidden": hotKey ? undefined : true, sx: {
                    fontFamily: "monospace",
                    fontSize: "0.68rem",
                    lineHeight: 1.5,
                    width: KEY_SLOT_WIDTH,
                    flexShrink: 0,
                    textAlign: "center",
                    borderRadius: "3px",
                    border: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.secondary,
                    visibility: hotKey ? "visible" : "hidden",
                }, children: hotKey ? hotKey.toUpperCase() : "" }), _jsx(Box, { "aria-hidden": "true", "data-name": "ToggleIndicatorSwitch", sx: {
                    position: "relative",
                    width: 28,
                    height: 14,
                    borderRadius: "7px",
                    flexShrink: 0,
                    backgroundColor: isActive
                        ? theme.palette.primary.main
                        : theme.palette.action.disabled,
                    transition: theme.transitions.create("background-color", {
                        duration: theme.transitions.duration.shortest,
                    }),
                }, children: _jsx(Box, { sx: {
                        position: "absolute",
                        top: 2,
                        left: isActive ? 16 : 2,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: theme.palette.common.white,
                        transition: theme.transitions.create("left", {
                            duration: theme.transitions.duration.shortest,
                        }),
                    } }) }), _jsx(Typography, { variant: "caption", sx: {
                    position: "absolute",
                    width: 1,
                    height: 1,
                    overflow: "hidden",
                    clip: "rect(0 0 0 0)",
                    whiteSpace: "nowrap",
                }, children: isActive ? "on" : "off" })] }));
}
export default ToggleIndicator;
