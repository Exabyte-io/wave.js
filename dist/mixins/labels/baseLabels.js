var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
import * as THREE from "three";
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
         * @param {Object} config - additional options for the texture (scaleWidth, scaleHeight, etc.)
         * @return {THREE.Texture}
         */
        createLabelTextTexture(text, config = this.settings.labelsConfig) {
            const { fontFace, fontSize, fontWeight, scaleWidth = 1, scaleHeight = 1, ...textParams } = config;
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const canvasWidth = 256 * scaleWidth;
            const canvasHeight = 256 * scaleHeight;
            Object.assign(canvas, {
                width: canvasWidth,
                height: canvasHeight,
            });
            Object.assign(context, {
                font: `${fontWeight} ${fontSize}px ${fontFace}`,
                textAlign: "center",
                textBaseline: "middle",
                ...textParams,
            });
            context.fillText(text, canvasWidth / 2, canvasHeight / 2);
            context.strokeText(text, canvasWidth / 2, canvasHeight / 2);
            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
        }
        /**
         * Returns cached or newly created texture with label text
         * @param {String} text - the text to be placed on the texture;
         * @param {Object} config - additional options for the texture (scaleWidth, scaleHeight, etc.)
         * @return {THREE.Texture}
         */
        getLabelTextTexture(text, config) {
            if (__classPrivateFieldGet(this, _texturesCache, "f")[text])
                return __classPrivateFieldGet(this, _texturesCache, "f")[text];
            const texture = this.createLabelTextTexture(text, config);
            __classPrivateFieldGet(this, _texturesCache, "f")[text] = texture;
            return texture;
        }
        /**
         * Creates a sprite with a label text
         * @param {String} text - the text to be displayed on the label
         * @param {String} name - the name of the created sprite
         * @param {Object} config - additional options for the sprite (scale, etc.)
         * @return {THREE.Sprite}
         */
        createLabelSprite(text, name, config) {
            if (!config) {
                console.warn("No config provided for label sprite");
                return null;
            }
            const spriteMaterial = new THREE.SpriteMaterial({
                map: this.getLabelTextTexture(text, config),
                ...this.settings.labelSpriteConfig,
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.name = name;
            // Apply width and height scales from config
            const scaleX = config.scaleWidth || config.scale || 1;
            const scaleY = config.scaleHeight || config.scale || 1;
            sprite.scale.set(scaleX, scaleY, 1);
            return sprite;
        }
        /**
         * Creates a label as points for efficient rendering of many labels
         * @param {String} text - the text to be displayed
         * @param {Array<number>} positions - array of positions [x1,y1,z1,x2,y2,z2,...]
         * @param {String} name - name for the points object
         * @param {Object} config - additional options for the points (size, etc.)
         * @returns {THREE.Points}
         */
        createLabelPoints(text, positions, name, config = this.settings.labelPointsConfig) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
            const material = new THREE.PointsMaterial(config);
            const points = new THREE.Points(geometry, material);
            points.name = name;
            return points;
        }
        /**
         * Creates and positions multiple labels efficiently using Three.Points
         * For best performance when rendering many labels.
         * @param {Object} labelData - Map of label text to array of positions
         * @param {Function} getNameForLabel - Function to generate name for each label
         */
        createLabelsAsPoints(verticesHashMap, getNameForLabel, targetGroup, config) {
            if (!targetGroup) {
                console.warn("No target group provided for labels");
                return;
            }
            targetGroup.clear();
            Object.entries(verticesHashMap).forEach(([key, vertices]) => {
                const points = this.createLabelPoints(key, vertices, getNameForLabel(key), config);
                targetGroup.add(points);
            });
            // Only add to structureGroup if not already added
            if (!this.structureGroup.children.includes(targetGroup)) {
                this.structureGroup.add(targetGroup);
            }
        }
        /**
         * Creates and positions multiple labels as sprites
         * More flexible but less performant than Points for many labels
         * @param {Object} labelData - Map of label text to array of positions
         * @param {Function} getNameForLabel - Function to generate name for each label
         * @param {Function} getLabelOffset - Function to calculate offset for each label
         * @param {Function} getAdditionalData - Function to get additional data for each label
         */
        createLabelsAsSprites(verticesHashMap, getNameForLabel, getOffsetVector, getUserData, targetGroup, config) {
            if (!targetGroup) {
                console.warn("No target group provided for labels");
                return;
            }
            targetGroup.clear();
            Object.entries(verticesHashMap).forEach(([key, vertices]) => {
                for (let i = 0; i < vertices.length; i += 3) {
                    const position = new THREE.Vector3().fromArray(vertices, i);
                    const labelSprite = this.createLabelSprite(key, getNameForLabel(key), config);
                    const offsetVector = getOffsetVector(position, key);
                    labelSprite.userData = getUserData(key, position);
                    labelSprite.position.addVectors(position, offsetVector);
                    targetGroup.add(labelSprite);
                }
            });
            // Only add to structureGroup if not already added
            if (!this.structureGroup.children.includes(targetGroup)) {
                this.structureGroup.add(targetGroup);
            }
        }
    },
    _texturesCache = new WeakMap(),
    _a; };
