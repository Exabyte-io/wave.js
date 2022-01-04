import { CircularProgress } from "@material-ui/core";
import React from "react";

export class LoadingIndicator extends React.Component {
    render() {
        return (
            <div className="spinner-wrap">
                <CircularProgress className="spinner" color="secondary" />
            </div>
        );
    }
}
