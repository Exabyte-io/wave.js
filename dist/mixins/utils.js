"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UtilsMixin = exports.ApplyGlow = void 0;
exports.createRotatingGif = createRotatingGif;
var _gifshot = _interopRequireDefault(require("gifshot"));
var THREE = _interopRequireWildcard(require("three"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const UtilsMixin = superclass => class extends superclass {
  // toggles a boolean variable and optionally sets all variables in the antagonists array to the opposite value
  toggleBoolean(name, antagonistNames = []) {
    this[name] = !this[name];
    // disable all antagonists when `name` variable is set to true
    const currentValue = this[name];
    if (currentValue && antagonistNames.length) {
      antagonistNames.forEach(antagonistName => {
        this[antagonistName] = !currentValue;
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  areTwoObjectsShallowEqual(o1, o2) {
    return Object.keys(o1).map(key => o1[key] === o2[key]).reduce((a, b) => a && b);
  }

  // eslint-disable-next-line class-methods-use-this
  getTwoObjectsShallowDifferentKeys(o1, o2) {
    const resultingObject = {};
    const differentKeysArray = Object.keys(o1).filter(key => o1[key] !== o2[key]);
    differentKeysArray.forEach(key => resultingObject[key] = true);
    return resultingObject;
  }
};

/**
 * Applies glow to a THREE object.
 * @param meshObjet {Object}: THREE mesh object.
 * @param baseColor {String}: hex color string of the glow
 * @param offset {Number}: can be a single digit number, 0 means no offset
 */
exports.UtilsMixin = UtilsMixin;
const ApplyGlow = (meshObjet, baseColor, offset = 0) => {
  const atomHSL = {};
  new THREE.Color(baseColor).getHSL(atomHSL);
  let hue, saturation;
  if (offset !== 0) {
    if (offset % 2 === 0) {
      // even labels
      hue = atomHSL.h + offset * 0.1 / 2;
      saturation = atomHSL.s + offset * 0.1 / 2;
    } else {
      // odd labels
      hue = atomHSL.h - (offset + 1) * 0.1 / 2;
      saturation = atomHSL.s + (offset + 1) * 0.1 / 2;
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
exports.ApplyGlow = ApplyGlow;
function createGIFAsync(options) {
  return new Promise((resolve, reject) => {
    _gifshot.default.createGIF(options, obj => {
      if (!obj.error) {
        resolve(obj.image); // Resolve with the GIF data URL
      } else {
        reject(obj.error); // Reject with the error
      }
    });
  });
}
async function createRotatingGif(wave, options = {}) {
  const ROTATION_SPEED = options.rotationSpeed || 60; // RPM
  const frameDuration = options.frameDuration || 0.05; // seconds
  const sampleInterval = ROTATION_SPEED * frameDuration;
  const canvas = wave.renderer.domElement;
  const frames = [];
  let frameCount = 0;
  const totalFrames = ROTATION_SPEED;
  const {
    width
  } = canvas;
  const {
    height
  } = canvas;

  // Store original auto-rotate settings
  const wasAutoRotating = wave.orbitControls.autoRotate;
  const originalSpeed = wave.orbitControls.autoRotateSpeed;

  // Enable rotation
  wave.orbitControls.autoRotate = true;
  wave.orbitControls.autoRotateSpeed = ROTATION_SPEED;
  const captureFrame = () => {
    wave.render();
    frames.push(canvas.toDataURL("image/png"));
  };
  const createGif = async () => {
    console.log("Creating GIF from frames...");
    // Restore original rotation settings
    wave.orbitControls.autoRotateSpeed = originalSpeed;
    wave.orbitControls.autoRotate = wasAutoRotating;
    return createGIFAsync({
      images: frames,
      gifWidth: width,
      gifHeight: height,
      numFrames: totalFrames,
      frameDuration,
      sampleInterval
    });
  };
  const animate = async () => {
    if (frameCount < totalFrames) {
      wave.orbitControls.update();
      captureFrame();
      frameCount += 1;
      requestAnimationFrame(animate);
    } else {
      await createGif();
    }
  };
  await animate();
}