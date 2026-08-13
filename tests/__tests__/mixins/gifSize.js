import * as alerts from "@mat3ra/cove/dist/other/alerts";
import expect from "expect";

import * as mixinUtils from "../../../src/mixins/utils";
import {
    DEFAULT_GIF_SIDE_PX,
    getGifSide,
    MIN_FIGURE_DIMENSION,
} from "../../../src/utils/figureExport";
import { getWaveInstance } from "../../enums";
import { HEIGHT, WIDTH } from "../../utils";

/**
 * GIF output size.
 *
 * Recording took the canvas's own dimensions, so every GIF came out the shape of whoever's window
 * made it - wide, letterboxed wherever it was embedded, and clipping the structure at the extremes of
 * the rotation, because a turning structure sweeps through its own width. Reported from review of the
 * deploy preview: "must be restricted by the square canvas".
 */
describe("GIF output size", () => {
    describe("getGifSide", () => {
        it("defaults to the fixed square, not to anything about the window", () => {
            expect(getGifSide()).toBe(DEFAULT_GIF_SIDE_PX);
            expect(getGifSide({ requested: null })).toBe(DEFAULT_GIF_SIDE_PX);
        });

        it("honours an explicit size", () => {
            expect(getGifSide({ requested: 320 })).toBe(320);
        });

        it("clamps to what the graphics context can render", () => {
            expect(getGifSide({ requested: 20000, maxDimension: 2048 })).toBe(2048);
        });

        it("never goes below the legibility floor", () => {
            expect(getGifSide({ requested: 1 })).toBe(MIN_FIGURE_DIMENSION);
            expect(getGifSide({ requested: -5 })).toBe(DEFAULT_GIF_SIDE_PX);
        });
    });

    describe("createRotatingGifData", () => {
        let wave, gifCalls;

        beforeEach(() => {
            wave = getWaveInstance();
            if (!wave.orbitControls) wave.initOrbitControls(true);
            wave.renderer.domElement.toDataURL = () => "data:image/png;base64,FRAME";
            gifCalls = [];
            // Encoding is gifshot's job; what matters here is the geometry handed to it.
            jest.spyOn(mixinUtils, "createGIFAsync").mockImplementation(async (args) => {
                gifCalls.push(args);
                return "data:image/gif;base64,GIF";
            });
            jest.spyOn(alerts, "showInfoAlert").mockImplementation(() => {});
            jest.spyOn(alerts, "showWarningAlert").mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("records a square, whatever shape the viewer is", async () => {
            // The fixture canvas is 500x1000 - emphatically not square.
            expect(WIDTH).not.toBe(HEIGHT);
            await wave.createRotatingGifData({ totalFrames: 2 });
            expect(gifCalls).toHaveLength(1);
            expect(gifCalls[0].gifWidth).toBe(DEFAULT_GIF_SIDE_PX);
            expect(gifCalls[0].gifHeight).toBe(DEFAULT_GIF_SIDE_PX);
        });

        it("captures frames at that square, not merely labels them with it", async () => {
            const sizesAtCapture = [];
            wave.renderer.domElement.toDataURL = () => {
                sizesAtCapture.push(
                    `${wave.renderer.domElement.width}x${wave.renderer.domElement.height}`,
                );
                return "data:image/png;base64,FRAME";
            };
            await wave.createRotatingGifData({ totalFrames: 3 });
            expect(sizesAtCapture).toEqual([
                `${DEFAULT_GIF_SIDE_PX}x${DEFAULT_GIF_SIDE_PX}`,
                `${DEFAULT_GIF_SIDE_PX}x${DEFAULT_GIF_SIDE_PX}`,
                `${DEFAULT_GIF_SIDE_PX}x${DEFAULT_GIF_SIDE_PX}`,
            ]);
        });

        it("takes an explicit size when asked", async () => {
            await wave.createRotatingGifData({ totalFrames: 1, size: 256 });
            expect(gifCalls[0].gifWidth).toBe(256);
        });

        it("puts the viewer back at its own size afterwards", async () => {
            await wave.createRotatingGifData({ totalFrames: 2 });
            expect(wave.WIDTH).toBe(WIDTH);
            expect(wave.HEIGHT).toBe(HEIGHT);
            expect(wave.renderer.domElement.width).toBe(WIDTH);
            expect(wave.renderer.domElement.height).toBe(HEIGHT);
        });

        it("restores the size even when encoding throws", async () => {
            mixinUtils.createGIFAsync.mockImplementation(async () => {
                throw new Error("encode failed");
            });
            await expect(wave.createRotatingGifData({ totalFrames: 1 })).rejects.toThrow(
                "encode failed",
            );
            // The failure mode this guards against is a viewer left at 512x512 and still spinning.
            expect(wave.WIDTH).toBe(WIDTH);
            expect(wave.HEIGHT).toBe(HEIGHT);
            expect(wave.orbitControls.autoRotate).toBe(false);
        });

        it("declines while auto-rotate is already on, before touching the size", async () => {
            wave.orbitControls.autoRotate = true;
            expect(await wave.createRotatingGifData({ totalFrames: 1 })).toBeNull();
            expect(wave.WIDTH).toBe(WIDTH);
            expect(gifCalls).toHaveLength(0);
        });
    });
});
