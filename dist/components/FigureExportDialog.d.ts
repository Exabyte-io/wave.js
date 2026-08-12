import { FigureBackgroundId } from "../utils/figureExport";
/**
 * Figure export (U-12). Three decisions, each one of the things a screenshot of the canvas cannot
 * give: how many pixels, what background, and whether to annotate the scale.
 *
 * The panel states the resulting size in millimetres as well as pixels, because the question behind
 * this dialog is almost always "will this be sharp in the paper".
 */
export interface FigureExportOptions {
    width: number;
    height: number;
    background: FigureBackgroundId;
    includeScaleBar: boolean;
}
export interface FigureExportDialogProps {
    isOpen?: boolean;
    onClose?: () => void;
    onExport?: (options: FigureExportOptions) => void;
    /** Current canvas size, used for the "On-screen" preset and to keep every other preset's aspect. */
    viewportWidth?: number;
    viewportHeight?: number;
    /** Largest dimension the GL context will render; requests above it are scaled down. */
    maxDimension?: number;
    /**
     * Whether the viewer is currently using the orthographic camera. A perspective projection has
     * no single scale, so the scale bar carries a caveat there and none here.
     */
    isCameraOrthographic?: boolean;
}
declare function FigureExportDialog(props: FigureExportDialogProps): import("react/jsx-runtime").JSX.Element;
export default FigureExportDialog;
