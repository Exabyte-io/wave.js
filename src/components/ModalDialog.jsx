import Modal from "@mui/material/Modal";
import PropTypes from "prop-types";
import React from "react";

export class ModalDialog extends React.Component {
    constructor(props) {
        super(props);
        this.onHide = this.onHide.bind(this);
        this.renderBody = this.renderBody.bind(this);
    }

    onHide(e) {
        const { onHide } = this.props;
        onHide(e);
    }

    // eslint-disable-next-line class-methods-use-this
    renderBody() {
        return null;
    }

    render() {
        const { show, modalId } = this.props;
        return (
            <Modal id={modalId} open={show} onHide={this.onHide}>
                {this.renderBody()}
            </Modal>
        );
    }
}

ModalDialog.propTypes = {
    modalId: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
};
