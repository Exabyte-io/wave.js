/**
 * Catches a throw from the viewer subtree so a failed scene build becomes a message rather than a
 * blank canvas or an unmounted tree.
 *
 * This matters more than it used to: `WaveComponent.reloadViewer` deliberately no longer wraps its
 * work in a `try/catch → console.warn` (status-doc S-1), because that hid real render failures
 * behind a stale viewer. With the catch gone, an exception from `setStructure`/`rebuildScene`
 * propagates out of `componentDidUpdate` — which React turns into an unmount of the whole tree
 * unless a boundary stops it here.
 *
 * The boundary reports upward and renders nothing itself; the parent owns what the user sees, so
 * the toolbars stay mounted and the failure can be retried. Remounting is driven by the `resetKey`
 * prop rather than by internal state, so the parent decides when a retry happens.
 */
export class ViewerErrorBoundary extends React.Component<any, any, any> {
    static getDerivedStateFromError(): {
        hasError: boolean;
    };
    constructor(props: any);
    state: {
        hasError: boolean;
    };
    componentDidUpdate(previousProps: any): void;
    componentDidCatch(error: any, errorInfo: any): void;
    render(): any;
}
export namespace ViewerErrorBoundary {
    namespace propTypes {
        let children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        let onError: PropTypes.Requireable<(...args: any[]) => any>;
        let resetKey: PropTypes.Requireable<any>;
    }
    namespace defaultProps {
        let children_1: null;
        export { children_1 as children };
        let onError_1: undefined;
        export { onError_1 as onError };
        let resetKey_1: number;
        export { resetKey_1 as resetKey };
    }
}
export default ViewerErrorBoundary;
import React from "react";
import PropTypes from "prop-types";
