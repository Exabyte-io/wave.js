import React from 'react';
import CircularProgress from "material-ui-next/Progress/CircularProgress";

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
