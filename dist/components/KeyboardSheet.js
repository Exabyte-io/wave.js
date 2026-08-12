import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { hasCoarsePointer } from "../utils/inputCapabilities";
import { getGroupedKeyBindings, getModifierLabel } from "../utils/keyBindings";
function KeyRow({ label, keys }) {
    return (_jsxs(Stack, { direction: "row", spacing: 2, justifyContent: "space-between", alignItems: "baseline", children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: label }), _jsx(Box, { component: "kbd", sx: {
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    whiteSpace: "nowrap",
                    color: "text.primary",
                }, children: keys })] }));
}
function KeyboardSheet(props) {
    const { isOpen = false, onClose, editable = true, includeTouch, isCoarsePointer } = props;
    const isCoarse = isCoarsePointer !== null && isCoarsePointer !== void 0 ? isCoarsePointer : hasCoarsePointer();
    const sections = getGroupedKeyBindings({ editable, includeTouch, touchFirst: isCoarse });
    return (_jsxs(Dialog, { open: isOpen, onClose: onClose, maxWidth: "md", fullWidth: true, "aria-labelledby": "keyboard-sheet-title", "data-name": "KeyboardSheet", children: [_jsx(DialogTitle, { id: "keyboard-sheet-title", sx: { pb: 1 }, children: _jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "baseline", children: [_jsx(Typography, { variant: "h6", component: "span", children: "Shortcuts & gestures" }), !isCoarse && (_jsx(Typography, { variant: "caption", color: "text.secondary", children: "? or Esc to close" }))] }) }), _jsxs(DialogContent, { children: [_jsx(Box, { sx: {
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
                        }, children: sections.map((section) => (_jsxs(Stack, { spacing: 0.75, sx: { minWidth: 0, width: "100%" }, "data-name": `KeyboardSheetGroup-${section.group}`, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "primary.main", sx: { letterSpacing: "0.06em", textTransform: "uppercase" }, children: section.label }), section.bindings.map((binding) => (_jsx(KeyRow, { label: binding.label, keys: binding.keys }, `${binding.label}-${binding.keys}`)))] }, section.group))) }), _jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: `The modifier resolves per platform — Ctrl on Windows and Linux, Cmd on macOS; shown above as ${getModifierLabel()}. Edit mode and the measurement modes are mutually exclusive: arming a measurement leaves edit mode, and entering edit mode clears measurements.` })] }), _jsx(DialogActions, { children: _jsx(Button, { onClick: onClose, "data-name": "KeyboardSheetClose", children: "Close" }) })] }));
}
export default KeyboardSheet;
