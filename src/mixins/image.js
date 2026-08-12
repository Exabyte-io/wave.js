import { showInfoAlert, showSuccessAlert, showWarningAlert } from "@mat3ra/cove/dist/other/alerts";
import { saveImageDataToFile } from "@mat3ra/cove/dist/utils/downloader";
import * as THREE from "three";

import {
    DEFAULT_MAX_FIGURE_DIMENSION,
    drawScaleBar,
    getFigureBackground,
    getFigureFileName,
    getScaleBarPlan,
} from "../utils/figureExport";
import { createGIFAsync } from "./utils";

/**
 * Whether a line's colour is viewer chrome rather than data, for figure export (U-12).
 *
 * The rule is "light and achromatic": the unit cell is `#CCCCCC` and the axes indicator is
 * `#FFFFFF`, both drawn to be seen against the dark viewer and both invisible on a white page.
 * Anything with a hue is carrying meaning - boundary-condition lines are amber and blue by type -
 * and anything dark already reads on a light background, so neither is touched. A property of the
 * colour rather than a list of objects, so a new piece of chrome inherits it.
 */
function isChromeLineColor(color) {
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl);
    return hsl.s < 0.05 && hsl.l > 0.6;
}

export const ImageMixin = (superclass) =>
    class extends superclass {
        takeScreenshot() {
            saveImageDataToFile(this.getScreenshotImage());
        }

        getScreenshotImage() {
            // Reading back the canvas relies on the renderer being constructed with
            // preserveDrawingBuffer: true (see WaveBase.initRenderer). There was a
            // getContext("2d", { willReadFrequently: true }) call here, which returns null on a
            // canvas that already holds a WebGL context and therefore did nothing at all.
            return this.renderer.domElement.toDataURL("image/png");
        }

        /**
         * Largest drawing buffer this GL context will actually render, so an over-large request is
         * scaled down before it becomes a blank image rather than after.
         */
        getMaxFigureDimension() {
            try {
                const gl = this.renderer.getContext();
                const limits = [
                    gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
                    gl.getParameter(gl.MAX_TEXTURE_SIZE),
                    ...(gl.getParameter(gl.MAX_VIEWPORT_DIMS) || []),
                ].filter((value) => Number.isFinite(value) && value > 0);
                return limits.length ? Math.min(...limits) : DEFAULT_MAX_FIGURE_DIMENSION;
            } catch (error) {
                return DEFAULT_MAX_FIGURE_DIMENSION;
            }
        }

        /**
         * World units (Ångström) spanned by one image pixel, which is what a scale bar needs.
         *
         * Exact for the orthographic camera. For the perspective camera it is exact only in the
         * plane through the orbit target, since a perspective projection has no single scale - the
         * export dialog says so rather than presenting an approximation as a measurement.
         */
        getWorldUnitsPerPixel(pixelHeight) {
            if (!(pixelHeight > 0)) return NaN;
            const { camera } = this;
            const zoom = camera.zoom || 1;
            if (camera.isOrthographicCamera) {
                return (camera.top - camera.bottom) / zoom / pixelHeight;
            }
            const target = this.orbitControls?.target || new THREE.Vector3();
            const distance = camera.position.distanceTo(target);
            const visibleHeight = 2 * distance * Math.tan(((camera.fov / 2) * Math.PI) / 180);
            return visibleHeight / zoom / pixelHeight;
        }

        /**
         * Recolours the viewer's chrome - text label sprites and chrome-coloured lines - and returns
         * a function restoring every colour it changed.
         *
         * Atoms are Meshes, so element colours are left alone by construction. Label sprites hold
         * near-white text in their texture, so multiplying by the target through `material.color`
         * recolours the glyphs without redrawing any texture.
         */
        applyFigureForeground(color) {
            const target = new THREE.Color(color);
            const originalColors = new Map();

            this.scene.traverse((object) => {
                const isLabelSprite = Boolean(object.isSprite);
                const isLine = Boolean(object.isLine || object.isLineSegments);
                if (!isLabelSprite && !isLine) return;
                const materials = Array.isArray(object.material)
                    ? object.material
                    : [object.material];
                materials.forEach((material) => {
                    // Keyed by material because line materials are shared between segments:
                    // recording the same one twice would restore it to the export colour.
                    if (!material || !material.color || originalColors.has(material)) return;
                    if (isLine && !isChromeLineColor(material.color)) return;
                    originalColors.set(material, material.color.clone());
                    material.color.copy(target);
                });
            });

            return () => {
                originalColors.forEach((originalColor, material) => {
                    material.color.copy(originalColor);
                });
            };
        }

        /**
         * Renders the scene once at an explicit size and background and returns a PNG data URL,
         * leaving the on-screen viewer exactly as it was.
         *
         * Chrome is excluded for free: this reads the WebGL canvas, and the toolbars, status bar and
         * inspector are DOM siblings of it, not part of the scene.
         *
         * @param width {Number} output width in pixels
         * @param height {Number} output height in pixels
         * @param background {String} a FigureBackgroundId - "viewer", "white" or "transparent"
         * @param includeScaleBar {Boolean} draw a scale bar into the bottom-left corner
         */
        getFigureImage({ width, height, background = "viewer", includeScaleBar = false } = {}) {
            const backgroundOption = getFigureBackground(background);
            const { renderer } = this;
            const savedClearColor = new THREE.Color();
            renderer.getClearColor(savedClearColor);
            const saved = {
                width: this.WIDTH,
                height: this.HEIGHT,
                pixelRatio: renderer.getPixelRatio(),
                clearAlpha: renderer.getClearAlpha(),
                sceneBackground: this.scene.background,
                fogColor: this.scene.fog ? this.scene.fog.color.clone() : null,
            };
            let restoreForeground = null;

            try {
                if (backgroundOption.foregroundColor) {
                    restoreForeground = this.applyFigureForeground(
                        backgroundOption.foregroundColor,
                    );
                }
                // scene.background paints over the clear colour, so both have to move together -
                // setting only the clear colour produces the viewer's dark grey regardless.
                this.scene.background =
                    backgroundOption.clearAlpha === 0
                        ? null
                        : new THREE.Color(backgroundOption.clearColor);
                if (this.scene.fog) this.scene.fog.color.set(backgroundOption.clearColor);
                renderer.setClearColor(backgroundOption.clearColor, backgroundOption.clearAlpha);
                // Pinned to 1 so the output is the requested pixel count on a HiDPI display too.
                renderer.setPixelRatio(1);
                this.setViewportSize(width, height, false);

                return includeScaleBar
                    ? this.composeFigureWithScaleBar({ width, height, backgroundOption })
                    : this.getScreenshotImage();
            } finally {
                if (restoreForeground) restoreForeground();
                this.scene.background = saved.sceneBackground;
                if (this.scene.fog && saved.fogColor) this.scene.fog.color.copy(saved.fogColor);
                renderer.setClearColor(savedClearColor, saved.clearAlpha);
                renderer.setPixelRatio(saved.pixelRatio);
                this.setViewportSize(saved.width, saved.height, false);
            }
        }

        /**
         * Copies the rendered frame onto a 2D canvas and draws the scale bar there. Drawing it into
         * the scene instead would make it a 3D object subject to the projection - it has to be a
         * fixed number of image pixels to mean anything.
         */
        composeFigureWithScaleBar({ width, height, backgroundOption }) {
            const plan = getScaleBarPlan({
                worldUnitsPerPixel: this.getWorldUnitsPerPixel(height),
                imageWidth: width,
            });
            if (!plan) return this.getScreenshotImage();

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            // No 2D context means no compositing is possible; the frame itself is still correct, so
            // return it rather than failing the export over an annotation.
            if (!context) return this.getScreenshotImage();

            context.drawImage(this.renderer.domElement, 0, 0, width, height);
            drawScaleBar(context, plan, {
                width,
                height,
                // Dark chrome on a light page, light chrome on the viewer's own dark background.
                color: backgroundOption.foregroundColor || "#EEEEEE",
            });
            return canvas.toDataURL("image/png");
        }

        /** Renders a figure and downloads it, named after the structure and the size used. */
        exportFigure(options = {}) {
            const dataUrl = this.getFigureImage(options);
            const fileName = getFigureFileName({
                name: this._structure?.name,
                formula: this._structure?.formula,
                width: options.width,
                height: options.height,
                backgroundId: options.background,
            });
            saveImageDataToFile(dataUrl, fileName);
            return fileName;
        }

        async updateScene() {
            return new Promise((resolve) => {
                const checkRender = () => {
                    this.renderer.render(this.scene, this.camera); // Ensure scene updates
                    requestAnimationFrame(() => resolve()); // Wait for the next frame
                };
                checkRender();
            });
        }

        async createRotatingGifData(options = {}) {
            const sampleInterval = options.sampleInterval || 20; // Parts of image in pixels
            const totalGifDuration = options.totalDuration || 3; // Seconds
            const animationDuration = options.animationDuration || 1; // Seconds
            const totalFrames = options.totalFrames || 60; // Number of frames in GIF

            const autoRotateSpeed = 60 / animationDuration; // RPM
            const frameDuration = totalGifDuration / totalFrames;

            // `canvas.willReadFrequently = true/false` used to be set around this block;
            // willReadFrequently is a getContext() attribute, not a canvas property, so those
            // assignments only added an inert expando.
            const canvas = this.renderer.domElement;
            const { width, height } = canvas;

            if (this.orbitControls.autoRotate) {
                showWarningAlert("Please disable auto-rotation before creating a GIF.");
                return null;
            }

            // Store original auto-rotate settings
            const originalSpeed = this.orbitControls.autoRotateSpeed;
            this.orbitControls.autoRotateSpeed = autoRotateSpeed;
            this.orbitControls.autoRotate = true;

            // try/finally so a throw mid-capture cannot leave the viewer spinning: the restore
            // below used to be plain trailing statements, so any failure in frame capture or
            // GIF encoding left autoRotate on at the modified speed for the rest of the session.
            try {
                const frames = [];

                for (let i = 0; i < totalFrames; i += 1) {
                    this.orbitControls.update(); // Move scene to new position
                    // eslint-disable-next-line no-await-in-loop
                    await this.updateScene(); // Wait for rendering to finish
                    frames.push(this.getScreenshotImage()); // Capture screenshot
                }

                showInfoAlert("GIF is being created. Please wait...");

                return await createGIFAsync({
                    images: frames,
                    gifWidth: width,
                    gifHeight: height,
                    sampleInterval,
                    frameDuration,
                });
            } finally {
                // Restore original rotation settings
                this.orbitControls.autoRotateSpeed = originalSpeed;
                this.orbitControls.autoRotate = false;
            }
        }

        async takeGifScreenshot(options = {}) {
            const gifDataUrl = await this.createRotatingGifData(options);

            if (!gifDataUrl) return;

            const fileName =
                (this._structure.name || this._structure.formula || "wave-visualization") + ".gif";

            showSuccessAlert("GIF is created. Proceeding to download.");

            saveImageDataToFile(gifDataUrl, fileName);
        }
    };
