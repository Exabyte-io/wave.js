import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import settings from "../settings";
const REPETITION_AXES = ["A", "B", "C"];
const repetitionKey = (axis) => `repetitionsAlongLatticeVector${axis}`;
export const PARAMETER_RANGES = {
    // Capped at 1 rather than 10: the scale multiplies each element's van der Waals radius, so 1 is
    // already space-filling and everything above it is atoms swallowing the cell. A range whose top
    // 90% is unusable also makes the useful band - around the 0.2 default - a few pixels of travel.
    atomRadiiScale: { min: 0.1, max: 1, step: 0.05 },
    chemicalConnectivityFactor: { min: 0, max: 2, step: 0.01 },
    repetitions: { min: 1, max: 10, step: 1 },
};
/** Defaults come from settings, so "reset" cannot drift from what the viewer actually starts with. */
export function getParameterDefaults() {
    return {
        atomRadiiScale: settings.atomRadiiScale,
        chemicalConnectivityFactor: settings.chemicalConnectivityFactor,
        repetitionsAlongLatticeVectorA: settings.repetitions,
        repetitionsAlongLatticeVectorB: settings.repetitions,
        repetitionsAlongLatticeVectorC: settings.repetitions,
    };
}
/** How many atoms a repetition actually draws - the cost the old UI never mentioned. */
export function getDrawnAtomCount(viewerSettings, atomCountInCell = 0) {
    const product = (viewerSettings.repetitionsAlongLatticeVectorA || 1) *
        (viewerSettings.repetitionsAlongLatticeVectorB || 1) *
        (viewerSettings.repetitionsAlongLatticeVectorC || 1);
    return product * atomCountInCell;
}
function clampToRange(value, { min, max }) {
    if (Number.isNaN(value))
        return min;
    return Math.min(max, Math.max(min, value));
}
function ResetButton({ title, onClick }) {
    return (_jsx(Tooltip, { title: title, disableInteractive: true, children: _jsx(IconButton, { size: "small", "aria-label": title, onClick: onClick, sx: {
                "&:focus-visible": {
                    outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: "1px",
                },
            }, children: _jsx(RestartAltIcon, { fontSize: "inherit" }) }) }));
}
function SliderRow(props) {
    const { label, settingKey, value, caption, decimals, onSettingChange } = props;
    const range = PARAMETER_RANGES[settingKey];
    return (_jsxs(Stack, { spacing: 0.25, "data-name": `Parameter-${settingKey}`, children: [_jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", children: [_jsx(Typography, { variant: "body2", children: label }), _jsx(ResetButton, { title: `Reset ${label.toLowerCase()}`, onClick: () => onSettingChange({ [settingKey]: getParameterDefaults()[settingKey] }) })] }), _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1.5, children: [_jsx(Slider, { size: "small", value: value, min: range.min, max: range.max, step: range.step, "aria-label": label, "data-name": `ParameterSlider-${settingKey}`, onChange: (event, next) => onSettingChange({ [settingKey]: Array.isArray(next) ? next[0] : next }), sx: { flex: 1, minWidth: 0 } }), _jsx(TextField, { size: "small", type: "number", label: "Value", className: "inverse stepper", id: settingKey, value: Number(value).toFixed(decimals), inputProps: { ...range, "aria-label": `${label} value` }, sx: { width: "6em", flexShrink: 0 }, onChange: (event) => onSettingChange({
                            [settingKey]: clampToRange(parseFloat(event.target.value), range),
                        }) })] }), _jsx(Typography, { variant: "caption", color: "text.secondary", noWrap: true, children: `${range.min}–${range.max} · ${caption}` })] }));
}
function ParametersMenu(props) {
    const { viewerSettings, atomCountInCell = 0, onSettingChange } = props;
    // A=B=C is the common case for a supercell, so linking is on by default but stays overridable.
    const [isRepetitionLinked, setIsRepetitionLinked] = useState(true);
    const range = PARAMETER_RANGES.repetitions;
    const drawnAtoms = getDrawnAtomCount(viewerSettings, atomCountInCell);
    const changeRepetition = (axis, rawValue) => {
        const value = clampToRange(parseFloat(rawValue), range);
        if (!isRepetitionLinked) {
            onSettingChange({ [repetitionKey(axis)]: value });
            return;
        }
        onSettingChange({
            repetitionsAlongLatticeVectorA: value,
            repetitionsAlongLatticeVectorB: value,
            repetitionsAlongLatticeVectorC: value,
        });
    };
    return (_jsxs(Stack, { spacing: 2, margin: 2, sx: { width: "22em" }, "data-name": "ParametersMenu", children: [_jsx(SliderRow, { label: "Atomic radius", settingKey: "atomRadiiScale", value: viewerSettings.atomRadiiScale, decimals: 2, caption: "1 = full van der Waals size", onSettingChange: onSettingChange }), _jsxs(Stack, { spacing: 0.5, "data-name": "Parameter-repetitions", children: [_jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", children: [_jsx(Typography, { variant: "body2", children: "Cell repetitions" }), _jsxs(Stack, { direction: "row", alignItems: "center", children: [_jsx(Tooltip, { title: isRepetitionLinked
                                            ? "A, B and C change together — click to set them separately"
                                            : "A, B and C change separately — click to link them", disableInteractive: true, children: _jsx(IconButton, { size: "small", "aria-label": "Link repetitions", "aria-pressed": isRepetitionLinked, "data-name": "RepetitionLink", "data-active": isRepetitionLinked ? "true" : "false", onClick: () => setIsRepetitionLinked(!isRepetitionLinked), color: isRepetitionLinked ? "primary" : "default", sx: {
                                                "&:focus-visible": {
                                                    outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                                                    outlineOffset: "1px",
                                                },
                                            }, children: isRepetitionLinked ? (_jsx(LinkIcon, { fontSize: "inherit" })) : (_jsx(LinkOffIcon, { fontSize: "inherit" })) }) }), _jsx(ResetButton, { title: "Reset repetitions", onClick: () => onSettingChange({
                                            repetitionsAlongLatticeVectorA: settings.repetitions,
                                            repetitionsAlongLatticeVectorB: settings.repetitions,
                                            repetitionsAlongLatticeVectorC: settings.repetitions,
                                        }) })] })] }), _jsx(Stack, { direction: "row", spacing: 1, children: REPETITION_AXES.map((axis) => (_jsx(TextField, { label: axis, size: "small", type: "number", className: "inverse stepper cell-repetitions", id: `repetitionsAlongLatticeVector${axis}`, value: viewerSettings[repetitionKey(axis)], inputProps: { ...range, "aria-label": `Repetitions along ${axis}` }, sx: { flex: 1, minWidth: 0 }, onChange: (event) => changeRepetition(axis, event.target.value) }, axis))) }), Boolean(atomCountInCell) && (_jsx(Typography, { variant: "caption", color: drawnAtoms > 2000 ? "warning.main" : "text.secondary", "data-name": "RepetitionCost", children: `${viewerSettings.repetitionsAlongLatticeVectorA} × ${viewerSettings.repetitionsAlongLatticeVectorB} × ${viewerSettings.repetitionsAlongLatticeVectorC} → ${drawnAtoms.toLocaleString()} atoms` }))] }), _jsx(SliderRow, { label: "Bond cutoff", settingKey: "chemicalConnectivityFactor", value: viewerSettings.chemicalConnectivityFactor, decimals: 2, caption: "\u00D7 the two atoms' van der Waals sum", onSettingChange: onSettingChange }), _jsx(Button, { size: "small", variant: "text", startIcon: _jsx(RestartAltIcon, {}), "data-name": "ResetAllParameters", sx: { alignSelf: "flex-start", textTransform: "none" }, onClick: () => onSettingChange(getParameterDefaults()), children: "Reset all" })] }));
}
export default ParametersMenu;
