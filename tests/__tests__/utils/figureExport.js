import expect from "expect";

import {
    DEFAULT_MAX_FIGURE_DIMENSION,
    describeFigureResolution,
    drawScaleBar,
    FIGURE_BACKGROUNDS,
    FIGURE_SIZE_PRESETS,
    getFigureBackground,
    getFigureFileName,
    getFigurePhysicalSize,
    getFigureResolution,
    getFigureSizePreset,
    getScaleBarLayout,
    getScaleBarPlan,
    MIN_FIGURE_DIMENSION,
} from "../../../src/utils/figureExport";

/**
 * Figure export arithmetic (U-12). The whole point of the feature is that the output size and scale
 * are stated rather than inherited, so these are the assertions that make the statement true.
 */

const VIEWPORT = { viewportWidth: 800, viewportHeight: 600 };

describe("getFigureResolution", () => {
    it("uses the canvas pixels for the on-screen preset", () => {
        expect(getFigureResolution({ presetId: "viewport", ...VIEWPORT })).toEqual({
            width: 800,
            height: 600,
            isClamped: false,
        });
    });

    it("keeps the canvas aspect ratio for every fixed-width preset", () => {
        FIGURE_SIZE_PRESETS.filter((preset) => preset.width).forEach((preset) => {
            const { width, height } = getFigureResolution({ presetId: preset.id, ...VIEWPORT });
            expect(width).toBe(preset.width);
            // 800/600 in, 4:3 out - a figure export that squashed the structure would be worse
            // than no figure export.
            expect(width / height).toBeCloseTo(800 / 600, 2);
        });
    });

    it("puts the column presets at the physical widths they advertise", () => {
        const single = getFigureResolution({ presetId: "single-column", ...VIEWPORT });
        const double = getFigureResolution({ presetId: "double-column", ...VIEWPORT });
        expect(getFigurePhysicalSize(single).widthMm).toBe(85);
        expect(getFigurePhysicalSize(double).widthMm).toBe(180);
        expect(getFigurePhysicalSize(single).dpi).toBe(300);
    });

    it("honours both custom dimensions, distortion included, since that is the user's call", () => {
        expect(
            getFigureResolution({
                presetId: "custom",
                customWidth: 1000,
                customHeight: 1000,
                ...VIEWPORT,
            }),
        ).toEqual({ width: 1000, height: 1000, isClamped: false });
    });

    it("scales an over-large request down proportionally rather than per-axis", () => {
        const result = getFigureResolution({
            presetId: "custom",
            customWidth: 20000,
            customHeight: 10000,
            maxDimension: 4096,
            ...VIEWPORT,
        });
        expect(result.isClamped).toBe(true);
        expect(result.width).toBe(4096);
        // Independent clamping would give 4096x4096 and silently change the aspect ratio.
        expect(result.width / result.height).toBeCloseTo(2, 2);
    });

    it("never returns a dimension below the legibility floor", () => {
        const result = getFigureResolution({
            presetId: "custom",
            customWidth: 1,
            customHeight: 1,
            ...VIEWPORT,
        });
        expect(result.width).toBeGreaterThanOrEqual(MIN_FIGURE_DIMENSION);
        expect(result.height).toBeGreaterThanOrEqual(MIN_FIGURE_DIMENSION);
    });

    it("falls back to 4:3 for an unmeasured container instead of dividing by zero", () => {
        const result = getFigureResolution({
            presetId: "double-column",
            viewportWidth: 0,
            viewportHeight: 0,
        });
        expect(Number.isFinite(result.width)).toBe(true);
        expect(result.width / result.height).toBeCloseTo(4 / 3, 2);
    });

    it("defaults to the conservative GL cap when none is supplied", () => {
        const result = getFigureResolution({
            presetId: "custom",
            customWidth: 99999,
            customHeight: 99999,
            ...VIEWPORT,
        });
        expect(result.width).toBe(DEFAULT_MAX_FIGURE_DIMENSION);
    });

    it("treats an unknown preset as the on-screen one rather than throwing", () => {
        expect(getFigureSizePreset("nonsense").id).toBe("viewport");
        expect(getFigureResolution({ presetId: "nonsense", ...VIEWPORT }).width).toBe(800);
    });
});

