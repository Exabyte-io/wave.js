import React from 'react';
import setClass from 'classnames';
import {Close} from 'material-ui-icons-next';

import {ShowIf} from "./ShowIf";
import {RoundIconButton} from "./RoundIconButton";

export class IconToolbar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
        };
        this.handleToggleActive = this.handleToggleActive.bind(this);
    }

    handleToggleActive(e) {
        this.setState({isActive: !this.state.isActive})
    }

    render() {
        return (
            <div className={setClass(this.props.className, {'hidden': this.props.isHidden})}
                data-name={this.props.title}
            >

                <RoundIconButton
                    tooltipPlacement="top" mini
                    title={this.props.title}
                    onClick={this.handleToggleActive}
                >
                    {this.state.isActive ? <Close/> : <this.props.iconComponent/>}
                </RoundIconButton>

                {(this.props.children || []).map((el, idx) => <ShowIf condition={this.state.isActive} key={idx}>
                    {el}
                </ShowIf>)}
            </div>

        )
    }
}

IconToolbar.propTypes = {
    title: React.PropTypes.string,
    iconComponent: React.PropTypes.func,
    isHidden: React.PropTypes.bool,
};
