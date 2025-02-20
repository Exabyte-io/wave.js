var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
import * as THREE from "three";
import { setParameters } from "./labelUtils";
/*
 * Base mixin containing generic logic for dealing with labels.
 * Provides core functionality for creating and managing text labels in 3D space.
 */
export const BaseLabelsMixin = (superclass) => { var _texturesCache, _a; return _a = class extends superclass {
        constructor() {
            super(...arguments);
            _texturesCache.set(this, {});
        }
        /**
         * Creates a new texture based on a 2D canvas with the supplied text
         * @param {String} text - the text to be placed on the texture;
         * @param {Object} config - configuration for the label text (optional)
         * @return {THREE.Texture}
         */
        createLabelTextTexture(text, config = this.settings.labelsConfig) {
            const { fontFace, fontSize, fontWeight, ...textParams } = config;
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
         * @param {Object} config - configuration for the label text
         * @return {THREE.Texture}
         */
        getLabelTextTexture(text, config) {
            const cacheKey = `${text}-${config.fontFace}-${config.fontSize}`;
            if (__classPrivateFieldGet(this, _texturesCache, "f")[cacheKey])
                return __classPrivateFieldGet(this, _texturesCache, "f")[cacheKey];
            const texture = this.createLabelTextTexture(text, config);
            __classPrivateFieldGet(this, _texturesCache, "f")[cacheKey] = texture;
            return texture;
        }
        /**
         * Creates a sprite with a label text
         * @param {String} text - the text to be displayed on the label
         * @param {String} name - the name of the created sprite
         * @param {Object} config - configuration for the label text
         * @param {Object} options - additional options for the sprite (scale, etc.)
         * @return {THREE.Sprite}
         */
        createLabelSprite(text, name, config, options = {}) {
            const texture = this.getLabelTextTexture(text, config);
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
         * @param {Object} config - configuration for the label text
         * @returns {THREE.Points}
         */
        createLabelPoints(text, positions, name, config) {
            const texture = this.getLabelTextTexture(text, config);
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
         * Creates and positions multiple labels as sprites
         * @param {Object} labelData - Map of label text to array of positions
         * @param {Function} getNameForLabel - Function to generate name for each label
         * @param {Function} getLabelOffset - Function to calculate offset for each label
         * @param {Function} getAdditionalData - Function to get additional data for each label
         * @param {THREE.Group} targetGroup - The group to add the labels to
         * @param {Object} config - Configuration for the label text
         */
        createLabelsAsSprites(labelData, getNameForLabel, getLabelOffset, getAdditionalData, targetGroup, config) {
            targetGroup.clear();
            Object.entries(labelData).forEach(([text, positions]) => {
                for (let i = 0; i < positions.length; i += 3) {
                    const position = new THREE.Vector3().fromArray(positions, i);
                    const labelSprite = this.createLabelSprite(text, getNameForLabel(text), config);
                    const offset = getLabelOffset(position, text);
                    labelSprite.userData = { ...getAdditionalData(text, position) };
                    labelSprite.position.addVectors(position, offset);
                    targetGroup.add(labelSprite);
                }
            });
        }
        /**
         * Creates and positions multiple labels efficiently using Three.Points
         * @param {Object} labelData - Map of label text to array of positions
         * @param {Function} getNameForLabel - Function to generate name for each label
         * @param {THREE.Group} targetGroup - The group to add the labels to
         * @param {Object} config - Configuration for the label text
         */
        createLabelsAsPoints(labelData, getNameForLabel, targetGroup, config) {
            targetGroup.clear();
            Object.entries(labelData).forEach(([text, positions]) => {
                const points = this.createLabelPoints(text, positions, getNameForLabel(text), config);
                targetGroup.add(points);
            });
        }
    },
    _texturesCache = new WeakMap(),
    _a; };
