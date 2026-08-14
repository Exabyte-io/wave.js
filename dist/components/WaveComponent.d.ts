export class WaveComponent extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        isFullscreen: boolean;
    };
    componentDidMount(): void;
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any): void;
    componentWillUnmount(): void;
    _resizeTransitionTimeout: any;
    shouldViewerAdjust(prevProps: any): boolean;
    _cleanViewer(): void;
    initViewer(): void;
    wave: Wave | undefined;
    _handleResizeTransition(): void;
    reloadViewer(createBondsAsync: any): void;
    render(): import("react/jsx-runtime").JSX.Element;
    rendererDomElement: HTMLDivElement | null | undefined;
}
export namespace WaveComponent {
    namespace propTypes {
        let triggerHandleResize: PropTypes.Validator<boolean>;
        let settings: PropTypes.Validator<object>;
        let structure: PropTypes.Validator<object>;
        let cell: PropTypes.Validator<object>;
        let boundaryConditions: PropTypes.Validator<object>;
        let isConventionalCellShown: PropTypes.Validator<boolean>;
        let isDrawBondsEnabled: PropTypes.Validator<boolean>;
        let isViewAdjustable: PropTypes.Validator<boolean>;
    }
}
import React from "react";
import { Wave } from "../wave";
import PropTypes from "prop-types";
