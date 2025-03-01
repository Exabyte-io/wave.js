import * as THREE from "three";

import settings from "../../settings";
import { VerticesHashMap } from "../atoms";
import { BaseTHREEGroupManager } from "../base";

export class BaseLabelsManager extends BaseTHREEGroupManager {
    labelType = "";

    #THREETexturesCache: { [key: string]: THREE.Texture } = {};

    private getLabelTextFromAtomObject: any;

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
    // TODO: define verticesHashMap class and handle for loop there
    createLabelsAsSprites(verticesHashMap: VerticesHashMap) {
        this.THREEGroup.clear();
        Object.entries(verticesHashMap).forEach(([key, vertices]) => {
            for (let i = 0; i < vertices.length; i += 3) {
                // TODO: define verticesHashMap type
                // @ts-ignore
                const position = new THREE.Vector3().fromArray(vertices, i);
                const name = this.getNameForLabel(key);
                const labelSprite = this.createLabelSprite(key, name);
                labelSprite.userData = { position };
                this.THREEGroup.add(labelSprite);
            }
        });
    }

    createLabels(atoms: any) {
        const verticesHashMap = this.wave.createAtomVerticesHashMap(
            this.getLabelTextFromAtomObject || null,
            atoms,
        );
        if (this.config.areSpritesUsed) {
            this.createLabelsAsSprites(verticesHashMap);
        } else {
            throw new Error("Labels as points are not implemented yet");
        }
        // Only add to structureGroup if not already added
        if (!this.waveStructureGroup.children.includes(this.THREEGroup)) {
            this.waveStructureGroup.add(this.THREEGroup);
        }
    }

    /**
     * Adjusts labels to camera position. Applied to labels of a specific type.
     */
    adjustLabelsToCameraPosition() {
        if (!this.isVisible || !this.config.areSpritesUsed) return;

        this.THREEGroup.children.forEach((label) => {
            const { position, atomName } = label.userData;
            const offsetLength = this.getOffsetVectorMultiplierPerAtomName(atomName);
            const offsetVector = this.getOffsetVector(position, this.waveCamera, offsetLength);

            label.position.copy(position).add(offsetVector);
            label.lookAt(this.waveCamera.position);
        });
    }
}
