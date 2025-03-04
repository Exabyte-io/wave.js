import * as THREE from "three";

import settings from "../../settings";
import { VerticesHashMapHandler } from "../atoms";
import { BaseTHREEGroupManager } from "../base";

export type LabelsManagerConstructor<T extends BaseLabelsManager> = new (
    waveStructureGroup: THREE.Group,
    waveCamera: THREE.Camera,
    wave: any,
) => T;

export class BaseLabelsManager extends BaseTHREEGroupManager {
    labelType = "";

    #THREETexturesCache: { [key: string]: THREE.Texture } = {};

    getLabelTextFromAtomObject: any;

    getConstantOffsetVector() {
        return this.config.offsetVector || [0, 0, 0];
    }

    getOffsetVectorMultiplierPerAtomName(atomName: string) {
        if (!atomName) return 1;
        return this.wave.getAtomRadiusByElement(atomName.split("-")[0]);
    }

    getVectorToCameraNormalized(position: THREE.Vector3, camera: THREE.Camera) {
        const vectorToCamera = new THREE.Vector3().subVectors(camera.position, position);
        vectorToCamera.normalize();
        return vectorToCamera;
    }

    getOffsetVector(position: THREE.Vector3, camera: THREE.Camera, offsetLength = 1) {
        const vectorToCamera = this.getVectorToCameraNormalized(position, camera);
        const constantOffset = new THREE.Vector3(...this.getConstantOffsetVector());

        vectorToCamera.multiplyScalar(offsetLength);
        vectorToCamera.add(constantOffset);

        return vectorToCamera;
    }

    getNameForLabel(text: string) {
        return `${this.labelType}-label-for-${text}`;
    }

    toggleLabelsVisibility() {
        this.toggleVisibility();
    }

    /**
     * Creates a new texture based on a 2D canvas with the supplied text
     * @param {String} text - the text to be placed on the texture;
     * @param {Object} config - additional options for the texture (scaleWidth, scaleHeight, etc.)
     * @return {THREE.Texture}
     */
    createLabelTextTexture(text: string) {
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

    /**
     * Returns cached or newly created texture with label text
     * @return {THREE.Texture}
     */
    getLabelTextTexture(text: string) {
        if (this.#THREETexturesCache[text]) return this.#THREETexturesCache[text];

        const texture = this.createLabelTextTexture(text);
        this.#THREETexturesCache[text] = texture;
        return texture;
    }

    /**
     * Creates a sprite with a label text
     */
    createLabelSprite(text: string, name: string) {
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
    createLabelsAsSprites(verticesHashMap: VerticesHashMapHandler, threeGroup = this.THREEGroup) {
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

    createLabels(atoms: any, threeGroup = this.THREEGroup) {
        const verticesHashMap = this.wave.createAtomVerticesHashMap(
            this.getLabelTextFromAtomObject || null,
            atoms,
        );
        if (this.config.areSpritesUsed) {
            this.createLabelsAsSprites(verticesHashMap, threeGroup);
        } else {
            throw new Error("Labels as points are not implemented yet");
        }
        // Only add to structureGroup if not already added
        if (!this.waveStructureGroup.children.includes(threeGroup)) {
            this.waveStructureGroup.add(threeGroup);
        }
    }

    getLabelPositionWithOffset(position: THREE.Vector3, atomName: string) {
        const offsetLength = this.getOffsetVectorMultiplierPerAtomName(atomName);
        const offsetVector = this.getOffsetVector(position, this.waveCamera, offsetLength);
        return position.clone().add(offsetVector);
    }

    /**
     * Adjusts labels to camera position. Applied to labels of a specific type.
     */
    adjustLabelsToCameraPosition() {
        if (!this.isVisible || !this.config.areSpritesUsed) return;
        this.THREEGroup.children.forEach((label) => {
            const { position, atomName } = label.userData;
            label.position.copy(this.getLabelPositionWithOffset(position, atomName));
            label.lookAt(this.waveCamera.position);
        });
    }
}
