/**
 * Figure export (U-12).
 *
 * `takeScreenshot` reads the on-screen canvas back with `toDataURL`, which means every image the
 * viewer has ever produced is the dark viewer theme at whatever pixel size the container happened
 * to have - typically a few hundred pixels tall, and unusable in a paper. The publication case
 * needs three things the canvas cannot give: a chosen background, a resolution set in pixels
 * rather than inherited from the layout, and a scale bar.
 *
 * Everything here is pure: sizes, background definitions, the scale-bar step choice and the
 * filename. The rendering side lives in mixins/image.js, which is where the renderer is.
 */
/** Dots per inch assumed when reporting a pixel size as a physical one. Journal figures are 300. */
export declare const FIGURE_DPI = 300;
export type FigureBackgroundId = "viewer" | "white" | "transparent";
export interface FigureBackground {
    id: FigureBackgroundId;
    label: string;
    /** Renderer clear colour. Still set for a transparent export, so anti-aliased edges blend
     *  towards the page colour rather than towards black. */
    clearColor: string;
    /** 0 writes an alpha channel instead of a background. */
    clearAlpha: number;
    /**
     * Colour to redraw the viewer's *chrome* in - cell edges, text labels, scale bar - or null to
     * leave the scene as it is on screen. The viewer draws chrome light-on-dark (`#CCCCCC` cell
     * edges, `#EEEEEE` label text), so exporting onto a white page without inverting it produces a
     * figure whose unit cell and labels are simply absent. Atom colours are element identity and
     * are never touched.
     */
    foregroundColor: string | null;
    hint: string;
}
export declare const FIGURE_BACKGROUNDS: FigureBackground[];
export declare function getFigureBackground(id: string | undefined | null): FigureBackground;
export interface FigureSizePreset {
    id: string;
    label: string;
    /** Target width in pixels; null means "whatever the canvas is right now". */
    width: number | null;
    hint: string;
}
/**
 * Widths chosen from what a figure is actually for. The two column widths are the near-universal
 * single/double column measures (85 mm and 180 mm) at 300 dpi, so the exported file needs no
 * resampling on the way into a manuscript.
 */
export declare const FIGURE_SIZE_PRESETS: FigureSizePreset[];
export declare function getFigureSizePreset(id: string | undefined | null): FigureSizePreset;
/** Smallest useful figure. Below this the scale bar and labels stop being legible anyway. */
export declare const MIN_FIGURE_DIMENSION = 64;
/**
 * Fallback cap when the GL context cannot be asked for its own limit. WebGL implementations are
 * required to support at least 2048; 8192 is what current desktop drivers report, and asking for
 * more than the driver allows fails the render rather than producing a large image.
 */
export declare const DEFAULT_MAX_FIGURE_DIMENSION = 8192;
/**
 * Side of the square the rotating GIF is rendered at.
 *
 * Fixed rather than derived from the canvas: a GIF that inherits the window's aspect ratio comes out
 * a different shape on every machine, and letterboxed wherever it is embedded. A rotating structure
 * also *wants* a square - it sweeps through its own width as it turns, so the frame has to hold the
 * structure's largest dimension in both axes or the animation clips at the extremes.
 *
 * 512 is smaller in area than the window-sized frames it replaces on a typical desktop, so encoding
 * gets cheaper as well as more predictable.
 */
export declare const DEFAULT_GIF_SIDE_PX = 512;
/** Square side for a GIF: the requested size, or the default, clamped to what the context allows. */
export declare function getGifSide({ requested, maxDimension, }?: {
    requested?: number | null;
    maxDimension?: number;
}): number;
export interface FigureResolution {
    width: number;
    height: number;
    /** True when the request exceeded `maxDimension` and was scaled down to fit. */
    isClamped: boolean;
}
interface ResolutionRequest {
    presetId?: string | null;
    customWidth?: number | null;
    customHeight?: number | null;
    viewportWidth: number;
    viewportHeight: number;
    maxDimension?: number;
}
/**
 * Resolves the requested size to real pixel dimensions.
 *
 * Height follows from the canvas aspect ratio for every preset, so choosing a publication width
 * cannot silently squash the structure - the one thing a figure export must not do. Only the
 * custom preset lets both dimensions be set, because there the distortion is the user's choice.
 */
export declare function getFigureResolution({ presetId, customWidth, customHeight, viewportWidth, viewportHeight, maxDimension, }: ResolutionRequest): FigureResolution;
/** Pixel size expressed in millimetres at `dpi`, rounded to whole millimetres. */
export declare function getFigurePhysicalSize({ width, height }: {
    width: number;
    height: number;
}, dpi?: number): {
    widthMm: number;
    heightMm: number;
    dpi: number;
};
/** One line stating exactly what will be written, in both pixels and millimetres. */
export declare function describeFigureResolution(resolution: {
    width: number;
    height: number;
}): string;
export interface ScaleBarPlan {
    /** Bar length in the structure's own units (Ångström). */
    lengthAngstrom: number;
    /** Bar length in image pixels. */
    lengthPx: number;
    label: string;
}
/**
 * Chooses a scale-bar length: a round number of Ångström whose drawn length is near
 * `targetFraction` of the image width.
 *
 * Returns null when there is nothing honest to draw - a non-finite or non-positive scale, or a bar
 * that would run off the image. A wrong scale bar is worse than none, so this never guesses.
 */
export declare function getScaleBarPlan({ worldUnitsPerPixel, imageWidth, targetFraction, }: {
    worldUnitsPerPixel: number;
    imageWidth: number;
    targetFraction?: number;
}): ScaleBarPlan | null;
/**
 * Geometry of the scale bar within the image, in pixels. Split out from the drawing so the layout
 * can be asserted without a 2D canvas, which jsdom does not provide.
 */
export declare function getScaleBarLayout({ plan, width, height, }: {
    plan: ScaleBarPlan;
    width: number;
    height: number;
}): {
    margin: number;
    barHeight: number;
    fontSize: number;
    barX: number;
    barY: number;
    barWidth: number;
    labelX: number;
    labelBaselineY: number;
};
type MinimalContext2D = Pick<CanvasRenderingContext2D, "fillRect" | "fillText" | "save" | "restore"> & {
    fillStyle: string | CanvasGradient | CanvasPattern;
    font: string;
    textBaseline: CanvasTextBaseline;
    textAlign: CanvasTextAlign;
};
/**
 * Draws the bar and its label into an already-composited 2D context.
 * `color` must contrast with the chosen background - see `FigureBackground.foregroundColor`.
 */
export declare function drawScaleBar(context: MinimalContext2D, plan: ScaleBarPlan, { width, height, color }: {
    width: number;
    height: number;
    color: string;
}): {
    margin: number;
    barHeight: number;
    fontSize: number;
    barX: number;
    barY: number;
    barWidth: number;
    labelX: number;
    labelBaselineY: number;
};
/**
 * Names the file after the structure and the size it was rendered at, so a folder of exports at
 * different resolutions stays tellable apart without opening them.
 */
export declare function getFigureFileName({ name, formula, width, height, backgroundId, }: {
    name?: string | null;
    formula?: string | null;
    width: number;
    height: number;
    backgroundId?: string | null;
}): string;
export {};
