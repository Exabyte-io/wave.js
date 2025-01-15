export class WaveComponent extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        isFullscreen: boolean;
    };
    componentDidMount(): void;
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any): void;
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
        const triggerHandleResize: PropTypes.Validator<boolean>;
        const settings: PropTypes.Validator<object>;
        const structure: PropTypes.Validator<object>;
        const cell: PropTypes.Validator<object>;
        const boundaryConditions: PropTypes.Validator<object>;
        const isConventionalCellShown: PropTypes.Validator<boolean>;
        const isDrawBondsEnabled: PropTypes.Validator<boolean>;
        const isViewAdjustable: PropTypes.Validator<boolean>;
    }
}
import React from "react";
import { Wave } from "../wave";
import PropTypes from "prop-types";
