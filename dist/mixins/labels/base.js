var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BaseLabelsManager_THREETexturesCache;
import * as THREE from "three";
import settings from "../../settings";
import { BaseTHREEGroupManager } from "../base";
export class BaseLabelsManager extends BaseTHREEGroupManager {
    constructor() {
        super(...arguments);
        this.labelType = "";
        _BaseLabelsManager_THREETexturesCache.set(this, {});
    }
    getOffsetVectorMultiplierPerAtomName(atomName) {
        if (!atomName)
            return 1;
        return this.wave.getAtomRadiusByElement(atomName.split("-")[0]);
    }
    getVectorToCameraNormalized(position, camera) {
        const vectorToCamera = new THREE.Vector3().subVectors(camera.position, position);
        vectorToCamera.normalize();
        return vectorToCamera;
    }
    getOffsetVector(position, camera, offsetLength = 1) {
        const vectorToCamera = this.getVectorToCameraNormalized(position, camera);
        const constantOffset = new THREE.Vector3(...(this.config.offsetVector || [0, 0, 0]));
        vectorToCamera.multiplyScalar(offsetLength);
        vectorToCamera.add(constantOffset);
        return vectorToCamera;
    }
    getNameForLabel(text) {
        return `${this.labelType}-label-for-${text}`;
    }
    createLabelTextTexture(text) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d") || new CanvasRenderingContext2D();
        const canvasWidth = 256 * this.config.scaleWidth;
        const canvasHeight = 256 * this.config.scaleHeight;
        Object.assign(canvas, {
            width: canvasWidth,
            height: canvasHeight,
        });
        Object.assign(context, {
            font: `${this.config.fontWeight} ${this.config.fontSize}px ${this.config.fontFace}`,
            ...this.config.textParameters,
        });
        context.fillText(text, canvasWidth / 2, canvasHeight / 2);
        context.strokeText(text, canvasWidth / 2, canvasHeight / 2);
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
    getLabelTextTexture(text) {
        if (__classPrivateFieldGet(this, _BaseLabelsManager_THREETexturesCache, "f")[text])
            return __classPrivateFieldGet(this, _BaseLabelsManager_THREETexturesCache, "f")[text];
        const texture = this.createLabelTextTexture(text);
        __classPrivateFieldGet(this, _BaseLabelsManager_THREETexturesCache, "f")[text] = texture;
        return texture;
    }
    /**
     * Creates a sprite with a label text
     */
    createLabelSprite(text, name) {
        const spriteMaterial = new THREE.SpriteMaterial({
            map: this.getLabelTextTexture(text),
            ...settings.labelSpriteConfig,
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.name = name;
        // TODO: remove - scale this inside  createLabelTextTexture
        const scaleX = this.config.scaleWidth || this.config.scale || 1;
        const scaleY = this.config.scaleHeight || this.config.scale || 1;
        sprite.scale.set(scaleX, scaleY, 1);
        return sprite;
    }
    /**
     * Creates and positions multiple labels as sprites
     * More flexible but less performant than Points for many labels
     */
    createLabelsAsSprites(verticesHashMap, threeGroup = this.THREEGroup) {
        threeGroup.clear();
        verticesHashMap.iterateCoordinates((key, coordinateAsArray) => {
            const position = new THREE.Vector3().fromArray(coordinateAsArray);
            const name = this.getNameForLabel(key);
            const labelSprite = this.createLabelSprite(key, name);
            labelSprite.userData = { position };
            labelSprite.position.copy(this.getLabelPositionWithOffset(position, key));
            threeGroup.add(labelSprite);
        });
    }
    createLabels(atoms, threeGroup = this.THREEGroup) {
        const verticesHashMap = this.wave.createAtomVerticesHashMap(this.getLabelTextFromLabeledObject, atoms);
        if (this.config.areSpritesUsed) {
            this.createLabelsAsSprites(verticesHashMap, threeGroup);
        }
        else {
            throw new Error("Labels as points are not implemented yet");
        }
        // Only add to structureGroup if not already added
        if (!this.waveStructureGroup.children.includes(threeGroup)) {
            this.waveStructureGroup.add(threeGroup);
        }
    }
    getLabelPositionWithOffset(position, atomName) {
        const offsetLength = this.getOffsetVectorMultiplierPerAtomName(atomName);
        const offsetVector = this.getOffsetVector(position, this.waveCamera, offsetLength);
        return position.clone().add(offsetVector);
    }
    /**
     * Adjusts labels to camera position. Applied to labels of a specific type.
     */
    adjustLabelsToCameraPosition() {
        if (!this.isVisible || !this.config.areSpritesUsed)
            return;
        this.THREEGroup.children.forEach((label) => {
            const { position, atomName } = label.userData;
            label.position.copy(this.getLabelPositionWithOffset(position, atomName));
            label.lookAt(this.waveCamera.position);
        });
    }
}
_BaseLabelsManager_THREETexturesCache = new WeakMap();
