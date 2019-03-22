import React from 'react';
import setClass from "classnames";
import {Modal} from "react-bootstrap";
import elementClass from "element-class";

export class ModalDialog extends React.Component {

    constructor(props) {
        super(props);
        this.onHide = this.onHide.bind(this);
        this.renderBody = this.renderBody.bind(this);
    }

    renderBody() {
        return null;
    }

    onHide(material) {
        this.props.onHide(material);
        elementClass(document.body).remove('modal-backdrop-color-' + this.props.backdropColor);
    }

    render() {
        const className = setClass(this.props.className, this.props.isFullWidth ? "full-page-overlay" : "");
        if (this.props.show) elementClass(document.body).add('modal-backdrop-color-' + this.props.backdropColor);
        return (
            <Modal
                id={this.props.modalId}
                animation={false}
                show={this.props.show}
                onHide={this.onHide}
                className={className}
            >
                {this.renderBody()}
            </Modal>
        )
    }

}

ModalDialog.propTypes = {
    modalId: React.PropTypes.string,
    show: React.PropTypes.bool,
    onHide: React.PropTypes.func,
    title: React.PropTypes.string,
    className: React.PropTypes.string,
    isFullWidth: React.PropTypes.bool,
    backdropColor: React.PropTypes.string
};

ModalDialog.defaultProps = {
    isFullWidth: true,
    backdropColor: 'white',
};
