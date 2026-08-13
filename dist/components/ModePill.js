import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Close from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import settings from "../settings";
import { hasCoarsePointer } from "../utils/inputCapabilities";
import { formatMeasurementValue, getMeasurementHint, getMeasurementLabel, getMeasurementProgress, } from "../utils/measurementReadout";
import { useObservedWidth } from "../utils/useObservedWidth";
import { INSPECTOR_WIDTH } from "./SelectionInspector";
/**
 * A mode was previously signalled only by the Edit icon changing colour, and a measurement mode
 * not at all: it is armed from a dropdown that then closes, after which every click means
 * something different with nothing on screen to say so (finding F5). Edit mode additionally
 * remaps orbit-rotate to the right mouse button (spec section 3f) - a change to what the primary
 * mouse gesture does, advertised nowhere (F4).
 *
 * This pill names the active mode, states the bindings that appear in no tooltip or menu, and
 * offers a one-click exit so leaving a mode does not mean hunting back through the menu that
 * armed it. Absence of a pill is itself information: clicks do nothing but orbit.
 */
/**
 * Below this much room, the pill keeps only its name and its exit. Set just above the width the full
 * edit binding list occupies (~430 px measured), so the drop happens when the text would start
 * fighting for space rather than after it already has.
 */
export const PILL_COMPACT_WIDTH_PX = 460;
/**
 * Horizontal inset clearing the chrome pinned to each edge. In pixels rather than `em` on purpose:
 * the widths being cleared are themselves pixel constants - the icon strip is 44 px at a 12 px
 * margin, the edit toolbar 52 px at 12 px - and an `em` here resolved against the caption font to
 * 54 px, two pixels under the toolbar it was supposed to clear.
 */
const SIDE_CHROME_INSET = "72px";
/**
 * Extra right inset while edit mode is on, clearing the selection inspector as well as the toolbar.
 *
 * The container's insets describe the space that is genuinely free, so the compact decision falls out
 * of measuring that space - one mechanism rather than the pill separately guessing what else is on
 * screen. Without this the pill measured a band it could not actually use and still overlapped the
 * inspector at every width between "narrow" and "full desktop".
 */
const EDIT_SURFACE_INSET = `calc(${SIDE_CHROME_INSET} + ${INSPECTOR_WIDTH} + 8px)`;
/**
 * Bindings worth stating in the pill, sourced from settings so a rebind cannot desync them.
 *
 * `isOrbitEnabled` gates the orbit note. Orbit controls start disabled
 * (`initOrbitControls(enabled = false)`), so while they are off the right button orbits nothing -
 * and advertising a binding that does nothing is the defect this whole slice is trying to undo.
 *
 * `isCoarsePointer` decides *which* orbit gesture is named. A phone has no right button, and edit
 * mode reserves one finger for atoms exactly as it frees the left button, so there the camera is on
 * two fingers (U-13). Naming the mouse binding on a touch device would be the same class of lie.
 */
export function getEditModeBindings({ isOrbitEnabled = false, isCoarsePointer = hasCoarsePointer(), } = {}) {
    var _a;
    const keys = settings.hotKeysConfig;
    const orbitKey = (_a = keys === null || keys === void 0 ? void 0 : keys.toggleOrbitControls) === null || _a === void 0 ? void 0 : _a.toUpperCase();
    // The remap that surprises people: in edit mode a left-drag on empty space marquees, so orbit
    // moves to the right button (D-4) - or to two fingers on touch. That is only true once orbit is
    // on, so while it is off the pill points at the way to turn it on instead.
    let orbitNote = "";
    if (isOrbitEnabled)
        orbitNote = isCoarsePointer ? "2 fingers = orbit" : "RMB = orbit";
    else if (isCoarsePointer)
        orbitNote = "Rotate/Zoom off";
    else if (orbitKey)
        orbitNote = `${orbitKey} = enable orbit`;
    // Keyboard rows are dropped on a coarse pointer: Del and Esc name keys a phone does not have,
    // and the toolbar's Remove button is the reachable equivalent.
    const keyboardNotes = isCoarsePointer
        ? []
        : [
            "Del = remove",
            "Esc = deselect",
            (keys === null || keys === void 0 ? void 0 : keys.focusCameraOnSelection)
                ? `${keys.focusCameraOnSelection.toUpperCase()} = focus`
                : "",
        ];
    return [
        isCoarsePointer ? "drag atom = move" : "drag = move",
        orbitNote,
        ...keyboardNotes,
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
            // toolbar and inspector on the right. Spanning the full width let the pill grow to
            // 520 px and run underneath all of them, which an embedded viewer showed first.
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
