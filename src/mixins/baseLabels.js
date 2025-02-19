import * as THREE from "three";

import { LABELS_GROUP_NAME } from "../enums";
import { setParameters } from "../utils/label-utils";

/*
 * Base mixin containing generic logic for dealing with labels.
 * Provides core functionality for creating and managing text labels in 3D space.
 */
export const BaseLabelsMixin = (superclass) =>
    class extends superclass {
        #texturesCache = {};

        constructor(config) {
            super(config);
            this.labelsGroup = new THREE.Group();
            this.labelsGroup.name = LABELS_GROUP_NAME;
            this.labelsGroup.visible = this.areLabelsShown;
            this.structureGroup.add(this.labelsGroup);
        }

        /**
         * Creates a new texture based on a 2D canvas with the supplied text
         * @param {String} text - the text to be placed on the texture;
         * @return {THREE.Texture}
         */
        createLabelTextTexture(text) {
            const { fontFace, fontSize, fontWeight, ...textParams } = this.settings.labelsConfig;
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            context.font = `${fontWeight} ${fontSize}px ${fontFace}`;
            const textWidth = context.measureText(text).width;
            const basicTextSize = textWidth > fontSize ? textWidth : fontSize;
            const textSizePowOf2 = 2 ** Math.floor(Math.log2(basicTextSize));
            const scaledFontSize = (fontSize * textSizePowOf2) / basicTextSize;
            setParameters(canvas, { width: textSizePowOf2, height: textSizePowOf2 });
            const scaledFont = `${fontWeight} ${scaledFontSize}px ${fontFace}`;
            setParameters(context, { font: scaledFont, ...textParams });

            context.fillText(text, context.canvas.width / 2, (context.canvas.height / 2) * 1.15);
            context.strokeText(text, context.canvas.width / 2, (context.canvas.height / 2) * 1.15);

            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;

            return texture;
        }

        /**
         * Returns cached or newly created texture with label text
         * @param {String} text - the text to be placed on the texture;
         * @return {THREE.Texture}
         */
        getLabelTextTexture(text) {
            if (this.#texturesCache[text]) return this.#texturesCache[text];

            const texture = this.createLabelTextTexture(text);
            this.#texturesCache[text] = texture;
            return texture;
        }

        /**
         * Creates a sprite with a label text
         * @param {String} text - the text to be displayed on the label
         * @param {String} name - the name of the created sprite
         * @param {Object} options - additional options for the sprite (scale, etc.)
         * @return {THREE.Sprite}
         */
        createLabelSprite(text, name, options = {}) {
            const texture = this.getLabelTextTexture(text);
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                ...this.settings.labelSpriteConfig,
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.name = name;
            const scale = options.scale || 0.25;
            sprite.scale.set(scale, scale, scale);
            return sprite;
        }

        /**
         * Creates a label as points for efficient rendering of many labels
         * @param {String} text - the text to be displayed
         * @param {Array<number>} positions - array of positions [x1,y1,z1,x2,y2,z2,...]
         * @param {String} name - name for the points object
         * @returns {THREE.Points}
         */
        createLabelPoints(text, positions, name) {
            const texture = this.getLabelTextTexture(text);
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
            const material = new THREE.PointsMaterial({
                ...this.settings.labelPointsConfig,
                map: texture,
            });
            const particles = new THREE.Points(geometry, material);
            particles.visible = true;
            particles.name = name;
            return particles;
        }

        /**
         * Creates and positions multiple labels efficiently using Three.Points
         * For best performance when rendering many labels.
         * @param {Object} labelData - Map of label text to array of positions
         * @param {Function} getNameForLabel - Function to generate name for each label
         */
        createLabelsAsPoints(labelData, getNameForLabel) {
            this.clearLabels();
            Object.entries(labelData).forEach(([text, positions]) => {
                const points = this.createLabelPoints(text, positions, getNameForLabel(text));
                this.labelsGroup.add(points);
            });
            this.structureGroup.add(this.labelsGroup);
        }

        /**
         * Creates and positions multiple labels as sprites
         * More flexible but less performant than Points for many labels
         * @param {Object} labelData - Map of label text to array of positions
         * @param {Function} getNameForLabel - Function to generate name for each label
         * @param {Function} getLabelOffset - Function to calculate offset for each label
         * @param {Function} getAdditionalData - Function to get additional data for each label
         */
        createLabelsAsSprites(
            labelData,
            getNameForLabel,
            getLabelOffset,
            getAdditionalData = () => ({}),
        ) {
            this.clearLabels();
            Object.entries(labelData).forEach(([text, positions]) => {
                for (let i = 0; i < positions.length; i += 3) {
                    const position = new THREE.Vector3().fromArray(positions, i);
                    const labelSprite = this.createLabelSprite(text, getNameForLabel(text));
                    const offset = getLabelOffset(position, text);
                    labelSprite.userData = { position, text, ...getAdditionalData(text, position) };
                    labelSprite.position.addVectors(position, offset);
                    this.labelsGroup.add(labelSprite);
                }
            });
            this.structureGroup.add(this.labelsGroup);
        }

        /**
         * Toggles the visibility of all labels
         */
        toggleLabels() {
            this.areLabelsShown = !this.areLabelsShown;
            this.labelsGroup.visible = this.areLabelsShown;
            this.render();
        }

        /**
         * Clears all labels from the labels group
         */
        clearLabels() {
            this.labelsGroup.clear();
        }
    };
