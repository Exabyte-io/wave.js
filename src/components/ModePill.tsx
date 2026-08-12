import Close from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React from "react";

import { MEASUREMENT_MODES_ENUM } from "../enums";
import { MeasurementSettingsForType } from "../mixins/measurements/MeasurementSettingsHandler";
import settings from "../settings";
import {
    formatMeasurementValue,
    getMeasurementHint,
    getMeasurementLabel,
    getMeasurementProgress,
} from "../utils/measurementReadout";

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

export interface ModePillProps {
    /** Edit mode is active. Mutually exclusive with a measurement, per decision D-12. */
    isEditModeActive?: boolean;
    /** The armed measurement mode, or null. */
    activeMeasurement?: MeasurementSettingsForType | null;
    /** Exits edit mode. */
    onExitEditMode?: () => void;
    /** Exits the given measurement mode. */
    onExitMeasurement?: (measurementType: MEASUREMENT_MODES_ENUM) => void;
}

/** Bindings worth stating in the pill, sourced from settings so a rebind cannot desync them. */
export function getEditModeBindings(): string[] {
    const keys = settings.hotKeysConfig as Record<string, string>;
    return [
        "drag = move",
        // The remap that surprises people: in edit mode a left-drag on empty space marquees,
        // so orbit moves to the right button (D-4).
        "RMB = orbit",
        "Del = remove",
        "Esc = deselect",
        keys?.focusCameraOnSelection ? `${keys.focusCameraOnSelection.toUpperCase()} = focus` : "",
    ].filter(Boolean);
}

interface PillProps {
    label: string;
    accent: "primary" | "warning";
    children: React.ReactNode;
    onExit?: () => void;
    exitTitle: string;
    dataName: string;
}

function Pill({ label, accent, children, onExit, exitTitle, dataName }: PillProps) {
    return (
        <Stack
            data-name={dataName}
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
                pointerEvents: "auto",
                pl: 0.75,
                pr: onExit ? 0.25 : 1.25,
                py: 0.25,
                borderRadius: "17px",
                border: 1,
                borderColor: `${accent}.main`,
                backgroundColor: "background.paper",
                maxWidth: "100%",
            }}
        >
            <Box
                sx={{
                    px: 0.75,
                    borderRadius: "9px",
                    backgroundColor: `${accent}.main`,
                    flexShrink: 0,
                }}
            >
                <Typography
                    variant="caption"
                    fontWeight="bold"
                    sx={{ color: `${accent}.contrastText`, letterSpacing: "0.04em" }}
                >
                    {label}
                </Typography>
            </Box>
            {children}
            {onExit && (
                <Tooltip title={exitTitle}>
                    <IconButton size="small" aria-label={exitTitle} onClick={onExit}>
                        <Close fontSize="inherit" />
                    </IconButton>
                </Tooltip>
            )}
        </Stack>
    );
}

function ModePill(props: ModePillProps) {
    const {
        isEditModeActive = false,
        activeMeasurement = null,
        onExitEditMode,
        onExitMeasurement,
    } = props;

    if (!isEditModeActive && !activeMeasurement?.isActive) return null;

    const progress = getMeasurementProgress(activeMeasurement);
    const latestValue = formatMeasurementValue(activeMeasurement);

    return (
        <Stack
            data-name="ModePillContainer"
            alignItems="center"
            spacing={0.5}
            sx={{
                position: "absolute",
                top: "1em",
                left: 0,
                right: 0,
                // The canvas keeps its pointer events; each pill opts back in for itself.
                pointerEvents: "none",
                zIndex: 1,
            }}
        >
            {isEditModeActive && (
                <Pill
                    dataName="ModePill-edit"
                    label="EDIT"
                    accent="primary"
                    onExit={onExitEditMode}
                    exitTitle="Exit edit mode"
                >
                    <Typography variant="caption" noWrap>
                        {getEditModeBindings().join(" · ")}
                    </Typography>
                </Pill>
            )}

            {activeMeasurement?.isActive && (
                <Pill
                    dataName={`ModePill-${activeMeasurement.measurementType}`}
                    label={getMeasurementLabel(activeMeasurement.measurementType).toUpperCase()}
                    accent="warning"
                    onExit={
                        onExitMeasurement
                            ? () => onExitMeasurement(activeMeasurement.measurementType)
                            : undefined
                    }
                    exitTitle={`Exit ${getMeasurementLabel(
                        activeMeasurement.measurementType,
                    ).toLowerCase()} mode`}
                >
                    <Typography variant="caption" noWrap>
                        {getMeasurementHint(activeMeasurement)}
                    </Typography>
                    {progress.isPartial && (
                        <Typography
                            variant="caption"
                            fontWeight="bold"
                            noWrap
                            data-name="ModePillProgress"
                        >
                            {`${progress.picked} of ${progress.needed} picked`}
                        </Typography>
                    )}
                    {latestValue && (
                        <Typography variant="caption" color="warning.main" noWrap>
                            {latestValue}
                        </Typography>
                    )}
                </Pill>
            )}
        </Stack>
    );
}

export default ModePill;
