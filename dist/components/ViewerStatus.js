import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { LoadingIndicator } from "./LoadingIndicator";
const COPY = {
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
function ViewerStatus(props) {
    const { kind = null, message = null, onRetry } = props;
    if (!kind)
        return null;
    const copy = COPY[kind];
    return (_jsx(Stack, { "data-name": `ViewerStatus-${kind}`, alignItems: "center", justifyContent: "center", spacing: 1.5, 
        // Loading covers the canvas so a half-built scene does not read as the result; the
        // other two leave the toolbars reachable, since recovering needs them.
        sx: {
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 2,
            backgroundColor: kind === "loading" ? "rgba(32, 32, 32, 0.6)" : "transparent",
        }, children: _jsxs(Stack, { alignItems: "center", spacing: 1, sx: {
                pointerEvents: "auto",
                maxWidth: "26em",
                px: 3,
                py: 2,
                textAlign: "center",
                borderRadius: 1,
                backgroundColor: "background.paper",
                boxShadow: 4,
            }, children: [kind === "loading" && _jsx(LoadingIndicator, {}), _jsx(Typography, { variant: "subtitle2", children: copy.title }), copy.body && (_jsx(Typography, { variant: "caption", color: "text.secondary", children: copy.body })), kind === "error" && message && (_jsx(Box, { component: "pre", "data-name": "ViewerStatusMessage", sx: {
                        m: 0,
                        maxWidth: "100%",
                        overflowX: "auto",
                        fontFamily: "monospace",
                        fontSize: "0.72rem",
                        textAlign: "left",
                        color: "error.main",
                        whiteSpace: "pre-wrap",
                    }, children: message })), kind === "error" && onRetry && (_jsx(Button, { size: "small", variant: "outlined", onClick: onRetry, "data-name": "ViewerStatusRetry", children: "Retry" }))] }) }));
}
export default ViewerStatus;
