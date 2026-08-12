import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Close from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import settings from "../settings";
import { formatMeasurementValue, getMeasurementHint, getMeasurementLabel, getMeasurementProgress, } from "../utils/measurementReadout";
/**
 * Bindings worth stating in the pill, sourced from settings so a rebind cannot desync them.
 *
 * `isOrbitEnabled` gates the right-button note. Orbit controls start disabled
 * (`initOrbitControls(enabled = false)`), so while they are off the right button orbits nothing -
 * and advertising a binding that does nothing is the defect this whole slice is trying to undo.
 */
export function getEditModeBindings({ isOrbitEnabled = false, } = {}) {
    var _a;
    const keys = settings.hotKeysConfig;
    const orbitKey = (_a = keys === null || keys === void 0 ? void 0 : keys.toggleOrbitControls) === null || _a === void 0 ? void 0 : _a.toUpperCase();
    // The remap that surprises people: in edit mode a left-drag on empty space marquees, so orbit
    // moves to the right button (D-4). That is only true once orbit is on, so while it is off the
    // pill points at the key that turns it on instead of naming a button that does nothing.
    let orbitNote = "";
    if (isOrbitEnabled)
        orbitNote = "RMB = orbit";
    else if (orbitKey)
        orbitNote = `${orbitKey} = enable orbit`;
    return [
        "drag = move",
        orbitNote,
        "Del = remove",
        "Esc = deselect",
        (keys === null || keys === void 0 ? void 0 : keys.focusCameraOnSelection) ? `${keys.focusCameraOnSelection.toUpperCase()} = focus` : "",
    ].filter(Boolean);
}
function Pill({ label, accent, children, onExit, exitTitle, dataName }) {
    return (_jsxs(Stack, { "data-name": dataName, direction: "row", alignItems: "center", spacing: 1, sx: {
            pointerEvents: "auto",
            pl: 0.75,
            pr: onExit ? 0.25 : 1.25,
            py: 0.25,
            borderRadius: "17px",
            border: 1,
            borderColor: `${accent}.main`,
            backgroundColor: "background.paper",
            maxWidth: "100%",
        }, children: [_jsx(Box, { sx: {
                    px: 0.75,
                    borderRadius: "9px",
                    backgroundColor: `${accent}.main`,
                    flexShrink: 0,
                }, children: _jsx(Typography, { variant: "caption", fontWeight: "bold", sx: { color: `${accent}.contrastText`, letterSpacing: "0.04em" }, children: label }) }), children, onExit && (_jsx(Tooltip, { title: exitTitle, children: _jsx(IconButton, { size: "small", "aria-label": exitTitle, onClick: onExit, 
                    // A bare IconButton, not a SquareIconButton, so it needs the same explicit
                    // focus ring rather than relying on MUI's ripple (F9).
                    sx: {
                        "&:focus-visible": {
                            outline: (theme) => `2px solid ${theme.palette[accent].main}`,
                            outlineOffset: "1px",
                        },
                    }, children: _jsx(Close, { fontSize: "inherit" }) }) }))] }));
}
function ModePill(props) {
    const { isEditModeActive = false, activeMeasurement = null, onExitEditMode, onExitMeasurement, isOrbitEnabled = false, } = props;
    if (!isEditModeActive && !(activeMeasurement === null || activeMeasurement === void 0 ? void 0 : activeMeasurement.isActive))
        return null;
    const progress = getMeasurementProgress(activeMeasurement);
    const latestValue = formatMeasurementValue(activeMeasurement);
    return (_jsxs(Stack, { "data-name": "ModePillContainer", alignItems: "center", spacing: 0.5, sx: {
            position: "absolute",
            top: "1em",
            left: 0,
            right: 0,
            // The canvas keeps its pointer events; each pill opts back in for itself.
            pointerEvents: "none",
            zIndex: 1,
        }, children: [isEditModeActive && (_jsx(Pill, { dataName: "ModePill-edit", label: "EDIT", accent: "primary", onExit: onExitEditMode, exitTitle: "Exit edit mode", children: _jsx(Typography, { variant: "caption", noWrap: true, children: getEditModeBindings({ isOrbitEnabled }).join(" · ") }) })), (activeMeasurement === null || activeMeasurement === void 0 ? void 0 : activeMeasurement.isActive) && (_jsxs(Pill, { dataName: `ModePill-${activeMeasurement.measurementType}`, label: getMeasurementLabel(activeMeasurement.measurementType).toUpperCase(), accent: "warning", onExit: onExitMeasurement
                    ? () => onExitMeasurement(activeMeasurement.measurementType)
                    : undefined, exitTitle: `Exit ${getMeasurementLabel(activeMeasurement.measurementType).toLowerCase()} mode`, children: [_jsx(Typography, { variant: "caption", noWrap: true, children: getMeasurementHint(activeMeasurement) }), progress.isPartial && (_jsx(Typography, { variant: "caption", fontWeight: "bold", noWrap: true, "data-name": "ModePillProgress", children: `${progress.picked} of ${progress.needed} picked` })), latestValue && (_jsx(Typography, { variant: "caption", color: "warning.main", noWrap: true, children: latestValue }))] }))] }));
}
export default ModePill;
