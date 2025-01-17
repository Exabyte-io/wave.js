import { jsx as _jsx } from "react/jsx-runtime";
import Dialog from "@exabyte-io/cove.js/dist/mui/components/dialog/Dialog";
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
        const { className, isFullWidth, show, modalId } = this.props;
        return (_jsx(Dialog, { id: modalId, animation: false, sx: { height: "100%", width: "100%" }, open: show, fullWidth: isFullWidth, maxWidth: false, onClose: this.onHide, className: className, renderHeaderCustom: () => null, renderFooterCustom: () => null, PaperProps: {
                sx: {
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "100%",
                    height: "100%",
                    m: 0,
                },
            }, renderBodyCustom: this.renderBody }));
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
