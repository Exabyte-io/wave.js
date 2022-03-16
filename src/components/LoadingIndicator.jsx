import CircularProgress from "@material-ui/core/CircularProgress";
import React from "react";

export const LoadingIndicator = function LoadingIndicator() {
    return (
        <div className="spinner-wrap">
            <CircularProgress className="spinner" color="secondary" />
        </div>
    );
};
