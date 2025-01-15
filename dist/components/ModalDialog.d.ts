export class ModalDialog extends React.Component<any, any, any> {
    constructor(props: any);
    onHide(e: any): void;
    renderBody(): null;
    removeStylingFromBody(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export namespace ModalDialog {
    namespace propTypes {
        const modalId: PropTypes.Validator<string>;
        const show: PropTypes.Validator<boolean>;
        const onHide: PropTypes.Validator<(...args: any[]) => any>;
        const className: PropTypes.Validator<string>;
        const isFullWidth: PropTypes.Requireable<boolean>;
        const backdropColor: PropTypes.Requireable<string>;
    }
    namespace defaultProps {
        const isFullWidth_1: boolean;
        export { isFullWidth_1 as isFullWidth };
        const backdropColor_1: string;
        export { backdropColor_1 as backdropColor };
    }
}
import React from "react";
import PropTypes from "prop-types";
