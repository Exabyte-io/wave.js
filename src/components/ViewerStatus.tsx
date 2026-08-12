import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";

import { LoadingIndicator } from "./LoadingIndicator";

/**
 * The viewer had no loading, empty, or error state at all (finding F8): `LoadingIndicator`,
 * `AlertDialog` and `ModalDialog` all sat in the tree with zero call sites. A structure that
 * failed to render left an unexplained blank `#202020` canvas, and since `reloadViewer` no longer
 * swallows exceptions into a `console.warn` (status-doc S-1), such a failure now surfaces as a
 * thrown error with nothing to catch it.
 *
 * These states render as an overlay card rather than a modal on purpose. A render failure is not
 * a decision the user has to make, so blocking the whole component behind a dialog would take
 * away the toolbar they need to recover with - they want to know why the canvas is blank and be
 * able to retry. `AlertDialog` remains the right shape for a destructive confirmation and is
 * still unused; it should be deleted or moved to cove rather than given a contrived caller.
 */

export type ViewerStatusKind = "loading" | "empty" | "error";

export interface ViewerStatusProps {
    kind?: ViewerStatusKind | null;
    /** Why the render failed, shown verbatim so the reason is not lost. */
    message?: string | null;
    onRetry?: () => void;
}

const COPY: Record<ViewerStatusKind, { title: string; body: string }> = {
    loading: { title: "Building the structure…", body: "" },
    empty: {
        title: "Nothing to show",
        body: "This structure has no atoms. Add one from the edit toolbar, or undo the last removal.",
    },
    error: {
        title: "Couldn't render this structure",
        body: "The viewer failed while building the scene. The structure itself is unchanged.",
    },
};

function ViewerStatus(props: ViewerStatusProps) {
    const { kind = null, message = null, onRetry } = props;
    if (!kind) return null;
    const copy = COPY[kind];

    return (
        <Stack
            data-name={`ViewerStatus-${kind}`}
            alignItems="center"
            justifyContent="center"
            spacing={1.5}
            // Loading covers the canvas so a half-built scene does not read as the result; the
            // other two leave the toolbars reachable, since recovering needs them.
            sx={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 2,
                backgroundColor: kind === "loading" ? "rgba(32, 32, 32, 0.6)" : "transparent",
            }}
        >
            <Stack
                alignItems="center"
                spacing={1}
                sx={{
                    pointerEvents: "auto",
                    maxWidth: "26em",
                    px: 3,
                    py: 2,
                    textAlign: "center",
                    borderRadius: 1,
                    backgroundColor: "background.paper",
                    boxShadow: 4,
                }}
            >
                {kind === "loading" && <LoadingIndicator />}
                <Typography variant="subtitle2">{copy.title}</Typography>
                {copy.body && (
                    <Typography variant="caption" color="text.secondary">
                        {copy.body}
                    </Typography>
                )}
                {kind === "error" && message && (
                    <Box
                        component="pre"
                        data-name="ViewerStatusMessage"
                        sx={{
                            m: 0,
                            maxWidth: "100%",
                            overflowX: "auto",
                            fontFamily: "monospace",
                            fontSize: "0.72rem",
                            textAlign: "left",
                            color: "error.main",
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {message}
                    </Box>
                )}
                {kind === "error" && onRetry && (
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={onRetry}
                        data-name="ViewerStatusRetry"
                    >
                        Retry
                    </Button>
                )}
            </Stack>
        </Stack>
    );
}

export default ViewerStatus;
