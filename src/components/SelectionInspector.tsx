import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import React from "react";

import settings from "../settings";
import { INSPECTOR_WIDTH } from "./chromeLayout";

/**
 * The per-selection data, as a card rather than more buttons.
 *
 * Split out of the 84 px icon column (finding F1), where a value like `-0.083` had to fit a
 * `small` MUI field 84 px wide with a floating label, and where the fields sat below eight icon
 * buttons in a stack ~600 px tall with no scroll - so on a short viewer they were cut off and
 * unreachable. Here the coordinates sit side by side with room to be read, and the card scrolls
 * inside its own bounds rather than overflowing the canvas.
 *
 * Empty state included on purpose: the panel used to render nothing at all when no atom was
 * selected, which taught the user nothing about how to select one - and the selection modifiers
 * (Shift-click, marquee) appear in no other UI.
 */

export type DisplayUnits = "crystal" | "cartesian";

export interface SelectionInspectorProps {
    /** Selected atomic indices, per the mixin's multi-select contract. */
    selectedAtomIndices?: number[];
    /** Element symbol when exactly one atom is selected. */
    selectedElement?: string;
    /** Coordinates of the single selected atom, in the material's own units. */
    selectedCoordinates?: number[];
    /** The material's own basis units - what the coordinates above are expressed in. */
    materialUnits?: string;
    /** Units currently being displayed; may differ from the material's own. */
    displayUnits?: DisplayUnits;
    /** Coordinates converted into `displayUnits`, when that differs from `materialUnits`. */
    displayCoordinates?: number[] | null;
    /** CSS colour for the element swatch. */
    elementColor?: string;
    /** Draft strings while a coordinate field is focused; null means "show the committed value". */
    coordinateDrafts?: (string | null)[];
    /** Draft string while the element field is focused. */
    elementDraft?: string | null;
    onDisplayUnitsChange?: (units: DisplayUnits) => void;
    onCoordinateDraftChange?: (axisIndex: number, value: string) => void;
    onCoordinateCommit?: (axisIndex: number) => void;
    onElementDraftChange?: (value: string) => void;
    onElementCommit?: () => void;
}

const AXIS_NAMES = ["X", "Y", "Z"];

/** Caption for a units value, matching what the edit panel used to show. */
export function getUnitsCaption(units?: string): string {
    return units === "cartesian" ? "cartesian, Å" : "crystal";
}

