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
import React, { useState } from "react";

import settings from "../settings";

/**
 * Viewer parameters.
 *
 * These were five bare number inputs (finding F7). Their ranges existed only as invisible
 * `inputProps`, there was no way back to a default, and nothing said what a value would cost - a
 * 4x4x4 repetition on a 24-atom cell draws 1,536 atoms with no warning. Radius and bond cutoff in
 * particular are found by nudging until the picture reads right, which is a job for a slider; the
 * numeric box stays beside each one so a value can still be read off and reproduced exactly.
 */

export type ViewerSettings = {
    isViewAdjustable: boolean;
    atomRadiiScale: number;
    repetitionsAlongLatticeVectorA: number;
    repetitionsAlongLatticeVectorB: number;
    repetitionsAlongLatticeVectorC: number;
    chemicalConnectivityFactor: number;
};

type PartialViewerSettings = Partial<ViewerSettings>;

interface ParametersMenuProps {
    viewerSettings: ViewerSettings;
    /** Atoms in the unit cell, so the repetition cost can be stated rather than guessed. */
    atomCountInCell?: number;
    onSettingChange: (setting: PartialViewerSettings) => void;
}

const REPETITION_AXES = ["A", "B", "C"] as const;
const repetitionKey = (axis: string) =>
    `repetitionsAlongLatticeVector${axis}` as keyof ViewerSettings;

export const PARAMETER_RANGES = {
    atomRadiiScale: { min: 0.1, max: 10, step: 0.1 },
    chemicalConnectivityFactor: { min: 0, max: 2, step: 0.01 },
    repetitions: { min: 1, max: 10, step: 1 },
};

/** Defaults come from settings, so "reset" cannot drift from what the viewer actually starts with. */
export function getParameterDefaults(): PartialViewerSettings {
    return {
        atomRadiiScale: settings.atomRadiiScale,
        chemicalConnectivityFactor: settings.chemicalConnectivityFactor,
        repetitionsAlongLatticeVectorA: settings.repetitions,
        repetitionsAlongLatticeVectorB: settings.repetitions,
        repetitionsAlongLatticeVectorC: settings.repetitions,
    };
}

/** How many atoms a repetition actually draws - the cost the old UI never mentioned. */
export function getDrawnAtomCount(
    viewerSettings: Pick<
        ViewerSettings,
        | "repetitionsAlongLatticeVectorA"
        | "repetitionsAlongLatticeVectorB"
        | "repetitionsAlongLatticeVectorC"
    >,
    atomCountInCell = 0,
): number {
    const product =
        (viewerSettings.repetitionsAlongLatticeVectorA || 1) *
        (viewerSettings.repetitionsAlongLatticeVectorB || 1) *
        (viewerSettings.repetitionsAlongLatticeVectorC || 1);
    return product * atomCountInCell;
}

function clampToRange(value: number, { min, max }: { min: number; max: number }): number {
    if (Number.isNaN(value)) return min;
    return Math.min(max, Math.max(min, value));
}

function ResetButton({ title, onClick }: { title: string; onClick: () => void }) {
    return (
        <Tooltip title={title} disableInteractive>
            <IconButton
                size="small"
                aria-label={title}
                onClick={onClick}
                sx={{
                    "&:focus-visible": {
                        outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: "1px",
                    },
                }}
            >
                <RestartAltIcon fontSize="inherit" />
            </IconButton>
        </Tooltip>
    );
}

interface SliderRowProps {
    label: string;
    settingKey: "atomRadiiScale" | "chemicalConnectivityFactor";
    value: number;
    caption: string;
    decimals: number;
    onSettingChange: (setting: PartialViewerSettings) => void;
}

function SliderRow(props: SliderRowProps) {
    const { label, settingKey, value, caption, decimals, onSettingChange } = props;
    const range = PARAMETER_RANGES[settingKey];

    return (
        <Stack spacing={0.25} data-name={`Parameter-${settingKey}`}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2">{label}</Typography>
                <ResetButton
                    title={`Reset ${label.toLowerCase()}`}
                    onClick={() =>
                        onSettingChange({ [settingKey]: getParameterDefaults()[settingKey] })
                    }
                />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1.5}>
                <Slider
                    size="small"
                    value={value}
                    min={range.min}
                    max={range.max}
                    step={range.step}
                    aria-label={label}
                    data-name={`ParameterSlider-${settingKey}`}
                    onChange={(event, next) =>
                        onSettingChange({ [settingKey]: Array.isArray(next) ? next[0] : next })
                    }
                    sx={{ flex: 1, minWidth: 0 }}
                />
                <TextField
                    size="small"
                    type="number"
                    label="Value"
                    className="inverse stepper"
                    id={settingKey}
                    value={Number(value).toFixed(decimals)}
                    inputProps={{ ...range, "aria-label": `${label} value` }}
                    sx={{ width: "6em", flexShrink: 0 }}
                    onChange={(event) =>
                        onSettingChange({
                            [settingKey]: clampToRange(parseFloat(event.target.value), range),
                        })
                    }
                />
            </Stack>
            {/* The range goes in the caption rather than as slider mark labels: MUI positions
                those absolutely below the track, so they overlapped this line. Either way the
                point is that the range is visible at all, which it was not when it lived only in
                inputProps. */}
            <Typography variant="caption" color="text.secondary">
                {`${range.min}–${range.max} · ${caption}`}
            </Typography>
        </Stack>
    );
}

