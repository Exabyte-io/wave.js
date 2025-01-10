import gifshot from "gifshot";
import * as THREE from "three";

export const UtilsMixin = (superclass) =>
    class extends superclass {
        // toggles a boolean variable and optionally sets all variables in the antagonists array to the opposite value
        toggleBoolean(name, antagonistNames = []) {
            this[name] = !this[name];
            // disable all antagonists when `name` variable is set to true
            const currentValue = this[name];
            if (currentValue && antagonistNames.length) {
                antagonistNames.forEach((antagonistName) => {
                    this[antagonistName] = !currentValue;
                });
            }
        }

        // eslint-disable-next-line class-methods-use-this
        areTwoObjectsShallowEqual(o1, o2) {
            return Object.keys(o1)
                .map((key) => o1[key] === o2[key])
                .reduce((a, b) => a && b);
        }

        // eslint-disable-next-line class-methods-use-this
        getTwoObjectsShallowDifferentKeys(o1, o2) {
            const resultingObject = {};
            const differentKeysArray = Object.keys(o1).filter((key) => o1[key] !== o2[key]);
            differentKeysArray.forEach((key) => (resultingObject[key] = true));
            return resultingObject;
        }
    };

/**
 * Applies glow to a THREE object.
 * @param meshObjet {Object}: THREE mesh object.
 * @param baseColor {String}: hex color string of the glow
 * @param offset {Number}: can be a single digit number, 0 means no offset
 */
export const ApplyGlow = (meshObjet, baseColor, offset = 0) => {
    const atomHSL = {};
    new THREE.Color(baseColor).getHSL(atomHSL);
    let hue, saturation;
    if (offset !== 0) {
        if (offset % 2 === 0) {
            // even labels
            hue = atomHSL.h + (offset * 0.1) / 2;
            saturation = atomHSL.s + (offset * 0.1) / 2;
        } else {
            // odd labels
            hue = atomHSL.h - ((offset + 1) * 0.1) / 2;
            saturation = atomHSL.s + ((offset + 1) * 0.1) / 2;
        }

        // hue is cyclic
        while (hue > 1) {
            hue -= 1;
        }

        while (hue < 0) {
            hue += 1;
        }

        saturation = Math.max(0, Math.min(1, saturation));
        meshObjet.material.emissiveIntensity = 0.25;
        meshObjet.material.emissive.setHSL(hue, saturation, atomHSL.l);
    }
};

export function createRotatingGif(wave, options = {}) {
    const ROTATION_SPEED = options.rotationSpeed || 60; // RPM
    const frameDuration = options.frameDuration || 0.05; // seconds
    const sampleInterval = ROTATION_SPEED * frameDuration;
    const canvas = wave.renderer.domElement;
    const frames = [];
    let frameCount = 0;
    const totalFrames = ROTATION_SPEED;
    const { width } = canvas;
    const { height } = canvas;

    // Store original auto-rotate settings
    const wasAutoRotating = wave.orbitControls.autoRotate;
    const originalSpeed = wave.orbitControls.autoRotateSpeed;

    // Enable rotation
    wave.orbitControls.autoRotate = true;
    wave.orbitControls.autoRotateSpeed = ROTATION_SPEED;

    return new Promise((resolve, reject) => {
        const captureFrame = () => {
            wave.render();
            frames.push(canvas.toDataURL("image/png"));
            console.log(`Captured frame ${frameCount + 1}/${totalFrames}`);
        };

        const createGif = () => {
            console.log("Creating GIF from frames...");
            // Restore original rotation settings
            wave.orbitControls.autoRotateSpeed = originalSpeed;
            wave.orbitControls.autoRotate = wasAutoRotating;

            gifshot.createGIF(
                {
                    images: frames,
                    gifWidth: width,
                    gifHeight: height,
                    numFrames: totalFrames,
                    frameDuration,
                    sampleInterval,
                    progressCallback: (progress) => {
                        console.log(`GIF Progress: ${Math.round(progress * 100)}%`);
                    },
                },
                (result) => {
                    frames.length = 0; // Clear frames array
                    if (!result.error) {
                        resolve(result.image);
                    } else {
                        reject(new Error(result.error));
                    }
                },
            );
        };

        const animate = () => {
            if (frameCount < totalFrames) {
                wave.orbitControls.update();
                captureFrame();
                frameCount += 1;
                requestAnimationFrame(animate);
            } else {
                createGif();
            }
        };

        console.log("Starting GIF recording...");
        animate();
    });
}
