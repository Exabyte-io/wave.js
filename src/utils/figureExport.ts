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
export const FIGURE_DPI = 300;

const MM_PER_INCH = 25.4;

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

export const FIGURE_BACKGROUNDS: FigureBackground[] = [
    {
        id: "viewer",
        label: "Viewer (dark)",
        clearColor: "#202020",
        clearAlpha: 1,
        foregroundColor: null,
        hint: "What the viewer shows now — for slides and dark documents.",
    },
    {
        id: "white",
        label: "White",
        clearColor: "#FFFFFF",
        clearAlpha: 1,
        foregroundColor: "#1A1A1A",
        hint: "Cell edges and labels are redrawn dark so they survive on a white page.",
    },
    {
        id: "transparent",
        label: "Transparent",
        clearColor: "#FFFFFF",
        clearAlpha: 0,
        // Chrome is drawn dark on the assumption the figure lands on a light page, which is what
        // a transparent PNG is almost always for. Stated in the hint rather than left to surprise.
        foregroundColor: "#1A1A1A",
        hint: "Alpha channel instead of a background. Chrome is drawn dark, for a light page.",
    },
];

export function getFigureBackground(id: string | undefined | null): FigureBackground {
    return FIGURE_BACKGROUNDS.find((background) => background.id === id) || FIGURE_BACKGROUNDS[0];
}

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
export const FIGURE_SIZE_PRESETS: FigureSizePreset[] = [
    {
        id: "viewport",
        label: "On-screen",
        width: null,
        hint: "Same pixels as the canvas — the old screenshot behaviour.",
    },
    {
        id: "single-column",
        label: "Single column",
        width: Math.round((85 / MM_PER_INCH) * FIGURE_DPI),
        hint: "85 mm at 300 dpi.",
    },
    {
        id: "double-column",
        label: "Double column",
        width: Math.round((180 / MM_PER_INCH) * FIGURE_DPI),
        hint: "180 mm at 300 dpi.",
    },
    {
        id: "slide",
        label: "Slide",
        width: 1920,
        hint: "1920 px wide, for a presentation.",
    },
    {
        id: "custom",
        label: "Custom",
        width: null,
        hint: "Set the pixel size directly.",
    },
];

export function getFigureSizePreset(id: string | undefined | null): FigureSizePreset {
    return FIGURE_SIZE_PRESETS.find((preset) => preset.id === id) || FIGURE_SIZE_PRESETS[0];
}

/** Smallest useful figure. Below this the scale bar and labels stop being legible anyway. */
export const MIN_FIGURE_DIMENSION = 64;

/**
 * Fallback cap when the GL context cannot be asked for its own limit. WebGL implementations are
 * required to support at least 2048; 8192 is what current desktop drivers report, and asking for
 * more than the driver allows fails the render rather than producing a large image.
 */
export const DEFAULT_MAX_FIGURE_DIMENSION = 8192;

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

function clampToRange(value: number, max: number) {
    return Math.min(Math.max(Math.round(value), MIN_FIGURE_DIMENSION), max);
}

/**
 * Resolves the requested size to real pixel dimensions.
 *
 * Height follows from the canvas aspect ratio for every preset, so choosing a publication width
 * cannot silently squash the structure - the one thing a figure export must not do. Only the
 * custom preset lets both dimensions be set, because there the distortion is the user's choice.
 */
export function getFigureResolution({
    presetId,
    customWidth,
    customHeight,
    viewportWidth,
    viewportHeight,
    maxDimension = DEFAULT_MAX_FIGURE_DIMENSION,
}: ResolutionRequest): FigureResolution {
    const max = Math.max(MIN_FIGURE_DIMENSION, Math.round(maxDimension));
    const hasViewport = viewportWidth > 0 && viewportHeight > 0;
    const aspect = hasViewport ? viewportWidth / viewportHeight : 4 / 3;
    const preset = getFigureSizePreset(presetId);

    let width: number;
    let height: number;
    if (preset.id === "custom") {
        width = Number(customWidth) > 0 ? Number(customWidth) : Math.round(720 * aspect);
        height = Number(customHeight) > 0 ? Number(customHeight) : 720;
    } else if (preset.width) {
        width = preset.width;
        height = preset.width / aspect;
    } else {
        width = hasViewport ? viewportWidth : Math.round(720 * aspect);
        height = hasViewport ? viewportHeight : 720;
    }

    // Scale both dimensions by the same factor when over the limit: clamping them independently
    // would change the aspect ratio, which is the distortion the whole function avoids.
    const overshoot = Math.max(width / max, height / max, 1);
    const isClamped = overshoot > 1;
    return {
        width: clampToRange(width / overshoot, max),
        height: clampToRange(height / overshoot, max),
        isClamped,
    };
}

/** Pixel size expressed in millimetres at `dpi`, rounded to whole millimetres. */
export function getFigurePhysicalSize(
    { width, height }: { width: number; height: number },
    dpi = FIGURE_DPI,
) {
    return {
        widthMm: Math.round((width / dpi) * MM_PER_INCH),
        heightMm: Math.round((height / dpi) * MM_PER_INCH),
        dpi,
    };
}

/** One line stating exactly what will be written, in both pixels and millimetres. */
export function describeFigureResolution(resolution: { width: number; height: number }) {
    const { widthMm, heightMm, dpi } = getFigurePhysicalSize(resolution);
    return `${resolution.width} × ${resolution.height} px · ${widthMm} × ${heightMm} mm at ${dpi} dpi`;
}

export interface ScaleBarPlan {
    /** Bar length in the structure's own units (Ångström). */
    lengthAngstrom: number;
    /** Bar length in image pixels. */
    lengthPx: number;
    label: string;
}

