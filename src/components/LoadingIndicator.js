import React from 'react';
import { CircularProgress } from "@material-ui/core";

export class LoadingIndicator extends React.Component {
    render() {
        return (
            <div className='spinner-wrap'
            >
                <CircularProgress className='spinner' color="secondary"/>
            </div>
        );
    }
}
