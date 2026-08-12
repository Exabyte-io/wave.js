import PropTypes from "prop-types";
import React from "react";
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
export class ViewerErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidUpdate(previousProps) {
        const { resetKey } = this.props;
        const { hasError } = this.state;
        // A new resetKey is the parent saying "try again"; clear the caught state so children
        // remount. Guarded on hasError so an unrelated re-render cannot loop setState.
        if (hasError && resetKey !== previousProps.resetKey) {
            this.setState({ hasError: false });
        }
    }
    componentDidCatch(error, errorInfo) {
        const { onError } = this.props;
        if (onError)
            onError(error, errorInfo);
    }
    render() {
        const { hasError } = this.state;
        const { children } = this.props;
        // Rendering the broken subtree again would throw again; the parent shows the message.
        return hasError ? null : children;
    }
}
ViewerErrorBoundary.propTypes = {
    children: PropTypes.node,
    /** Called once per caught error, with React's own error and componentStack. */
    onError: PropTypes.func,
    /** Change this to clear a caught error and remount the children. */
    // eslint-disable-next-line react/forbid-prop-types
    resetKey: PropTypes.any,
};
ViewerErrorBoundary.defaultProps = {
    children: null,
    onError: undefined,
    resetKey: 0,
};
export default ViewerErrorBoundary;
