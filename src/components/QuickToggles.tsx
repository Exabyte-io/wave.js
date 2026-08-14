import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import React from "react";

import { COARSE_POINTER_QUERY, TOUCH_TARGET_MIN_PX } from "../utils/inputCapabilities";

/**
 * The handful of view toggles worth reaching in one click.
 *
 * Bonds, labels, axes and the camera projection all live inside the View dropdown, which closes on
 * every choice - so flipping bonds while comparing two structures is a four-click round trip
 * through a menu that shuts behind you. These are the items people toggle repeatedly rather than
 * set once, promoted out of the menu (U-7). The menu keeps them too; this is a shortcut, not a
 * move, so nothing a user already knows stops working.
 *
 * Active state is a filled button, which is the same correction U-4 made in the menu: the previous
 * rendering used one shape - a checkmark - for both on and off, separated only by colour.
 */

export interface QuickToggleItem {
    id: string;
    /** Tooltip text; the hotkey is appended when there is one. */
    title: string;
    hotKey?: string;
    isActive?: boolean;
    icon: React.ReactNode;
    onToggle: () => void;
}

export interface QuickTogglesProps {
    items?: QuickToggleItem[];
}

function QuickToggles({ items = [] }: QuickTogglesProps) {
    if (!items.length) return null;

    return (
        <Stack
            data-name="QuickToggles"
            direction="row"
            justifyContent="center"
            sx={{
                position: "absolute",
                left: 0,
                right: 0,
                // Clears the status bar; the edit surface above is top-aligned, so nothing overlaps.
                bottom: "3em",
                pointerEvents: "none",
                zIndex: 1,
            }}
        >
            <Paper
                elevation={2}
                sx={{
                    pointerEvents: "auto",
                    borderRadius: "20px",
                    px: 0.75,
                    py: 0.5,
                    boxShadow: 4,
                }}
            >
                <Stack direction="row" spacing={0.5}>
                    {items.map((item) => (
                        <Tooltip
                            key={item.id}
                            title={
                                item.hotKey
                                    ? `${item.title} [${item.hotKey.toUpperCase()}]`
                                    : item.title
                            }
                            disableInteractive
                        >
                            <Box
                                component="button"
                                type="button"
                                aria-pressed={Boolean(item.isActive)}
                                aria-label={item.title}
                                data-name={`QuickToggle-${item.id}`}
                                data-active={item.isActive ? "true" : "false"}
                                onClick={item.onToggle}
                                sx={{
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
                                        outline: (theme) =>
                                            `2px solid ${theme.palette.primary.main}`,
                                        outlineOffset: "2px",
                                    },
                                }}
                            >
                                {item.icon}
                            </Box>
                        </Tooltip>
                    ))}
                </Stack>
            </Paper>
        </Stack>
    );
}

export default QuickToggles;
