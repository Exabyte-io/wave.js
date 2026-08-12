import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import settings from "../settings";
const AXIS_NAMES = ["X", "Y", "Z"];
/** Caption for a units value, matching what the edit panel used to show. */
export function getUnitsCaption(units) {
    return units === "cartesian" ? "cartesian, Å" : "crystal";
}
function SelectionInspector(props) {
    const { selectedAtomIndices = [], selectedElement = "", selectedCoordinates = [0, 0, 0], materialUnits = "crystal", displayUnits, displayCoordinates = null, elementColor = settings.defaultColor, coordinateDrafts = [null, null, null], elementDraft = null, onDisplayUnitsChange, onCoordinateDraftChange, onCoordinateCommit, onElementDraftChange, onElementCommit, } = props;
    const nativeUnits = materialUnits === "cartesian" ? "cartesian" : "crystal";
    const shownUnits = displayUnits || nativeUnits;
    // Editing writes straight into the basis in its own units. Converting a whole point back on
    // commit is a separate, riskier change than switching what is displayed, so while a
    // non-native unit is shown the fields are read-only and say why.
    const isEditable = shownUnits === nativeUnits;
    const coordinates = (isEditable ? selectedCoordinates : displayCoordinates) || [0, 0, 0];
    const isSingleAtomSelected = selectedAtomIndices.length === 1;
    const isGroupSelected = selectedAtomIndices.length > 1;
    return (_jsxs(Paper, { elevation: 2, "data-name": "SelectionInspector", sx: {
            boxShadow: 4,
            width: "19em",
            maxHeight: "100%",
            overflowY: "auto",
            p: 1.25,
        }, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "text.secondary", sx: { letterSpacing: "0.06em" }, children: "SELECTION" }), !isSingleAtomSelected && !isGroupSelected && (_jsxs(Stack, { spacing: 0.5, sx: { mt: 1 }, "data-name": "SelectionInspectorEmpty", children: [_jsx(Typography, { variant: "caption", children: "Click an atom to select it." }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: "Shift-click adds to the selection; drag empty space to marquee-select." })] })), isGroupSelected && (_jsxs(Stack, { spacing: 0.5, sx: { mt: 1 }, "data-name": "SelectionInspectorGroup", children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", children: `${selectedAtomIndices.length} atoms selected` }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: "Drag, or use the gizmo, to move or rotate the group together." })] })), isSingleAtomSelected && (_jsxs(Stack, { spacing: 1, sx: { mt: 1 }, children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Box, { sx: {
                                    width: 14,
                                    height: 14,
                                    borderRadius: "50%",
                                    backgroundColor: elementColor,
                                    flexShrink: 0,
                                } }), _jsx(TextField, { label: "Element", size: "small", type: "text", className: "inverse stepper", sx: { width: "5.5em" }, value: elementDraft !== null ? elementDraft : selectedElement || "Si", onChange: (event) => onElementDraftChange === null || onElementDraftChange === void 0 ? void 0 : onElementDraftChange(event.target.value), onBlur: () => onElementCommit === null || onElementCommit === void 0 ? void 0 : onElementCommit(), onKeyDown: (event) => {
                                    if (event.key === "Enter") {
                                        event.target.blur();
                                    }
                                } }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: `site ${selectedAtomIndices[0]}` })] }), _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Units" }), _jsxs(ToggleButtonGroup, { size: "small", exclusive: true, value: shownUnits, onChange: (event, value) => {
                                    if (value)
                                        onDisplayUnitsChange === null || onDisplayUnitsChange === void 0 ? void 0 : onDisplayUnitsChange(value);
                                }, "data-name": "SelectionInspectorUnits", children: [_jsx(ToggleButton, { value: "crystal", sx: { py: 0, textTransform: "none" }, children: "crystal" }), _jsx(ToggleButton, { value: "cartesian", sx: { py: 0, textTransform: "none" }, children: "cartesian" })] })] }), _jsx(Box, { "data-name": "SelectionInspectorCoordinates", sx: {
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: 0.75,
                        }, children: AXIS_NAMES.map((axisName, axisIndex) => {
                            const draftValue = coordinateDrafts[axisIndex];
                            const committedValue = coordinates[axisIndex] !== undefined
                                ? coordinates[axisIndex].toFixed(settings.roundPrecision)
                                : "0";
                            return (_jsx(TextField, { label: axisName, size: "small", 
                                // type="text" (not "number"): a native number input silently
                                // drops a lone "-" or an empty string instead of firing
                                // onChange, which makes typing a negative coordinate or
                                // clearing the field to retype impossible (D18).
                                type: "text", inputMode: "decimal", className: "inverse stepper", 
                                // MUI's InputBase root carries min-width: 75px, which is
                                // what pushed the third field past the card edge regardless
                                // of how wide its grid column was. Matched by class substring
                                // because MuiClassNameSetup renames MUI classes to
                                // "wave-Mui*", so ".MuiInputBase-root" would never match.
                                sx: {
                                    minWidth: 0,
                                    '& [class*="InputBase-root"]': { minWidth: 0 },
                                    "& input": { minWidth: 0, px: 0.75 },
                                }, disabled: !isEditable, value: draftValue !== null && isEditable
                                    ? draftValue
                                    : committedValue, onChange: (event) => onCoordinateDraftChange === null || onCoordinateDraftChange === void 0 ? void 0 : onCoordinateDraftChange(axisIndex, event.target.value), onBlur: () => onCoordinateCommit === null || onCoordinateCommit === void 0 ? void 0 : onCoordinateCommit(axisIndex), onKeyDown: (event) => {
                                    if (event.key === "Enter") {
                                        event.target.blur();
                                    }
                                } }, axisName));
                        }) }), !isEditable && (_jsx(Typography, { variant: "caption", color: "warning.main", "data-name": "SelectionInspectorReadOnlyNote", children: `Showing ${getUnitsCaption(shownUnits)}. Switch to ${getUnitsCaption(nativeUnits)} to edit — that is what this material stores.` })), _jsx(Divider, {}), _jsx(Typography, { variant: "caption", color: "text.secondary", children: `Stored as ${getUnitsCaption(nativeUnits)}` })] }))] }));
}
export default SelectionInspector;