function SelectionInspector(props: SelectionInspectorProps) {
    const {
        selectedAtomIndices = [],
        selectedElement = "",
        selectedCoordinates = [0, 0, 0],
        materialUnits = "crystal",
        displayUnits,
        displayCoordinates = null,
        elementColor = settings.defaultColor,
        coordinateDrafts = [null, null, null],
        elementDraft = null,
        onDisplayUnitsChange,
        onCoordinateDraftChange,
        onCoordinateCommit,
        onElementDraftChange,
        onElementCommit,
    } = props;

    const nativeUnits: DisplayUnits = materialUnits === "cartesian" ? "cartesian" : "crystal";
    const shownUnits = displayUnits || nativeUnits;
    // Editing writes straight into the basis in its own units. Converting a whole point back on
    // commit is a separate, riskier change than switching what is displayed, so while a
    // non-native unit is shown the fields are read-only and say why.
    const isEditable = shownUnits === nativeUnits;
    const coordinates = (isEditable ? selectedCoordinates : displayCoordinates) || [0, 0, 0];

    const isSingleAtomSelected = selectedAtomIndices.length === 1;
    const isGroupSelected = selectedAtomIndices.length > 1;

    return (
        <Paper
            elevation={2}
            data-name="SelectionInspector"
            sx={{
                boxShadow: 4,
                width: INSPECTOR_WIDTH,
                maxHeight: "100%",
                overflowY: "auto",
                p: 1.25,
            }}
        >
            <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                sx={{ letterSpacing: "0.06em" }}
            >
                SELECTION
            </Typography>

            {!isSingleAtomSelected && !isGroupSelected && (
                <Stack spacing={0.5} sx={{ mt: 1 }} data-name="SelectionInspectorEmpty">
                    <Typography variant="caption">Click an atom to select it.</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Shift-click adds to the selection; drag empty space to marquee-select.
                    </Typography>
                </Stack>
            )}

            {isGroupSelected && (
                <Stack spacing={0.5} sx={{ mt: 1 }} data-name="SelectionInspectorGroup">
                    <Typography variant="caption" fontWeight="bold">
                        {`${selectedAtomIndices.length} atoms selected`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Drag, or use the gizmo, to move or rotate the group together.
                    </Typography>
                </Stack>
            )}

            {isSingleAtomSelected && (
                <Stack spacing={1} sx={{ mt: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                            sx={{
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                backgroundColor: elementColor,
                                flexShrink: 0,
                            }}
                        />
                        <TextField
                            label="Element"
                            size="small"
                            type="text"
                            className="inverse stepper"
                            sx={{ width: "5.5em" }}
                            value={elementDraft !== null ? elementDraft : selectedElement || "Si"}
                            onChange={(event) => onElementDraftChange?.(event.target.value)}
                            onBlur={() => onElementCommit?.()}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    (event.target as HTMLInputElement).blur();
                                }
                            }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            {`site ${selectedAtomIndices[0]}`}
                        </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="caption" color="text.secondary">
                            Units
                        </Typography>
                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={shownUnits}
                            onChange={(event, value) => {
                                if (value) onDisplayUnitsChange?.(value as DisplayUnits);
                            }}
                            data-name="SelectionInspectorUnits"
                        >
                            <ToggleButton value="crystal" sx={{ py: 0, textTransform: "none" }}>
                                crystal
                            </ToggleButton>
                            <ToggleButton value="cartesian" sx={{ py: 0, textTransform: "none" }}>
                                cartesian
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>

                    {/* A grid, not a row of fixed-width fields: three coordinates have to share
                        whatever width the card has, or the last one is clipped at the edge. */}
                    <Box
                        data-name="SelectionInspectorCoordinates"
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: 0.75,
                        }}
                    >
                        {AXIS_NAMES.map((axisName, axisIndex) => {
                            const draftValue = coordinateDrafts[axisIndex];
                            const committedValue =
                                coordinates[axisIndex] !== undefined
                                    ? coordinates[axisIndex].toFixed(settings.roundPrecision)
                                    : "0";
                            return (
                                <TextField
                                    key={axisName}
                                    label={axisName}
                                    size="small"
                                    // type="text" (not "number"): a native number input silently
                                    // drops a lone "-" or an empty string instead of firing
                                    // onChange, which makes typing a negative coordinate or
                                    // clearing the field to retype impossible (D18).
                                    type="text"
                                    inputMode="decimal"
                                    className="inverse stepper"
                                    // MUI's InputBase root carries min-width: 75px, which is
                                    // what pushed the third field past the card edge regardless
                                    // of how wide its grid column was. Matched by class substring
                                    // because MuiClassNameSetup renames MUI classes to
                                    // "wave-Mui*", so ".MuiInputBase-root" would never match.
                                    sx={{
                                        minWidth: 0,
                                        '& [class*="InputBase-root"]': { minWidth: 0 },
                                        "& input": { minWidth: 0, px: 0.75 },
                                    }}
                                    disabled={!isEditable}
                                    value={
                                        draftValue !== null && isEditable
                                            ? draftValue
                                            : committedValue
                                    }
                                    onChange={(event) =>
                                        onCoordinateDraftChange?.(axisIndex, event.target.value)
                                    }
                                    onBlur={() => onCoordinateCommit?.(axisIndex)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            (event.target as HTMLInputElement).blur();
                                        }
                                    }}
                                />
                            );
                        })}
                    </Box>

                    {!isEditable && (
                        <Typography
                            variant="caption"
                            color="warning.main"
                            data-name="SelectionInspectorReadOnlyNote"
                        >
                            {`Showing ${getUnitsCaption(shownUnits)}. Switch to ${getUnitsCaption(
                                nativeUnits,
                            )} to edit — that is what this material stores.`}
                        </Typography>
                    )}

                    <Divider />
                    <Typography variant="caption" color="text.secondary">
                        {`Stored as ${getUnitsCaption(nativeUnits)}`}
                    </Typography>
                </Stack>
            )}
        </Paper>
    );
}

export default SelectionInspector;
