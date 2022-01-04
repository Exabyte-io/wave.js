import setClass from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { Modal } from "react-bootstrap";

export class ModalDialog extends React.Component {
    constructor(props) {
        super(props);
        this.onHide = this.onHide.bind(this);
        this.renderBody = this.renderBody.bind(this);
    }

    renderBody() {
        return null;
    }

    removeStylingFromBody() {
        document.body.classList.remove("modal-backdrop-color-" + this.props.backdropColor);
    }

    onHide(e) {
        this.props.onHide(e);
        this.removeStylingFromBody();
    }

    render() {
        const className = setClass(
            this.props.className,
            this.props.isFullWidth ? "full-page-overlay" : "",
        );
        if (this.props.show) {
            document.body.classList.add("modal-backdrop-color-" + this.props.backdropColor);
        }
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
        );
    }
}

ModalDialog.propTypes = {
    modalId: PropTypes.string,
    show: PropTypes.bool,
    onHide: PropTypes.func,
    title: PropTypes.string,
    className: PropTypes.string,
    isFullWidth: PropTypes.bool,
    backdropColor: PropTypes.string,
};

ModalDialog.defaultProps = {
    isFullWidth: true,
    backdropColor: "white",
};
