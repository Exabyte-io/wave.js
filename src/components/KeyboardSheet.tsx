import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";

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
    const { isOpen = false, onClose, editable = true } = props;
    const sections = getGroupedKeyBindings({ editable });

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
                        Keyboard shortcuts
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ? or Esc to close
                    </Typography>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={4}
                    divider={<Divider orientation="vertical" flexItem />}
                    alignItems="flex-start"
                >
                    {sections.map((section) => (
                        <Stack
                            key={section.group}
                            spacing={0.75}
                            sx={{ flex: 1, minWidth: 0, width: "100%" }}
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
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                    {`The modifier resolves per platform — Ctrl on Windows and Linux, Cmd on macOS; shown above as ${getModifierLabel()}. Edit mode and the measurement modes are mutually exclusive: arming a measurement leaves edit mode, and entering edit mode clears measurements.`}
                </Typography>
            </DialogContent>
        </Dialog>
    );
}

export default KeyboardSheet;
