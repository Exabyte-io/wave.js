import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import CenterFocusStrong from "@mui/icons-material/CenterFocusStrong";
import ContentCopy from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenWith from "@mui/icons-material/OpenWith";
import Redo from "@mui/icons-material/Redo";
import RotateRight from "@mui/icons-material/RotateRight";
import Undo from "@mui/icons-material/Undo";
import ButtonGroup from "@mui/material/ButtonGroup";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import settings from "../settings";
import SquareIconButton from "./SquareIconButton";
function EditToolbar(props) {
    const { activeTransformMode = "translate", selectedCount = 0, defaultElement = "Si", canUndo = false, canRedo = false, onSetTransformMode, onAddAtom, onCloneSelected, onRemoveSelected, onFocusCamera, onUndo, onRedo, } = props;
    const hasSelection = selectedCount > 0;
    // Rotating a single sphere about its own centre changes nothing structurally (D4), so rotate
    // only means something for a group about its centroid.
    const canRotate = selectedCount > 1;
    const isGroup = selectedCount > 1;
    return (_jsx(Paper, { elevation: 2, "data-name": "EditToolbar", sx: { boxShadow: 4 }, children: _jsxs(Stack, { alignItems: "center", padding: 0.5, spacing: 0.5, children: [_jsxs(ButtonGroup, { orientation: "vertical", variant: "outlined", color: "inherit", children: [_jsx(SquareIconButton, { title: "Translate Mode", onClick: () => onSetTransformMode === null || onSetTransformMode === void 0 ? void 0 : onSetTransformMode("translate"), children: _jsx(OpenWith, { color: activeTransformMode === "translate" ? "primary" : "inherit" }) }), _jsx(SquareIconButton, { title: canRotate ? "Rotate Mode" : "Select 2+ atoms to rotate as a group", disabled: !canRotate, onClick: () => onSetTransformMode === null || onSetTransformMode === void 0 ? void 0 : onSetTransformMode("rotate"), children: _jsx(RotateRight, { color: activeTransformMode === "rotate" ? "primary" : "inherit" }) })] }), _jsxs(ButtonGroup, { orientation: "vertical", variant: "outlined", color: "inherit", children: [_jsx(SquareIconButton, { title: `Add Atom (${defaultElement})`, onClick: () => onAddAtom === null || onAddAtom === void 0 ? void 0 : onAddAtom(), children: _jsx(AddCircleOutline, {}) }), _jsx(SquareIconButton, { title: isGroup
                                ? `Clone ${selectedCount} Selected Atoms`
                                : "Clone Selected Atom", disabled: !hasSelection, onClick: () => onCloneSelected === null || onCloneSelected === void 0 ? void 0 : onCloneSelected(), children: _jsx(ContentCopy, {}) }), _jsx(SquareIconButton, { title: isGroup
                                ? `Delete ${selectedCount} Selected Atoms`
                                : "Delete Selected Atom", disabled: !hasSelection, onClick: () => onRemoveSelected === null || onRemoveSelected === void 0 ? void 0 : onRemoveSelected(), children: _jsx(DeleteIcon, {}) })] }), _jsxs(ButtonGroup, { orientation: "vertical", variant: "outlined", color: "inherit", children: [_jsx(SquareIconButton, { title: `Focus Camera on Selection [${settings.hotKeysConfig.focusCameraOnSelection.toUpperCase()}]`, disabled: !hasSelection, onClick: () => onFocusCamera === null || onFocusCamera === void 0 ? void 0 : onFocusCamera(), children: _jsx(CenterFocusStrong, {}) }), _jsx(SquareIconButton, { title: "Undo", disabled: !canUndo, onClick: () => onUndo === null || onUndo === void 0 ? void 0 : onUndo(), children: _jsx(Undo, {}) }), _jsx(SquareIconButton, { title: "Redo", disabled: !canRedo, onClick: () => onRedo === null || onRedo === void 0 ? void 0 : onRedo(), children: _jsx(Redo, {}) })] })] }) }));
}
export default EditToolbar;
