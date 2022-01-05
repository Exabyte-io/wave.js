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

    onHide(e) {
        const { onHide } = this.props;
        onHide(e);
        this.removeStylingFromBody();
    }

    removeStylingFromBody() {
        const { backdropColor } = this.props;
        document.body.classList.remove("modal-backdrop-color-" + backdropColor);
    }

    // eslint-disable-next-line class-methods-use-this
    renderBody() {
        return null;
    }

    render() {
        const { className, isFullWidth, show, backdropColor, modalId } = this.props;
        const setClassName = setClass(className, isFullWidth ? "full-page-overlay" : "");
        if (show) {
            document.body.classList.add("modal-backdrop-color-" + backdropColor);
        }
        return (
            <Modal
                id={modalId}
                animation={false}
                show={show}
                onHide={this.onHide}
                className={setClassName}
            >
                {this.renderBody()}
            </Modal>
        );
    }
}

ModalDialog.propTypes = {
    modalId: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    className: PropTypes.string.isRequired,
    isFullWidth: PropTypes.bool,
    backdropColor: PropTypes.string,
};

ModalDialog.defaultProps = {
    isFullWidth: true,
    backdropColor: "white",
};
