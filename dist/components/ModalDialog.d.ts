export class ModalDialog extends React.Component<any, any, any> {
    constructor(props: any);
    onHide(e: any): void;
    renderBody(): null;
    removeStylingFromBody(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export namespace ModalDialog {
    namespace propTypes {
        let modalId: PropTypes.Validator<string>;
        let show: PropTypes.Validator<boolean>;
        let onHide: PropTypes.Validator<(...args: any[]) => any>;
        let className: PropTypes.Validator<string>;
        let isFullWidth: PropTypes.Requireable<boolean>;
        let backdropColor: PropTypes.Requireable<string>;
    }
    namespace defaultProps {
        let isFullWidth_1: boolean;
        export { isFullWidth_1 as isFullWidth };
        let backdropColor_1: string;
        export { backdropColor_1 as backdropColor };
    }
}
import React from "react";
import PropTypes from "prop-types";
