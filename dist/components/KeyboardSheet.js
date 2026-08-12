import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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
    const { isOpen = false, onClose, editable = true } = props;
    const sections = getGroupedKeyBindings({ editable });
    return (_jsxs(Dialog, { open: isOpen, onClose: onClose, maxWidth: "md", fullWidth: true, "aria-labelledby": "keyboard-sheet-title", "data-name": "KeyboardSheet", children: [_jsx(DialogTitle, { id: "keyboard-sheet-title", sx: { pb: 1 }, children: _jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "baseline", children: [_jsx(Typography, { variant: "h6", component: "span", children: "Keyboard shortcuts" }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: "? or Esc to close" })] }) }), _jsxs(DialogContent, { children: [_jsx(Stack, { direction: { xs: "column", sm: "row" }, spacing: 4, divider: _jsx(Divider, { orientation: "vertical", flexItem: true }), alignItems: "flex-start", children: sections.map((section) => (_jsxs(Stack, { spacing: 0.75, sx: { flex: 1, minWidth: 0, width: "100%" }, "data-name": `KeyboardSheetGroup-${section.group}`, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "primary.main", sx: { letterSpacing: "0.06em", textTransform: "uppercase" }, children: section.label }), section.bindings.map((binding) => (_jsx(KeyRow, { label: binding.label, keys: binding.keys }, `${binding.label}-${binding.keys}`)))] }, section.group))) }), _jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: `The modifier resolves per platform — Ctrl on Windows and Linux, Cmd on macOS; shown above as ${getModifierLabel()}. Edit mode and the measurement modes are mutually exclusive: arming a measurement leaves edit mode, and entering edit mode clears measurements.` })] })] }));
}
export default KeyboardSheet;
