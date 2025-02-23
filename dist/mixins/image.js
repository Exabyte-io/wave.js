import { saveImageDataToFile } from "@exabyte-io/cove.js/dist/utils/downloader";
import { createGIFAsync } from "./utils";
/*
 * Mixin containing the logic for dealing with the images, GIFs.
 */
export const ImageMixin = (superclass) => class extends superclass {
    takeScreenshot() {
        saveImageDataToFile(this.getScreenshotImage());
    }
    getScreenshotImage() {
        const canvas = this.renderer.domElement;
        canvas.getContext("2d", { willReadFrequently: true });
        return canvas.toDataURL("image/png");
    }
    async createRotatingGifData(options = {}) {
        const sampleInterval = options.sampleInterval || 20; // parts of image in pixels
        const totalGifDuration = options.totalDuration || 3; // seconds
        const animationDuration = options.animationDuration || 1; // seconds
        const FPS = 60; // frames per second
        const animationFrames = FPS * animationDuration;
        const totalGifFrames = animationFrames;
        const autoRotateSpeed = FPS / animationDuration; // RPM
        const frameDuration = totalGifDuration / totalGifFrames;
        // const animationStep = animationDuration / totalFrames;
        const canvas = this.renderer.domElement;
        canvas.willReadFrequently = true;
        const { width, height } = canvas;
        if (this.orbitControls.autoRotate) {
            alert("Please disable auto-rotation before creating a GIF.");
            return;
        }
        // Store original auto-rotate settings
        const originalSpeed = this.orbitControls.autoRotateSpeed;
        this.orbitControls.autoRotateSpeed = autoRotateSpeed;
        this.orbitControls.autoRotate = true;
        const frames = [];
        for (let i = 0; i < animationFrames; i += 1) {
            this.performOrbitControlsAnimation(() => frames.push(this.getScreenshotImage()));
        }
        const gifData = await createGIFAsync({
            // ...options,
            images: frames,
            gifWidth: width,
            gifHeight: height,
            sampleInterval,
            frameDuration,
        });
        this.orbitControls.rotateSpeed = originalSpeed;
        this.orbitControls.autoRotate = false;
        canvas.willReadFrequently = false;
        return gifData;
    }
    async takeGifScreenshot(options = {}) {
        const gifDataUrl = await this.createRotatingGifData(options);
        const fileName = this._structure.name || this._structure.formula || "wave-visualization" + ".gif";
        saveImageDataToFile(gifDataUrl, fileName);
    }
};
