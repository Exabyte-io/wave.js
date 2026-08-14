import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Close from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import settings from "../settings";
import { formatMeasurementValue, getMeasurementHint, getMeasurementLabel, getMeasurementProgress, } from "../utils/measurementReadout";
import { useObservedWidth } from "../utils/useObservedWidth";
import { EDIT_SURFACE_INSET, PILL_COMPACT_WIDTH_PX, SIDE_CHROME_INSET } from "./chromeLayout";
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
    const { ref: containerRef, width: containerWidth } = useObservedWidth();
    if (!isEditModeActive && !(activeMeasurement === null || activeMeasurement === void 0 ? void 0 : activeMeasurement.isActive))
        return null;
    const progress = getMeasurementProgress(activeMeasurement);
    const latestValue = formatMeasurementValue(activeMeasurement);
    // Until measured, assume there is room: the wide case is the common one, and a pill that starts
    // compact and expands one frame later flickers.
    const isCompact = containerWidth !== null && containerWidth < PILL_COMPACT_WIDTH_PX;
    return (_jsxs(Stack, { ref: containerRef, "data-name": "ModePillContainer", "data-compact": isCompact ? "true" : "false", 
        // Left-aligned when compact: the top-right corner belongs to the selection inspector, and
        // a centred pill lands squarely on it in an embedded panel.
        alignItems: isCompact ? "flex-start" : "center", spacing: 0.5, sx: {
            position: "absolute",
            top: "1em",
            // Insets clear the chrome pinned to either edge - the icon strip on the left, the edit
            // toolbar on the right. Spanning the full width let the pill grow to 520 px and run
            // underneath both of them, which is what an embedded viewer showed first.
            left: SIDE_CHROME_INSET,
            right: isEditModeActive ? EDIT_SURFACE_INSET : SIDE_CHROME_INSET,
            // The canvas keeps its pointer events; each pill opts back in for itself.
            pointerEvents: "none",
            zIndex: 1,
        }, children: [isEditModeActive && (_jsx(Pill, { dataName: "ModePill-edit", label: "EDIT", accent: "primary", onExit: onExitEditMode, exitTitle: "Exit edit mode", children: !isCompact && (_jsx(Typography, { variant: "caption", noWrap: true, children: getEditModeBindings({ isOrbitEnabled }).join(" · ") })) })), (activeMeasurement === null || activeMeasurement === void 0 ? void 0 : activeMeasurement.isActive) && (_jsxs(Pill, { dataName: `ModePill-${activeMeasurement.measurementType}`, label: getMeasurementLabel(activeMeasurement.measurementType).toUpperCase(), accent: "warning", onExit: onExitMeasurement
                    ? () => onExitMeasurement(activeMeasurement.measurementType)
                    : undefined, exitTitle: `Exit ${getMeasurementLabel(activeMeasurement.measurementType).toLowerCase()} mode`, children: [_jsx(Typography, { variant: "caption", noWrap: true, sx: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }, children: getMeasurementHint(activeMeasurement) }), progress.isPartial && (_jsx(Typography, { variant: "caption", fontWeight: "bold", noWrap: true, "data-name": "ModePillProgress", children: `${progress.picked} of ${progress.needed} picked` })), latestValue && (_jsx(Typography, { variant: "caption", color: "warning.main", noWrap: true, children: latestValue }))] }))] }));
}
export default ModePill;
