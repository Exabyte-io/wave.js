import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";

import { hasCoarsePointer } from "../utils/inputCapabilities";
import { getGroupedKeyBindings, getModifierLabel } from "../utils/keyBindings";

/**
 * The keyboard sheet. Every row is generated from settings (hotKeysConfig and editorKeysConfig)
 * plus the pointer gestures, so rebinding a key updates the sheet with it - see
 * utils/keyBindings.ts for why that matters (finding F3, defect D2).
 */

export interface KeyboardSheetProps {
    isOpen?: boolean;
    onClose?: () => void;
    /** Mirrors ThreeDEditor's prop: without it the edit bindings do not exist to advertise. */
    editable?: boolean;
    /**
     * Whether to list the touch gestures (U-13). Defaults to whether the device can produce touch
     * input at all - see getKeyBindings - and is a prop so a test can assert both shapes.
     */
    includeTouch?: boolean;
    /**
     * Whether the primary pointer is coarse. Decides the group order (touch first where touch is how
     * the viewer is driven) and suppresses the key-based close hint. A prop so a test can assert both.
     */
    isCoarsePointer?: boolean;
}

function KeyRow({ label, keys }: { label: string; keys: string }) {
    return (
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="baseline">
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Box
                component="kbd"
                sx={{
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    whiteSpace: "nowrap",
                    color: "text.primary",
                }}
            >
                {keys}
            </Box>
        </Stack>
    );
}

function KeyboardSheet(props: KeyboardSheetProps) {
    const { isOpen = false, onClose, editable = true, includeTouch, isCoarsePointer } = props;
    const isCoarse = isCoarsePointer ?? hasCoarsePointer();
    const sections = getGroupedKeyBindings({ editable, includeTouch, touchFirst: isCoarse });

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            aria-labelledby="keyboard-sheet-title"
            data-name="KeyboardSheet"
        >
            <DialogTitle id="keyboard-sheet-title" sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                    <Typography variant="h6" component="span">
                        {/* Not "Keyboard shortcuts": the sheet has always listed pointer gestures
                            too, and on a touch device the keyboard is the part that may not exist. */}
                        Shortcuts &amp; gestures
                    </Typography>
                    {!isCoarse && (
                        <Typography variant="caption" color="text.secondary">
                            ? or Esc to close
                        </Typography>
                    )}
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        display: "grid",
                        // A grid rather than a row of columns: the touch group (U-13) makes four,
                        // and four fixed columns crush the labels on the narrow screens that group
                        // exists for. auto-fit reflows to one column on a phone by itself.
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(auto-fit, minmax(190px, 1fr))",
                        },
                        columnGap: 4,
                        rowGap: 2.5,
                        alignItems: "start",
                    }}
                >
                    {sections.map((section) => (
                        <Stack
                            key={section.group}
                            spacing={0.75}
                            sx={{ minWidth: 0, width: "100%" }}
                            data-name={`KeyboardSheetGroup-${section.group}`}
                        >
                            <Typography
                                variant="caption"
                                fontWeight="bold"
                                color="primary.main"
                                sx={{ letterSpacing: "0.06em", textTransform: "uppercase" }}
                            >
                                {section.label}
                            </Typography>
                            {section.bindings.map((binding) => (
                                <KeyRow
                                    key={`${binding.label}-${binding.keys}`}
                                    label={binding.label}
                                    keys={binding.keys}
                                />
                            ))}
                        </Stack>
                    ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                    {`The modifier resolves per platform — Ctrl on Windows and Linux, Cmd on macOS; shown above as ${getModifierLabel()}. Edit mode and the measurement modes are mutually exclusive: arming a measurement leaves edit mode, and entering edit mode clears measurements.`}
                </Typography>
            </DialogContent>
            {/* An explicit Close, because the only way out used to be `?`, Escape, or knowing that
                tapping the backdrop dismisses a dialog - none of which is available or discoverable
                on a phone (U-13). */}
            <DialogActions>
                <Button onClick={onClose} data-name="KeyboardSheetClose">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default KeyboardSheet;