describe("describeFigureResolution", () => {
    it("states pixels and millimetres, since the real question is print sharpness", () => {
        expect(describeFigureResolution({ width: 2126, height: 1595 })).toBe(
            "2126 × 1595 px · 180 × 135 mm at 300 dpi",
        );
    });
});

describe("FIGURE_BACKGROUNDS", () => {
    it("leaves the viewer background alone and inverts chrome for the light ones", () => {
        expect(getFigureBackground("viewer").foregroundColor).toBeNull();
        // Cell edges are #CCCCCC and label text #EEEEEE: without an inversion a white-background
        // figure loses its unit cell and its labels entirely.
        expect(getFigureBackground("white").foregroundColor).toBeTruthy();
        expect(getFigureBackground("transparent").foregroundColor).toBeTruthy();
    });

    it("only makes the transparent option transparent", () => {
        const transparent = FIGURE_BACKGROUNDS.filter((option) => option.clearAlpha === 0);
        expect(transparent.map((option) => option.id)).toEqual(["transparent"]);
    });

    it("falls back to the viewer background for an unknown id", () => {
        expect(getFigureBackground(undefined).id).toBe("viewer");
        expect(getFigureBackground("chartreuse").id).toBe("viewer");
    });
});

describe("getScaleBarPlan", () => {
    it("picks a round number of Ångström near a fifth of the width", () => {
        // 0.02 Å/px over 1000 px = 20 Å across the image; a fifth of that is ~3.6 Å.
        const plan = getScaleBarPlan({ worldUnitsPerPixel: 0.02, imageWidth: 1000 });
        expect(plan.lengthAngstrom).toBe(5);
        expect(plan.label).toBe("5 Å");
        expect(plan.lengthPx).toBeCloseTo(250, 6);
    });

    it("scales the chosen length with the zoom level", () => {
        const zoomedOut = getScaleBarPlan({ worldUnitsPerPixel: 0.5, imageWidth: 1000 });
        const zoomedIn = getScaleBarPlan({ worldUnitsPerPixel: 0.002, imageWidth: 1000 });
        expect(zoomedOut.lengthAngstrom).toBeGreaterThan(zoomedIn.lengthAngstrom);
        expect(zoomedIn.label).toMatch(/Å$/);
    });

    it("only ever labels 1, 2 or 5 times a power of ten", () => {
        [0.001, 0.003, 0.007, 0.02, 0.09, 0.4, 3].forEach((worldUnitsPerPixel) => {
            const plan = getScaleBarPlan({ worldUnitsPerPixel, imageWidth: 1200 });
            if (!plan) return;
            const mantissa =
                plan.lengthAngstrom / 10 ** Math.floor(Math.log10(plan.lengthAngstrom));
            expect([1, 2, 5]).toContain(Math.round(mantissa));
        });
    });

    it("declines rather than guessing when the scale is unusable", () => {
        expect(getScaleBarPlan({ worldUnitsPerPixel: NaN, imageWidth: 1000 })).toBeNull();
        expect(getScaleBarPlan({ worldUnitsPerPixel: 0, imageWidth: 1000 })).toBeNull();
        expect(getScaleBarPlan({ worldUnitsPerPixel: -1, imageWidth: 1000 })).toBeNull();
        expect(getScaleBarPlan({ worldUnitsPerPixel: 0.02, imageWidth: 10 })).toBeNull();
    });

    it("never returns a bar wider than the image", () => {
        [1e-6, 1e-3, 1, 1e3].forEach((worldUnitsPerPixel) => {
            const plan = getScaleBarPlan({ worldUnitsPerPixel, imageWidth: 800 });
            if (plan) expect(plan.lengthPx).toBeLessThanOrEqual(800);
        });
    });
});

