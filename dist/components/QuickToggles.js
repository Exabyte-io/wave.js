import { jsx as _jsx } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { COARSE_POINTER_QUERY, TOUCH_TARGET_MIN_PX } from "../utils/inputCapabilities";
function QuickToggles({ items = [] }) {
    if (!items.length)
        return null;
    return (_jsx(Stack, { "data-name": "QuickToggles", direction: "row", justifyContent: "center", sx: {
            position: "absolute",
            left: 0,
            right: 0,
            // Clears the status bar; the edit surface above is top-aligned, so nothing overlaps.
            bottom: "3em",
            pointerEvents: "none",
            zIndex: 1,
        }, children: _jsx(Paper, { elevation: 2, sx: {
                pointerEvents: "auto",
                borderRadius: "20px",
                px: 0.75,
                py: 0.5,
                boxShadow: 4,
            }, children: _jsx(Stack, { direction: "row", spacing: 0.5, children: items.map((item) => (_jsx(Tooltip, { title: item.hotKey
                        ? `${item.title} [${item.hotKey.toUpperCase()}]`
                        : item.title, disableInteractive: true, children: _jsx(Box, { component: "button", type: "button", "aria-pressed": Boolean(item.isActive), "aria-label": item.title, "data-name": `QuickToggle-${item.id}`, "data-active": item.isActive ? "true" : "false", onClick: item.onToggle, sx: {
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            p: 0,
                            borderRadius: "16px",
                            // Grown to the touch minimum on coarse pointers only (U-13): a
                            // 32 px circle is a comfortable mouse target and an unreliable
                            // finger one, and this row is the primary control surface on a
                            // phone, where the toolbar menus are the awkward path.
                            [`@media ${COARSE_POINTER_QUERY}`]: {
                                width: TOUCH_TARGET_MIN_PX,
                                height: TOUCH_TARGET_MIN_PX,
                                borderRadius: `${TOUCH_TARGET_MIN_PX / 2}px`,
                                "& svg": { fontSize: "1.35rem" },
                            },
                            cursor: "pointer",
                            border: 1,
                            borderColor: item.isActive ? "primary.light" : "divider",
                            backgroundColor: item.isActive ? "primary.main" : "transparent",
                            color: item.isActive
                                ? "primary.contrastText"
                                : "text.secondary",
                            "& svg": { fontSize: "1.1rem" },
                            "&:hover": {
                                borderColor: "primary.light",
                            },
                            "&:focus-visible": {
                                outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                                outlineOffset: "2px",
                            },
                        }, children: item.icon }) }, item.id))) }) }) }));
}
export default QuickToggles;
