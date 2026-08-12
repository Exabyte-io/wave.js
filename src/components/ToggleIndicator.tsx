import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

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
 */

export interface ToggleIndicatorProps {
    isActive?: boolean;
    /** Single-character hotkey from `settings.hotKeysConfig`, if the item has one. */
    hotKey?: string;
}

function ToggleIndicator({ isActive = false, hotKey }: ToggleIndicatorProps) {
    const theme = useTheme();

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            data-name="ToggleIndicator"
            data-active={isActive ? "true" : "false"}
        >
            {hotKey && (
                <Box
                    component="kbd"
                    data-name="ToggleIndicatorKey"
                    sx={{
                        fontFamily: "monospace",
                        fontSize: "0.68rem",
                        lineHeight: 1.5,
                        minWidth: "1.15rem",
                        textAlign: "center",
                        px: 0.4,
                        borderRadius: "3px",
                        border: `1px solid ${theme.palette.divider}`,
                        color: theme.palette.text.secondary,
                    }}
                >
                    {hotKey.toUpperCase()}
                </Box>
            )}

            {/* Decorative: the row that contains this is the control. */}
            <Box
                aria-hidden="true"
                sx={{
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
                }}
            >
                <Box
                    sx={{
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
                    }}
                />
            </Box>

            {/* The state in words, for anyone not reading the switch. */}
            <Typography
                variant="caption"
                sx={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    overflow: "hidden",
                    clip: "rect(0 0 0 0)",
                    whiteSpace: "nowrap",
                }}
            >
                {isActive ? "on" : "off"}
            </Typography>
        </Stack>
    );
}

export default ToggleIndicator;
