/**
 * The viewer had no loading, empty, or error state at all (finding F8): `LoadingIndicator`,
 * `AlertDialog` and `ModalDialog` all sat in the tree with zero call sites. A structure that
 * failed to render left an unexplained blank `#202020` canvas, and since `reloadViewer` no longer
 * swallows exceptions into a `console.warn` (status-doc S-1), such a failure now surfaces as a
 * thrown error with nothing to catch it.
 *
 * These states render as an overlay card rather than a modal on purpose. A render failure is not
 * a decision the user has to make, so blocking the whole component behind a dialog would take
 * away the toolbar they need to recover with - they want to know why the canvas is blank and be
 * able to retry. `AlertDialog` remains the right shape for a destructive confirmation and is
 * still unused; it should be deleted or moved to cove rather than given a contrived caller.
 */
export type ViewerStatusKind = "loading" | "empty" | "error";
export interface ViewerStatusProps {
    kind?: ViewerStatusKind | null;
    /** Why the render failed, shown verbatim so the reason is not lost. */
    message?: string | null;
    onRetry?: () => void;
}
declare function ViewerStatus(props: ViewerStatusProps): import("react/jsx-runtime").JSX.Element | null;
export default ViewerStatus;
