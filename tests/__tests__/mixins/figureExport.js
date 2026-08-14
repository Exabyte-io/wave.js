import * as downloader from "@mat3ra/cove/dist/utils/downloader";
import expect from "expect";
import * as THREE from "three";

import { getWaveInstance } from "../../enums";
import { HEIGHT, WIDTH } from "../../utils";

/**
 * Figure export against a real Wave instance and a real GL context (U-12).
 *
 * PNG encoding is the browser's job, so `toDataURL` is stubbed - but stubbed in a way that records
 * the drawing buffer size and colour state *at the moment of capture*. That is the only way to show
 * the frame was rendered at the requested resolution and background rather than merely resized
 * afterwards, and it is what separates this from a screenshot of the canvas.
 */
describe("figure export", () => {
    let wave, captures;

    /** Colours of the objects the export is allowed to repaint: label sprites and chrome lines. */
    function collectChromeColors() {
        const colors = [];
        wave.scene.traverse((object) => {
            const isChrome = object.isSprite || object.isLine || object.isLineSegments;
            if (isChrome && object.material?.color) {
                colors.push(`#${object.material.color.getHexString()}`);
            }
        });
        return colors;
    }

    /**
     * Element colours, which carry meaning and must survive any background change untouched.
     * Scoped through the viewer's own definition of an atom rather than "every Mesh": the axes
     * indicator's arrowheads are Meshes sharing one white material with its lines, so they darken
     * with the rest of that widget - which is correct, and not what this is about.
     */
    function collectAtomColors() {
        return wave
            .collectSelectableAtoms()
            .map((atom) => `#${atom.material.color.getHexString()}`);
    }

    const stubCapture = () => {
        captures = [];
        wave.renderer.domElement.toDataURL = jest.fn(() => {
            const clearColor = new THREE.Color();
            wave.renderer.getClearColor(clearColor);
            captures.push({
                width: wave.renderer.domElement.width,
                height: wave.renderer.domElement.height,
                clearColor: `#${clearColor.getHexString()}`,
                clearAlpha: wave.renderer.getClearAlpha(),
                hasSceneBackground: Boolean(wave.scene.background),
                chromeColors: collectChromeColors(),
                atomColors: collectAtomColors(),
            });
            return "data:image/png;base64,STUB";
        });
    };

    beforeEach(() => {
        wave = getWaveInstance();
        stubCapture();
        // jest.mock cannot be used here: babel hoists the `require` for ../../enums above the
        // hoisted jest.mock call, so src/mixins/image.js closes over the real module while the test
        // file sees the mock - a green-looking assertion against a function nothing calls. Spying on
        // the namespace patches the object image.js actually reads through.
        jest.spyOn(downloader, "saveImageDataToFile").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("getFigureImage", () => {
        it("renders at the requested resolution, not the canvas one", () => {
            const dataUrl = wave.getFigureImage({ width: 1600, height: 1200 });
            expect(dataUrl).toBe("data:image/png;base64,STUB");
            expect(captures).toHaveLength(1);
            expect(captures[0].width).toBe(1600);
            expect(captures[0].height).toBe(1200);
        });

        it("puts the viewer back at its own size afterwards", () => {
            wave.getFigureImage({ width: 2126, height: 1595 });
            expect(wave.WIDTH).toBe(WIDTH);
            expect(wave.HEIGHT).toBe(HEIGHT);
            expect(wave.renderer.domElement.width).toBe(WIDTH);
            expect(wave.renderer.domElement.height).toBe(HEIGHT);
        });

        it("does not touch the canvas CSS size", () => {
            // The export changes the drawing buffer only. `setSize(w, h, true)` would also write the
            // export's pixel size into the element's style, leaving the on-screen canvas laid out at
            // figure resolution until the next container resize.
            const { style } = wave.renderer.domElement;
            const before = { width: style.width, height: style.height };
            wave.getFigureImage({ width: 1600, height: 1200 });
            expect({ width: style.width, height: style.height }).toEqual(before);
        });

        it("updates the camera aspect with the size, so a wide figure is not stretched", () => {
            const savedAspect = wave.perspectiveCamera.aspect;
            let aspectAtCapture = null;
            const originalToDataUrl = wave.renderer.domElement.toDataURL;
            wave.renderer.domElement.toDataURL = jest.fn(() => {
                aspectAtCapture = wave.perspectiveCamera.aspect;
                return originalToDataUrl();
            });
            wave.getFigureImage({ width: 2000, height: 500 });
            expect(aspectAtCapture).toBeCloseTo(4, 6);
            expect(wave.perspectiveCamera.aspect).toBeCloseTo(savedAspect, 6);
        });

        it("renders the white background as white and restores the viewer's own", () => {
            const savedClearColor = new THREE.Color();
            wave.renderer.getClearColor(savedClearColor);

            wave.getFigureImage({ width: 800, height: 600, background: "white" });

            expect(captures[0].clearColor).toBe("#ffffff");
            expect(captures[0].clearAlpha).toBe(1);
            expect(captures[0].hasSceneBackground).toBe(true);
            const restored = new THREE.Color();
            wave.renderer.getClearColor(restored);
            expect(restored.getHexString()).toBe(savedClearColor.getHexString());
        });

        it("clears with zero alpha and no scene background for a transparent figure", () => {
            wave.getFigureImage({ width: 800, height: 600, background: "transparent" });
            expect(captures[0].clearAlpha).toBe(0);
            // scene.background paints over the clear colour, so it has to be dropped as well or the
            // alpha channel never reaches the PNG.
            expect(captures[0].hasSceneBackground).toBe(false);
            expect(wave.scene.background).not.toBeNull();
        });

        it("inverts chrome for a light background and puts every colour back", () => {
            const before = collectChromeColors();
            // The cell wireframe (#cccccc) and the axes indicator (#ffffff) are both here, and both
            // would be invisible on a white page if left as they are.
            expect(before).toContain("#cccccc");
            expect(before).toContain("#ffffff");

            wave.getFigureImage({ width: 800, height: 600, background: "white" });

            // Every light achromatic object is dark at capture time...
            expect(captures[0].chromeColors.length).toBe(before.length);
            expect(new Set(captures[0].chromeColors)).toEqual(new Set(["#1a1a1a"]));
            // ...and back to exactly what it was afterwards.
            expect(collectChromeColors()).toEqual(before);
        });

        it("leaves a hued line alone, since hue is data rather than chrome", () => {
            // Boundary-condition lines are amber and blue by type; repainting them dark would
            // destroy the coding they exist to carry.
            const amber = new THREE.LineBasicMaterial({ color: 0xffc107 });
            const line = new THREE.Line(new THREE.BufferGeometry(), amber);
            line.name = "TestBoundaryLine";
            wave.scene.add(line);

            wave.getFigureImage({ width: 800, height: 600, background: "white" });

            expect(amber.color.getHexString()).toBe("ffc107");
            expect(captures[0].chromeColors).toContain("#ffc107");
        });

        it("leaves element colours alone, light background or not", () => {
            const before = collectAtomColors();
            expect(before.length).toBeGreaterThan(0);
            wave.getFigureImage({ width: 800, height: 600, background: "white" });
            expect(captures[0].atomColors).toEqual(before);
            expect(collectAtomColors()).toEqual(before);
        });

        it("touches nothing at all for the viewer background", () => {
            const before = collectChromeColors();
            wave.getFigureImage({ width: 800, height: 600, background: "viewer" });
            expect(captures[0].chromeColors).toEqual(before);
            expect(captures[0].clearAlpha).toBe(1);
        });

        it("restores size and colours even when the capture throws", () => {
            const before = collectChromeColors();
            // The viewer renders with alpha: true, so its own clear alpha is 0 and the dark
            // background comes from scene.background - captured rather than assumed.
            const clearAlphaBefore = wave.renderer.getClearAlpha();
            const sceneBackgroundBefore = wave.scene.background;
            wave.renderer.domElement.toDataURL = () => {
                throw new Error("capture failed");
            };

            expect(() =>
                wave.getFigureImage({ width: 4000, height: 3000, background: "white" }),
            ).toThrow("capture failed");

            // The failure mode this guards against is a viewer left white, huge and mis-coloured.
            expect(wave.WIDTH).toBe(WIDTH);
            expect(wave.HEIGHT).toBe(HEIGHT);
            expect(collectChromeColors()).toEqual(before);
            expect(wave.renderer.getClearAlpha()).toBe(clearAlphaBefore);
            expect(wave.scene.background).toBe(sceneBackgroundBefore);
        });

        it("pins the pixel ratio so the output is the pixel count asked for", () => {
            wave.renderer.setPixelRatio(2);
            wave.getFigureImage({ width: 1000, height: 800 });
            expect(captures[0].width).toBe(1000);
            expect(captures[0].height).toBe(800);
            expect(wave.renderer.getPixelRatio()).toBe(2);
        });

        it("treats an unknown background as the viewer one rather than failing", () => {
            expect(() =>
                wave.getFigureImage({ width: 800, height: 600, background: "chartreuse" }),
            ).not.toThrow();
            expect(captures[0].clearAlpha).toBe(1);
        });
    });

    describe("getWorldUnitsPerPixel", () => {
        it("reads the frustum directly for the orthographic camera", () => {
            wave.toggleOrthographicCamera();
            const { top, bottom, zoom } = wave.camera;
            expect(wave.getWorldUnitsPerPixel(600)).toBeCloseTo((top - bottom) / zoom / 600, 9);
        });

        it("halves with the zoom level", () => {
            wave.toggleOrthographicCamera();
            const atOneX = wave.getWorldUnitsPerPixel(600);
            wave.camera.zoom = 2;
            expect(wave.getWorldUnitsPerPixel(600)).toBeCloseTo(atOneX / 2, 9);
        });

        it("returns a positive finite scale for the perspective camera", () => {
            const scale = wave.getWorldUnitsPerPixel(600);
            expect(Number.isFinite(scale)).toBe(true);
            expect(scale).toBeGreaterThan(0);
        });

        it("halves when the image has twice the pixels", () => {
            expect(wave.getWorldUnitsPerPixel(1200)).toBeCloseTo(
                wave.getWorldUnitsPerPixel(600) / 2,
                9,
            );
        });

        it("refuses a zero-height image instead of returning Infinity", () => {
            expect(Number.isNaN(wave.getWorldUnitsPerPixel(0))).toBe(true);
            expect(Number.isNaN(wave.getWorldUnitsPerPixel(-10))).toBe(true);
        });

        /**
         * Cross-check against the camera's own projection: place two points a known distance apart
         * along the screen-vertical axis, project both, and see whether the reported scale predicts
         * the pixel gap. This is what makes the scale bar a measurement rather than a decoration -
         * every other assertion here would still pass if the formula were off by a constant factor.
         */
        const assertScaleMatchesProjection = (pixelHeight) => {
            const { camera } = wave;
            camera.updateMatrixWorld();
            const screenUp = new THREE.Vector3(0, 1, 0)
                .applyQuaternion(camera.quaternion)
                .normalize();
            const from = wave.orbitControls.target.clone();
            const to = from.clone().add(screenUp.multiplyScalar(2));
            const ndcGap = Math.abs(to.project(camera).y - from.project(camera).y);
            const pixelGap = (ndcGap * pixelHeight) / 2;
            expect(2 / pixelGap).toBeCloseTo(wave.getWorldUnitsPerPixel(pixelHeight), 6);
        };

        it("agrees with the orthographic projection over a known 2 Å separation", () => {
            wave.toggleOrthographicCamera();
            assertScaleMatchesProjection(900);
        });

        it("agrees with the perspective projection in the plane through the pivot", () => {
            assertScaleMatchesProjection(900);
        });
    });

    describe("getMaxFigureDimension", () => {
        it("reports a usable positive limit from the GL context", () => {
            const max = wave.getMaxFigureDimension();
            expect(Number.isFinite(max)).toBe(true);
            expect(max).toBeGreaterThanOrEqual(2048);
        });
    });

    describe("exportFigure", () => {
        it("downloads the rendered image under a name stating structure and size", () => {
            const fileName = wave.exportFigure({
                width: 1600,
                height: 1200,
                background: "white",
            });
            expect(fileName).toMatch(/-white-1600x1200\.png$/);
            expect(downloader.saveImageDataToFile).toHaveBeenCalledWith(
                "data:image/png;base64,STUB",
                fileName,
            );
        });

        it("names a viewer-background export without a background suffix", () => {
            const fileName = wave.exportFigure({ width: 800, height: 600 });
            expect(fileName).toMatch(/-800x600\.png$/);
            expect(fileName).not.toContain("viewer");
        });
    });

    describe("composeFigureWithScaleBar", () => {
        let originalGetContext;

        beforeEach(() => {
            originalGetContext = HTMLCanvasElement.prototype.getContext;
        });

        afterEach(() => {
            HTMLCanvasElement.prototype.getContext = originalGetContext;
        });

        /** jsdom has no 2D canvas; this records what the compositing step would have drawn. */
        function install2DRecorder() {
            const recorder = {
                calls: [],
                fillStyle: "",
                font: "",
                textAlign: "start",
                textBaseline: "alphabetic",
                save() {},
                restore() {},
                drawImage(...args) {
                    this.calls.push(["drawImage", args[1], args[2], args[3], args[4]]);
                },
                fillRect(...args) {
                    this.calls.push(["fillRect", ...args]);
                },
                fillText(...args) {
                    this.calls.push(["fillText", ...args]);
                },
            };
            HTMLCanvasElement.prototype.getContext = function getContext(type, ...rest) {
                if (type === "2d") return recorder;
                return originalGetContext.call(this, type, ...rest);
            };
            return recorder;
        }

        it("composites the frame and draws a labelled bar over it", () => {
            const recorder = install2DRecorder();
            wave.toggleOrthographicCamera(); // exact scale, so the label is a real measurement
            wave.getFigureImage({
                width: 1200,
                height: 900,
                background: "white",
                includeScaleBar: true,
            });

            const drawn = recorder.calls.find((call) => call[0] === "drawImage");
            expect(drawn).toEqual(["drawImage", 0, 0, 1200, 900]);
            const text = recorder.calls.find((call) => call[0] === "fillText");
            expect(text[1]).toMatch(/^[\d.]+ Å$/);
            expect(recorder.calls.some((call) => call[0] === "fillRect")).toBe(true);
        });

        it("returns the plain frame when there is no honest scale to draw", () => {
            install2DRecorder();
            // A zero-length camera-to-target distance leaves the perspective scale undefined.
            wave.camera.position.copy(wave.orbitControls.target);
            const dataUrl = wave.getFigureImage({
                width: 1200,
                height: 900,
                includeScaleBar: true,
            });
            expect(dataUrl).toBe("data:image/png;base64,STUB");
        });
    });
});
