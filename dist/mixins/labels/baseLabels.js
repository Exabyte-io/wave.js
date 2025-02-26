var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
import * as THREE from "three";
import { ATOM_GROUP_NAME } from "../../enums";
import { LabelsHolder } from "./labelsHolder";
/*
 * Base mixin containing generic logic for dealing with labels.
 * Provides core functionality for creating and managing text labels in 3D space.
 */
export const BaseLabelsMixin = (superclass) => { var _texturesCache, _a; return _a = class extends superclass {
        constructor(config) {
            super(config);
            _texturesCache.set(this, {});
            if (!this.labelsHolders) {
                this.labelsHolders = [];
            }
        }
        /**
         * Initializes a label holder with provided configuration
         * @param {Object} config - Configuration for the label holder
         * @returns {LabelsHolder} The initialized label holder
         */
        initializeLabelsHolder(config) {
            const labelsHolder = new LabelsHolder(config);
            this.structureGroup.add(labelsHolder.threeJsGroup);
            this.labelsHolders.push(labelsHolder);
        }
        /**
         * Finds a label holder by type
         * @param {string} labelType - The type of label holder to find
         * @returns {LabelsHolder|undefined} The found label holder or undefined
         */
        getLabelsHolder(labelType) {
            return this.labelsHolders.find((holder) => holder.labelType === labelType);
        }
        /**
         * Creates a hash map representing the positions for labels.
         * @param {labelsHolder} labelsHolder - The label holder to create vertices for
         * @param {THREE.Group} [sourceGroup=this.structureGroup] - The group to extract atoms from
         * @returns {Object.<string, Array.<number>>} HashMap with label text as keys and an array of vertices as values.
         */
        createVerticesHashMap(labelsHolder, sourceGroup = this.structureGroup) {
            if (!labelsHolder || !labelsHolder.textProcessor)
                return {};
            const verticesHashMap = {};
            sourceGroup.children.forEach((group) => {
                if (group.name !== ATOM_GROUP_NAME)
                    return;
                group.children.forEach((atom) => {
                    if (atom instanceof THREE.Mesh) {
                        const position = new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld);
                        const { x, y, z } = position;
                        const text = labelsHolder.textProcessor(atom, position);
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
         * Creates and positions multiple labels as sprites
         * More flexible but less performant than Points for many labels
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
        /**
         * Creates labels for a specific label type
         * @param {string} labelType - Type of label to create
         * @param {THREE.Group} [sourceGroup=this.structureGroup] - Group to extract atoms from
         */
        createLabels(labelType, sourceGroup = this.structureGroup) {
            const labelsHolder = this.getLabelsHolder(labelType);
            if (!labelsHolder)
                return;
            const verticesHashMap = this.createVerticesHashMap(labelsHolder, sourceGroup);
            labelsHolder.threeJsGroup.clear();
            if (labelsHolder.config.areSpritesUsed) {
                this.createLabelsAsSprites(verticesHashMap, labelsHolder.getNameForLabel, labelsHolder.getOffsetVector, labelsHolder.getUserData, labelsHolder.threeJsGroup, labelsHolder.config);
            }
            this.render();
        }
        /**
         * Creates labels for each of labelsHolders
         * @param {THREE.Group} [sourceGroup=this.structureGroup] - Group to extract atoms from
         */
        createAllLabels(sourceGroup = this.structureGroup) {
            this.labelsHolders.forEach((holder) => this.createLabels(holder.labelType, sourceGroup));
        }
        /**
         * Adjusts labels to camera position. Applied to labels of a specific type.
         * @param {string} labelType - Type of label to adjust
         */
        adjustLabelsToCameraPosition(labelType) {
            const labelsHolder = this.getLabelsHolder(labelType);
            if (!labelsHolder || !labelsHolder.areShown || !labelsHolder.config.areSpritesUsed)
                return;
            labelsHolder.threeJsGroup.children.forEach((label) => {
                const { atomPosition, atomName } = label.userData;
                const offsetVector = labelsHolder.getOffsetVector(atomPosition, atomName);
                label.position.copy(atomPosition).add(offsetVector);
                label.lookAt(this.camera.position);
            });
        }
        /**
         * Adjust all labels to camera position after camera movement. Applied to all existing labels.
         */
        adjustAllLabelsToCameraPosition() {
            this.labelsHolders.forEach((holder) => this.adjustLabelsToCameraPosition(holder.labelType));
        }
        /**
         * Toggles visibility for a specific label type
         * @param {string} labelType - Type of label to toggle
         * @returns {boolean} New visibility state
         */
        toggleLabels(labelType) {
            const labelsHolder = this.getLabelsHolder(labelType);
            if (!labelsHolder || !labelsHolder.threeJsGroup)
                return false;
            labelsHolder.areShown = !labelsHolder.areShown;
            labelsHolder.threeJsGroup.visible = labelsHolder.areShown;
            this.render();
            return labelsHolder.areShown;
        }
    },
    _texturesCache = new WeakMap(),
    _a; };
