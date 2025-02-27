import * as THREE from "three";

import { ATOM_GROUP_NAME } from "../../enums";
import settings from "../../settings";
import { BaseTHREEGroupManager } from "../base";

export class BaseLabelsManager extends BaseTHREEGroupManager {
    labelType = "";

    #THREETexturesCache: { [key: string]: THREE.Texture } = {};

    textProcessor(atom: THREE.Mesh, position: THREE.Vector3): string {
        return "";
    }

    getOffsetVector(position: THREE.Vector3, camera: THREE.Camera, offsetLength = 0) {
        const vectorToCamera = new THREE.Vector3().subVectors(camera.position, position);
        const zOffset = offsetLength * settings.atomRadiiScale;

        vectorToCamera.normalize();
        vectorToCamera.multiplyScalar(offsetLength);
        vectorToCamera.z += zOffset;

        return vectorToCamera;
    }

    getUserData(text: string, position: THREE.Vector3) {
        return { atomPosition: position, atomName: text };
    }

    getNameForLabel(text: string) {
        return `${this.labelType}-label-for-${text}`;
    }

    toggleLabelsVisibility() {
        this.toggleVisibility();
    }

    /**
     * Creates a hash map representing the positions for labels.
     * @returns {Object.<string, Array.<number>>} HashMap with label text as keys and an array of vertices as values.
     */
    createVerticesHashMap() {
        const verticesHashMap: { [key: string]: number[] } = {};
        this.waveStructureGroup.children.forEach((group) => {
            if (group.name !== ATOM_GROUP_NAME) return;

            group.children.forEach((atom) => {
                if (atom instanceof THREE.Mesh) {
                    const position = new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld);
                    const { x, y, z } = position;

                    const text = this.textProcessor(atom, position);

                    if (!verticesHashMap[text]) {
                        verticesHashMap[text] = [x, y, z];
                        return;
                    }
                    verticesHashMap[text].push(x, y, z);
                }
            });
        });

        return verticesHashMap;
    }

    /**
     * Creates a new texture based on a 2D canvas with the supplied text
     * @param {String} text - the text to be placed on the texture;
     * @param {Object} config - additional options for the texture (scaleWidth, scaleHeight, etc.)
     * @return {THREE.Texture}
     */
    createLabelTextTexture(text: string) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

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
     * @param {String} text - the text to be displayed on the label
     * @param {String} name - the name of the created sprite
     * @param {Object} config - additional options for the sprite (scale, etc.)
     * @return {THREE.Sprite}
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
    createLabelsAsSprites(verticesHashMap) {
        this.THREEGroup.clear();
        Object.entries(verticesHashMap).forEach(([key, vertices]) => {
            for (let i = 0; i < vertices.length; i += 3) {
                // TODO: define verticesHashMap type
                // @ts-ignore
                const position = new THREE.Vector3().fromArray(vertices, i);
                const name = this.getNameForLabel(key);
                const labelSprite = this.createLabelSprite(key, name);
                // TODO: figure out how to pass element here
                const offsetVector = this.getOffsetVector(position, this.waveCamera, key);
                labelSprite.userData = this.getUserData(key, position);
                labelSprite.position.addVectors(position, offsetVector);
                this.THREEGroup.add(labelSprite);
            }
        });
    }

    createLabels() {
        const verticesHashMap = this.createVerticesHashMap();
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
     * @param {string} labelType - Type of label to adjust
     */
    adjustLabelsToCameraPosition() {
        if (!this.isVisible || !this.config.areSpritesUsed) return;

        this.THREEGroup.children.forEach((label) => {
            const { atomPosition, atomName } = label.userData;
            const offsetVector = this.getOffsetVector(atomPosition, this.waveCamera, atomName);
            label.position.copy(atomPosition).add(offsetVector);
            label.lookAt(this.waveCamera.position);
        });
    }
}
