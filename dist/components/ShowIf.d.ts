/**
 * Renders children depending on a Boolean condition
 * @property {boolean} condition The condition
 * @property {node} children Children element that are required for this component
 */
export class ShowIf extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    render(): any;
}
export namespace ShowIf {
    namespace propTypes {
        let condition: PropTypes.Validator<boolean>;
        let children: PropTypes.Validator<NonNullable<PropTypes.ReactNodeLike>>;
    }
}
import React from "react";
import PropTypes from "prop-types";