/** 1-2-5 progression, so the bar always reads as a round number rather than "8.37 Å". */
const NICE_MANTISSAS = [1, 2, 5];

function niceLengthNear(target: number) {
    const exponent = Math.floor(Math.log10(target));
    // One decade either side, so a target just below a decade boundary can still pick the round
    // number above it. Compared in log space: "nearest" for a scale bar means nearest by ratio, or
    // 5 would always beat 10 for a target of 7.
    const candidates = [exponent - 1, exponent, exponent + 1].flatMap((e) =>
        NICE_MANTISSAS.map((mantissa) => mantissa * 10 ** e),
    );
    return candidates.reduce((best, candidate) =>
        Math.abs(Math.log(candidate / target)) < Math.abs(Math.log(best / target))
            ? candidate
            : best,
    );
}

function formatAngstrom(length: number) {
    // Strip the trailing zeros a fixed precision would leave: "0.5 Å", "2 Å", "20 Å".
    const text =
        length >= 1 ? String(Number(length.toFixed(2))) : String(Number(length.toFixed(3)));
    return `${text} Å`;
}

/**
 * Chooses a scale-bar length: a round number of Ångström whose drawn length is near
 * `targetFraction` of the image width.
 *
 * Returns null when there is nothing honest to draw - a non-finite or non-positive scale, or a bar
 * that would run off the image. A wrong scale bar is worse than none, so this never guesses.
 */
export function getScaleBarPlan({
    worldUnitsPerPixel,
    imageWidth,
    targetFraction = 0.18,
}: {
    worldUnitsPerPixel: number;
    imageWidth: number;
    targetFraction?: number;
}): ScaleBarPlan | null {
    if (!Number.isFinite(worldUnitsPerPixel) || worldUnitsPerPixel <= 0) return null;
    if (!Number.isFinite(imageWidth) || imageWidth < MIN_FIGURE_DIMENSION) return null;

    const targetWorld = worldUnitsPerPixel * imageWidth * targetFraction;
    if (!Number.isFinite(targetWorld) || targetWorld <= 0) return null;

    const lengthAngstrom = niceLengthNear(targetWorld);
    const lengthPx = lengthAngstrom / worldUnitsPerPixel;
    if (!Number.isFinite(lengthPx) || lengthPx < 8 || lengthPx > imageWidth * 0.8) return null;

    return { lengthAngstrom, lengthPx, label: formatAngstrom(lengthAngstrom) };
}

/**
 * Geometry of the scale bar within the image, in pixels. Split out from the drawing so the layout
 * can be asserted without a 2D canvas, which jsdom does not provide.
 */
export function getScaleBarLayout({
    plan,
    width,
    height,
}: {
    plan: ScaleBarPlan;
    width: number;
    height: number;
}) {
    const margin = Math.max(8, Math.round(height * 0.045));
    const barHeight = Math.max(2, Math.round(height / 160));
    // height/28 puts the label at roughly 7 pt once the figure is placed at 300 dpi. A smaller
    // fraction looks fine on screen and comes out below most journals' minimum type size in print,
    // which is the one place this annotation has to survive.
    const fontSize = Math.max(10, Math.round(height / 28));
    const gap = Math.max(2, Math.round(fontSize * 0.35));
    return {
        margin,
        barHeight,
        fontSize,
        barX: margin,
        barY: height - margin - barHeight,
        barWidth: Math.min(plan.lengthPx, width - 2 * margin),
        labelX: margin,
        labelBaselineY: height - margin - barHeight - gap,
    };
}

type MinimalContext2D = Pick<
    CanvasRenderingContext2D,
    "fillRect" | "fillText" | "save" | "restore"
> & {
    fillStyle: string | CanvasGradient | CanvasPattern;
    font: string;
    textBaseline: CanvasTextBaseline;
    textAlign: CanvasTextAlign;
};

/**
 * Draws the bar and its label into an already-composited 2D context.
 * `color` must contrast with the chosen background - see `FigureBackground.foregroundColor`.
 */
export function drawScaleBar(
    context: MinimalContext2D,
    plan: ScaleBarPlan,
    { width, height, color }: { width: number; height: number; color: string },
) {
    const layout = getScaleBarLayout({ plan, width, height });
    context.save();
    context.fillStyle = color;
    context.fillRect(layout.barX, layout.barY, layout.barWidth, layout.barHeight);
    context.font = `${layout.fontSize}px Arial, Helvetica, sans-serif`;
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    context.fillText(plan.label, layout.labelX, layout.labelBaselineY);
    context.restore();
    return layout;
}

/**
 * Filesystem-safe basename. A structure name is free text that reaches a download filename, so a
 * name like "../../Si/Ge (001)" must come out as a plain name: separators collapse to hyphens, runs
 * of dots collapse to one (no ".." component), and leading punctuation is dropped so the result is
 * never a dotfile.
 */
function slugify(name: string) {
    return (
        name
            .trim()
            .replace(/[^A-Za-z0-9._-]+/g, "-")
            .replace(/\.{2,}/g, ".")
            .replace(/^[-._]+|[-._]+$/g, "")
            .slice(0, 80) || "structure"
    );
}

/**
 * Names the file after the structure and the size it was rendered at, so a folder of exports at
 * different resolutions stays tellable apart without opening them.
 */
export function getFigureFileName({
    name,
    formula,
    width,
    height,
    backgroundId,
}: {
    name?: string | null;
    formula?: string | null;
    width: number;
    height: number;
    backgroundId?: string | null;
}) {
    const base = slugify(name || formula || "wave-figure");
    const background = getFigureBackground(backgroundId);
    const suffix = background.id === "viewer" ? "" : `-${background.id}`;
    return `${base}${suffix}-${width}x${height}.png`;
}
