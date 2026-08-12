import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
function ToggleIndicator({ isActive = false, hotKey }) {
    const theme = useTheme();
    return (_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, "data-name": "ToggleIndicator", "data-active": isActive ? "true" : "false", children: [hotKey && (_jsx(Box, { component: "kbd", "data-name": "ToggleIndicatorKey", sx: {
                    fontFamily: "monospace",
                    fontSize: "0.68rem",
                    lineHeight: 1.5,
                    minWidth: "1.15rem",
                    textAlign: "center",
                    px: 0.4,
                    borderRadius: "3px",
                    border: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.secondary,
                }, children: hotKey.toUpperCase() })), _jsx(Box, { "aria-hidden": "true", sx: {
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
