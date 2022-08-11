import * as THREE from "three";

export const DEFAULT_LABEL_MATERIALS_CONFIG = Object.freeze({
    size: 1.5,
    depthTest: true,
    depthFunc: THREE.NotEqualDepth,
    transparent: true,
});