describe("getScaleBarLayout", () => {
    const plan = { lengthAngstrom: 5, lengthPx: 200, label: "5 Å" };

    it("keeps the bar and its label inside the image", () => {
        const layout = getScaleBarLayout({ plan, width: 1000, height: 750 });
        expect(layout.barX).toBeGreaterThan(0);
        expect(layout.barX + layout.barWidth).toBeLessThanOrEqual(1000);
        expect(layout.barY + layout.barHeight).toBeLessThanOrEqual(750);
        // The label sits above the bar, so its baseline is the smaller y.
        expect(layout.labelBaselineY).toBeLessThan(layout.barY);
    });

    it("scales the bar thickness and type size with the figure", () => {
        const small = getScaleBarLayout({ plan, width: 400, height: 300 });
        const large = getScaleBarLayout({ plan, width: 4000, height: 3000 });
        expect(large.fontSize).toBeGreaterThan(small.fontSize);
        expect(large.barHeight).toBeGreaterThan(small.barHeight);
        // A 300 px preview still needs a readable label, hence the floors.
        expect(small.fontSize).toBeGreaterThanOrEqual(10);
        expect(small.barHeight).toBeGreaterThanOrEqual(2);
    });

    it("trims a bar that would overrun the margins", () => {
        const layout = getScaleBarLayout({
            plan: { ...plan, lengthPx: 5000 },
            width: 1000,
            height: 750,
        });
        expect(layout.barWidth).toBeLessThanOrEqual(1000 - 2 * layout.margin);
    });
});

describe("drawScaleBar", () => {
    /** jsdom has no 2D context, and the assertions here are about geometry, not pixels. */
    function recordingContext() {
        const calls = [];
        return {
            calls,
            fillStyle: "",
            font: "",
            textAlign: "start",
            textBaseline: "alphabetic",
            save() {
                calls.push(["save"]);
            },
            restore() {
                calls.push(["restore"]);
            },
            fillRect(...args) {
                calls.push(["fillRect", ...args, this.fillStyle]);
            },
            fillText(...args) {
                calls.push(["fillText", ...args, this.fillStyle, this.font]);
            },
        };
    }

    const plan = { lengthAngstrom: 5, lengthPx: 200, label: "5 Å" };

    it("draws the bar and the label in the requested colour", () => {
        const context = recordingContext();
        drawScaleBar(context, plan, { width: 1000, height: 750, color: "#1A1A1A" });
        const rect = context.calls.find((call) => call[0] === "fillRect");
        const text = context.calls.find((call) => call[0] === "fillText");
        expect(rect[rect.length - 1]).toBe("#1A1A1A");
        expect(text[1]).toBe("5 Å");
        expect(text[text.length - 2]).toBe("#1A1A1A");
    });

    it("restores the context so the caller's own state survives", () => {
        const context = recordingContext();
        drawScaleBar(context, plan, { width: 1000, height: 750, color: "#FFFFFF" });
        expect(context.calls[0]).toEqual(["save"]);
        expect(context.calls[context.calls.length - 1]).toEqual(["restore"]);
    });

    it("returns the layout it drew, so a caller can reason about the space used", () => {
        const context = recordingContext();
        const layout = drawScaleBar(context, plan, {
            width: 1000,
            height: 750,
            color: "#1A1A1A",
        });
        expect(layout).toEqual(getScaleBarLayout({ plan, width: 1000, height: 750 }));
    });
});

describe("getFigureFileName", () => {
    it("names the file after the structure and the size rendered", () => {
        expect(
            getFigureFileName({
                name: "Silicon",
                width: 2126,
                height: 1595,
                backgroundId: "white",
            }),
        ).toBe("Silicon-white-2126x1595.png");
    });

    it("leaves the viewer background unsuffixed, being the default", () => {
        expect(getFigureFileName({ name: "Si", width: 800, height: 600 })).toBe("Si-800x600.png");
    });

    it("falls back from name to formula to a generic base", () => {
        expect(getFigureFileName({ formula: "SiGe", width: 10, height: 10 })).toContain("SiGe");
        expect(getFigureFileName({ width: 10, height: 10 })).toContain("wave-figure");
    });

    it("cannot produce a path from a structure name", () => {
        const fileName = getFigureFileName({
            name: "../../Si/Ge (001)",
            width: 100,
            height: 100,
        });
        expect(fileName).not.toContain("/");
        expect(fileName).not.toContain("..");
        expect(fileName.endsWith(".png")).toBe(true);
    });

    it("survives a name made entirely of separators", () => {
        expect(getFigureFileName({ name: "///", width: 100, height: 100 })).toBe(
            "structure-100x100.png",
        );
    });
});