function ParametersMenu(props: ParametersMenuProps) {
    const { viewerSettings, atomCountInCell = 0, onSettingChange } = props;
    // A=B=C is the common case for a supercell, so linking is on by default but stays overridable.
    const [isRepetitionLinked, setIsRepetitionLinked] = useState(true);

    const range = PARAMETER_RANGES.repetitions;
    const drawnAtoms = getDrawnAtomCount(viewerSettings, atomCountInCell);

    const changeRepetition = (axis: string, rawValue: string) => {
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

    return (
        <Stack spacing={2} margin={2} sx={{ width: "22em" }} data-name="ParametersMenu">
            <SliderRow
                label="Atomic radius"
                settingKey="atomRadiiScale"
                value={viewerSettings.atomRadiiScale}
                decimals={2}
                caption="Scales every atom; van der Waals radii still set their relative sizes."
                onSettingChange={onSettingChange}
            />

            <Stack spacing={0.5} data-name="Parameter-repetitions">
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2">Cell repetitions</Typography>
                    <Stack direction="row" alignItems="center">
                        <Tooltip
                            title={
                                isRepetitionLinked
                                    ? "A, B and C change together — click to set them separately"
                                    : "A, B and C change separately — click to link them"
                            }
                            disableInteractive
                        >
                            <IconButton
                                size="small"
                                aria-label="Link repetitions"
                                aria-pressed={isRepetitionLinked}
                                data-name="RepetitionLink"
                                data-active={isRepetitionLinked ? "true" : "false"}
                                onClick={() => setIsRepetitionLinked(!isRepetitionLinked)}
                                color={isRepetitionLinked ? "primary" : "default"}
                                sx={{
                                    "&:focus-visible": {
                                        outline: (theme) =>
                                            `2px solid ${theme.palette.primary.main}`,
                                        outlineOffset: "1px",
                                    },
                                }}
                            >
                                {isRepetitionLinked ? (
                                    <LinkIcon fontSize="inherit" />
                                ) : (
                                    <LinkOffIcon fontSize="inherit" />
                                )}
                            </IconButton>
                        </Tooltip>
                        <ResetButton
                            title="Reset repetitions"
                            onClick={() =>
                                onSettingChange({
                                    repetitionsAlongLatticeVectorA: settings.repetitions,
                                    repetitionsAlongLatticeVectorB: settings.repetitions,
                                    repetitionsAlongLatticeVectorC: settings.repetitions,
                                })
                            }
                        />
                    </Stack>
                </Stack>
                <Stack direction="row" spacing={1}>
                    {REPETITION_AXES.map((axis) => (
                        <TextField
                            key={axis}
                            label={axis}
                            size="small"
                            type="number"
                            className="inverse stepper cell-repetitions"
                            id={`repetitionsAlongLatticeVector${axis}`}
                            value={viewerSettings[repetitionKey(axis)]}
                            inputProps={{ ...range, "aria-label": `Repetitions along ${axis}` }}
                            sx={{ flex: 1, minWidth: 0 }}
                            onChange={(event) => changeRepetition(axis, event.target.value)}
                        />
                    ))}
                </Stack>
                {Boolean(atomCountInCell) && (
                    <Typography
                        variant="caption"
                        color={drawnAtoms > 2000 ? "warning.main" : "text.secondary"}
                        data-name="RepetitionCost"
                    >
                        {`${viewerSettings.repetitionsAlongLatticeVectorA} × ${
                            viewerSettings.repetitionsAlongLatticeVectorB
                        } × ${
                            viewerSettings.repetitionsAlongLatticeVectorC
                        } → ${drawnAtoms.toLocaleString()} atoms drawn, from ${atomCountInCell} in the cell`}
                    </Typography>
                )}
            </Stack>

            <SliderRow
                label="Bond cutoff"
                settingKey="chemicalConnectivityFactor"
                value={viewerSettings.chemicalConnectivityFactor}
                decimals={2}
                caption="Multiplies the sum of two atoms' van der Waals radii to decide if they bond."
                onSettingChange={onSettingChange}
            />

            <Button
                size="small"
                variant="text"
                startIcon={<RestartAltIcon />}
                data-name="ResetAllParameters"
                sx={{ alignSelf: "flex-start", textTransform: "none" }}
                onClick={() => onSettingChange(getParameterDefaults())}
            >
                Reset all to defaults
            </Button>
        </Stack>
    );
}

export default ParametersMenu;
