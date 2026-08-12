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
import React, { useMemo, useState } from "react";

import {
    describeFigureResolution,
    FIGURE_BACKGROUNDS,
    FIGURE_SIZE_PRESETS,
    FigureBackgroundId,
    getFigureBackground,
    getFigureResolution,
    getFigureSizePreset,
} from "../utils/figureExport";

/**
 * Figure export (U-12). Three decisions, each one of the things a screenshot of the canvas cannot
 * give: how many pixels, what background, and whether to annotate the scale.
 *
 * The panel states the resulting size in millimetres as well as pixels, because the question behind
 * this dialog is almost always "will this be sharp in the paper".
 */

export interface FigureExportOptions {
    width: number;
    height: number;
    background: FigureBackgroundId;
    includeScaleBar: boolean;
}

export interface FigureExportDialogProps {
    isOpen?: boolean;
    onClose?: () => void;
    onExport?: (options: FigureExportOptions) => void;
    /** Current canvas size, used for the "On-screen" preset and to keep every other preset's aspect. */
    viewportWidth?: number;
    viewportHeight?: number;
    /** Largest dimension the GL context will render; requests above it are scaled down. */
    maxDimension?: number;
    /**
     * Whether the viewer is currently using the orthographic camera. A perspective projection has
     * no single scale, so the scale bar carries a caveat there and none here.
     */
    isCameraOrthographic?: boolean;
}

function FigureExportDialog(props: FigureExportDialogProps) {
    const {
        isOpen = false,
        onClose,
        onExport,
        viewportWidth = 0,
        viewportHeight = 0,
        maxDimension,
        isCameraOrthographic = false,
    } = props;

    const [presetId, setPresetId] = useState("double-column");
    const [backgroundId, setBackgroundId] = useState<FigureBackgroundId>("white");
    const [includeScaleBar, setIncludeScaleBar] = useState(true);
    const [customWidth, setCustomWidth] = useState("1600");
    const [customHeight, setCustomHeight] = useState("1200");

    const resolution = useMemo(
        () =>
            getFigureResolution({
                presetId,
                customWidth: Number(customWidth),
                customHeight: Number(customHeight),
                viewportWidth,
                viewportHeight,
                maxDimension,
            }),
        [presetId, customWidth, customHeight, viewportWidth, viewportHeight, maxDimension],
    );

    const preset = getFigureSizePreset(presetId);
    const background = getFigureBackground(backgroundId);

    const handleExport = () => {
        onExport?.({
            width: resolution.width,
            height: resolution.height,
            background: background.id,
            includeScaleBar,
        });
        onClose?.();
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="figure-export-title"
            data-name="FigureExportDialog"
        >
            <DialogTitle id="figure-export-title" sx={{ pb: 1 }}>
                <Typography variant="h6" component="span">
                    Export figure
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2.5}>
                    <Stack spacing={1}>
                        <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="primary.main"
                            sx={{ letterSpacing: "0.06em", textTransform: "uppercase" }}
                        >
                            Size
                        </Typography>
                        <ToggleButtonGroup
                            exclusive
                            size="small"
                            value={presetId}
                            // MUI passes null when the active button is clicked again; keeping the
                            // current value avoids a state with no size selected at all.
                            onChange={(_event, value) => value && setPresetId(value)}
                            aria-label="Figure size"
                            sx={{ flexWrap: "wrap" }}
                        >
                            {FIGURE_SIZE_PRESETS.map((sizePreset) => (
                                <ToggleButton
                                    key={sizePreset.id}
                                    value={sizePreset.id}
                                    data-name={`FigureSize-${sizePreset.id}`}
                                    title={sizePreset.hint}
                                >
                                    {sizePreset.label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                        {preset.id === "custom" ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <TextField
                                    size="small"
                                    type="number"
                                    label="Width"
                                    value={customWidth}
                                    onChange={(event) => setCustomWidth(event.target.value)}
                                    inputProps={{ "data-name": "FigureCustomWidth", min: 64 }}
                                    sx={{ width: "8em" }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    ×
                                </Typography>
                                <TextField
                                    size="small"
                                    type="number"
                                    label="Height"
                                    value={customHeight}
                                    onChange={(event) => setCustomHeight(event.target.value)}
                                    inputProps={{ "data-name": "FigureCustomHeight", min: 64 }}
                                    sx={{ width: "8em" }}
                                />
                            </Stack>
                        ) : (
                            <Typography variant="caption" color="text.secondary">
                                {preset.hint} Height follows the canvas aspect ratio, so nothing is
                                stretched.
                            </Typography>
                        )}
                        <Typography
                            variant="body2"
                            data-name="FigureResolutionSummary"
                            sx={{ fontFamily: "monospace" }}
                        >
                            {describeFigureResolution(resolution)}
                        </Typography>
                        {resolution.isClamped && (
                            <Alert severity="info" data-name="FigureClampedNotice">
                                Scaled down to what this graphics context can render in one pass.
                            </Alert>
                        )}
                    </Stack>

                    <Stack spacing={0.5}>
                        <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="primary.main"
                            sx={{ letterSpacing: "0.06em", textTransform: "uppercase" }}
                        >
                            Background
                        </Typography>
                        <RadioGroup
                            value={background.id}
                            onChange={(event) =>
                                setBackgroundId(event.target.value as FigureBackgroundId)
                            }
                        >
                            {FIGURE_BACKGROUNDS.map((option) => (
                                <FormControlLabel
                                    key={option.id}
                                    value={option.id}
                                    control={
                                        <Radio
                                            size="small"
                                            inputProps={
                                                {
                                                    "data-name": `FigureBackground-${option.id}`,
                                                } as React.InputHTMLAttributes<HTMLInputElement>
                                            }
                                        />
                                    }
                                    label={
                                        <Stack>
                                            <Typography variant="body2">{option.label}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.hint}
                                            </Typography>
                                        </Stack>
                                    }
                                    sx={{ alignItems: "flex-start", mb: 0.5 }}
                                />
                            ))}
                        </RadioGroup>
                    </Stack>

                    <Stack spacing={0.5}>
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    checked={includeScaleBar}
                                    onChange={(event) => setIncludeScaleBar(event.target.checked)}
                                    inputProps={
                                        {
                                            "data-name": "FigureScaleBarToggle",
                                        } as React.InputHTMLAttributes<HTMLInputElement>
                                    }
                                />
                            }
                            label={<Typography variant="body2">Scale bar</Typography>}
                        />
                        {includeScaleBar && !isCameraOrthographic && (
                            <Alert severity="warning" data-name="FigureScaleBarPerspectiveNotice">
                                A perspective projection has no single scale: the bar is exact only
                                in the plane through the pivot point. Switch to the orthographic
                                camera for a strictly correct bar.
                            </Alert>
                        )}
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} data-name="FigureExportCancel">
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleExport} data-name="FigureExportConfirm">
                    Export PNG
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default FigureExportDialog;
