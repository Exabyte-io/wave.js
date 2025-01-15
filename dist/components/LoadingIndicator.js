import { jsx as _jsx } from "react/jsx-runtime";
import CircularProgress from "@mui/material/CircularProgress";
import React from "react";
export const LoadingIndicator = function LoadingIndicator() {
    return (_jsx("div", { className: "spinner-wrap", children: _jsx(CircularProgress, { className: "spinner", color: "secondary" }) }));
};
