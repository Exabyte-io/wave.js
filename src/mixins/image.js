import { showInfoAlert, showSuccessAlert, showWarningAlert } from "@mat3ra/cove/dist/other/alerts";
import { saveImageDataToFile } from "@mat3ra/cove/dist/utils/downloader";

import { createGIFAsync } from "./utils";

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
