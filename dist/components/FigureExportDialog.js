import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { describeFigureResolution, FIGURE_BACKGROUNDS, FIGURE_SIZE_PRESETS, getFigureBackground, getFigureResolution, getFigureSizePreset, } from "../utils/figureExport";
function FigureExportDialog(props) {
    const { isOpen = false, onClose, onExport, viewportWidth = 0, viewportHeight = 0, maxDimension, isCameraOrthographic = false, } = props;
    const [presetId, setPresetId] = useState("double-column");
    const [backgroundId, setBackgroundId] = useState("white");
    const [includeScaleBar, setIncludeScaleBar] = useState(true);
    const [customWidth, setCustomWidth] = useState("1600");
    const [customHeight, setCustomHeight] = useState("1200");
    const resolution = useMemo(() => getFigureResolution({
        presetId,
        customWidth: Number(customWidth),
        customHeight: Number(customHeight),
        viewportWidth,
        viewportHeight,
        maxDimension,
    }), [presetId, customWidth, customHeight, viewportWidth, viewportHeight, maxDimension]);
    const preset = getFigureSizePreset(presetId);
    const background = getFigureBackground(backgroundId);
    const handleExport = () => {
        onExport === null || onExport === void 0 ? void 0 : onExport({
            width: resolution.width,
            height: resolution.height,
            background: background.id,
            includeScaleBar,
        });
        onClose === null || onClose === void 0 ? void 0 : onClose();
    };
    return (_jsxs(Dialog, { open: isOpen, onClose: onClose, maxWidth: "sm", fullWidth: true, "aria-labelledby": "figure-export-title", "data-name": "FigureExportDialog", children: [_jsx(DialogTitle, { id: "figure-export-title", sx: { pb: 1 }, children: _jsx(Typography, { variant: "h6", component: "span", children: "Export figure" }) }), _jsx(DialogContent, { children: _jsxs(Stack, { spacing: 2.5, children: [_jsxs(Stack, { spacing: 1, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "primary.main", sx: { letterSpacing: "0.06em", textTransform: "uppercase" }, children: "Size" }), _jsx(ToggleButtonGroup, { exclusive: true, size: "small", value: presetId, 
                                    // MUI passes null when the active button is clicked again; keeping the
                                    // current value avoids a state with no size selected at all.
                                    onChange: (_event, value) => value && setPresetId(value), "aria-label": "Figure size", sx: { flexWrap: "wrap" }, children: FIGURE_SIZE_PRESETS.map((sizePreset) => (_jsx(ToggleButton, { value: sizePreset.id, "data-name": `FigureSize-${sizePreset.id}`, title: sizePreset.hint, children: sizePreset.label }, sizePreset.id))) }), preset.id === "custom" ? (_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(TextField, { size: "small", type: "number", label: "Width", value: customWidth, onChange: (event) => setCustomWidth(event.target.value), inputProps: { "data-name": "FigureCustomWidth", min: 64 }, sx: { width: "8em" } }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "\u00D7" }), _jsx(TextField, { size: "small", type: "number", label: "Height", value: customHeight, onChange: (event) => setCustomHeight(event.target.value), inputProps: { "data-name": "FigureCustomHeight", min: 64 }, sx: { width: "8em" } })] })) : (_jsxs(Typography, { variant: "caption", color: "text.secondary", children: [preset.hint, " Height follows the canvas aspect ratio, so nothing is stretched."] })), _jsx(Typography, { variant: "body2", "data-name": "FigureResolutionSummary", sx: { fontFamily: "monospace" }, children: describeFigureResolution(resolution) }), resolution.isClamped && (_jsx(Alert, { severity: "info", "data-name": "FigureClampedNotice", children: "Scaled down to what this graphics context can render in one pass." }))] }), _jsxs(Stack, { spacing: 0.5, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "primary.main", sx: { letterSpacing: "0.06em", textTransform: "uppercase" }, children: "Background" }), _jsx(RadioGroup, { value: background.id, onChange: (event) => setBackgroundId(event.target.value), children: FIGURE_BACKGROUNDS.map((option) => (_jsx(FormControlLabel, { value: option.id, control: _jsx(Radio, { size: "small", inputProps: {
                                                "data-name": `FigureBackground-${option.id}`,
                                            } }), label: _jsxs(Stack, { children: [_jsx(Typography, { variant: "body2", children: option.label }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: option.hint })] }), sx: { alignItems: "flex-start", mb: 0.5 } }, option.id))) })] }), _jsxs(Stack, { spacing: 0.5, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { size: "small", checked: includeScaleBar, onChange: (event) => setIncludeScaleBar(event.target.checked), inputProps: {
                                            "data-name": "FigureScaleBarToggle",
                                        } }), label: _jsx(Typography, { variant: "body2", children: "Scale bar" }) }), includeScaleBar && !isCameraOrthographic && (_jsx(Alert, { severity: "warning", "data-name": "FigureScaleBarPerspectiveNotice", children: "A perspective projection has no single scale: the bar is exact only in the plane through the pivot point. Switch to the orthographic camera for a strictly correct bar." }))] })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: onClose, "data-name": "FigureExportCancel", children: "Cancel" }), _jsx(Button, { variant: "contained", onClick: handleExport, "data-name": "FigureExportConfirm", children: "Export PNG" })] })] }));
}
export default FigureExportDialog;
