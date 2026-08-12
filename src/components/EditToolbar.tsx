import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import CenterFocusStrong from "@mui/icons-material/CenterFocusStrong";
import ContentCopy from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenWith from "@mui/icons-material/OpenWith";
import Redo from "@mui/icons-material/Redo";
import RotateRight from "@mui/icons-material/RotateRight";
import Undo from "@mui/icons-material/Undo";
import ButtonGroup from "@mui/material/ButtonGroup";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import React from "react";

import settings from "../settings";
import SquareIconButton from "./SquareIconButton";

/**
 * The edit tools, as icons only.
 *
 * Extracted from `ThreeDEditor.renderEditToolbar`, which packed eight icon buttons *and* four
 * text fields into a single 84 px column - roughly 600 px tall, with no scroll, so in any viewer
 * shorter than that the coordinate fields were simply cut off (finding F1). Splitting the tools
 * from the data also stops the two reading as one undifferentiated stack: these are verbs, and
 * they now share the visual language of the left menu strip. The data lives in
 * `SelectionInspector`.
 */

export type TransformMode = "translate" | "rotate";

export interface EditToolbarProps {
    activeTransformMode?: TransformMode;
    /** Number of selected atoms; drives the disabled states and the plural tooltips. */
    selectedCount?: number;
    /** Element the Add button will insert. */
    defaultElement?: string;
    canUndo?: boolean;
    canRedo?: boolean;
    onSetTransformMode?: (mode: TransformMode) => void;
    onAddAtom?: () => void;
    onCloneSelected?: () => void;
    onRemoveSelected?: () => void;
    onFocusCamera?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
}

function EditToolbar(props: EditToolbarProps) {
    const {
        activeTransformMode = "translate",
        selectedCount = 0,
        defaultElement = "Si",
        canUndo = false,
        canRedo = false,
        onSetTransformMode,
        onAddAtom,
        onCloneSelected,
        onRemoveSelected,
        onFocusCamera,
        onUndo,
        onRedo,
    } = props;

    const hasSelection = selectedCount > 0;
    // Rotating a single sphere about its own centre changes nothing structurally (D4), so rotate
    // only means something for a group about its centroid.
    const canRotate = selectedCount > 1;
    const isGroup = selectedCount > 1;

    return (
        <Paper elevation={2} data-name="EditToolbar" sx={{ boxShadow: 4 }}>
            <Stack alignItems="center" padding={0.5} spacing={0.5}>
                <ButtonGroup orientation="vertical" variant="outlined" color="inherit">
                    <SquareIconButton
                        title="Translate Mode"
                        onClick={() => onSetTransformMode?.("translate")}
                    >
                        <OpenWith
                            color={activeTransformMode === "translate" ? "primary" : "inherit"}
                        />
                    </SquareIconButton>
                    <SquareIconButton
                        title={canRotate ? "Rotate Mode" : "Select 2+ atoms to rotate as a group"}
                        disabled={!canRotate}
                        onClick={() => onSetTransformMode?.("rotate")}
                    >
                        <RotateRight
                            color={activeTransformMode === "rotate" ? "primary" : "inherit"}
                        />
                    </SquareIconButton>
                </ButtonGroup>

                <ButtonGroup orientation="vertical" variant="outlined" color="inherit">
                    <SquareIconButton
                        title={`Add Atom (${defaultElement})`}
                        onClick={() => onAddAtom?.()}
                    >
                        <AddCircleOutline />
                    </SquareIconButton>
                    <SquareIconButton
                        title={
                            isGroup
                                ? `Clone ${selectedCount} Selected Atoms`
                                : "Clone Selected Atom"
                        }
                        disabled={!hasSelection}
                        onClick={() => onCloneSelected?.()}
                    >
                        <ContentCopy />
                    </SquareIconButton>
                    <SquareIconButton
                        title={
                            isGroup
                                ? `Delete ${selectedCount} Selected Atoms`
                                : "Delete Selected Atom"
                        }
                        disabled={!hasSelection}
                        onClick={() => onRemoveSelected?.()}
                    >
                        <DeleteIcon />
                    </SquareIconButton>
                </ButtonGroup>

                <ButtonGroup orientation="vertical" variant="outlined" color="inherit">
                    <SquareIconButton
                        title={`Focus Camera on Selection [${settings.hotKeysConfig.focusCameraOnSelection.toUpperCase()}]`}
                        disabled={!hasSelection}
                        onClick={() => onFocusCamera?.()}
                    >
                        <CenterFocusStrong />
                    </SquareIconButton>
                    <SquareIconButton title="Undo" disabled={!canUndo} onClick={() => onUndo?.()}>
                        <Undo />
                    </SquareIconButton>
                    <SquareIconButton title="Redo" disabled={!canRedo} onClick={() => onRedo?.()}>
                        <Redo />
                    </SquareIconButton>
                </ButtonGroup>
            </Stack>
        </Paper>
    );
}

export default EditToolbar;
