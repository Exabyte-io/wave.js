import * as THREE from "three";

import { ATOM_GROUP_NAME } from "../../enums";
import { LabelsHolder } from "./labelsHolder";

/*
 * Base mixin containing generic logic for dealing with labels.
 * Provides core functionality for creating and managing text labels in 3D space.
 */
export const BaseLabelsMixin = (superclass) =>
    class extends superclass {
        #texturesCache = {};

        constructor(config) {
            super(config);
            this.labelsHolders = [];
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
        findLabelsHolder(labelType) {
            return this.labelsHolders.find((holder) => holder.labelType === labelType);
        }

        /**
         * Creates a hash map representing the positions for labels.
         * @param {labelsHolder} labelsHolder - The label holder to create vertices for
         * @param {THREE.Group} [sourceGroup=this.structureGroup] - The group to extract atoms from
         * @returns {Object.<string, Array.<number>>} HashMap with label text as keys and an array of vertices as values.
         */
        createVerticesHashMap(labelsHolder, sourceGroup = this.structureGroup) {
            if (!labelsHolder || !labelsHolder.textProcessor) return {};

            const verticesHashMap = {};
            sourceGroup.children.forEach((group) => {
                if (group.name !== ATOM_GROUP_NAME) return;

                group.children.forEach((atom) => {
                    if (atom instanceof THREE.Mesh) {
                        const position = new THREE.Vector3().setFromMatrixPosition(
                            atom.matrixWorld,
                        );
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
            const {
                fontFace,
                fontSize,
                fontWeight,
                scaleWidth = 1,
                scaleHeight = 1,
                ...textParams
            } = config;
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
            if (this.#texturesCache[text]) return this.#texturesCache[text];

            const texture = this.createLabelTextTexture(text, config);
            this.#texturesCache[text] = texture;
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
        createLabelsAsSprites(
            verticesHashMap,
            getNameForLabel,
            getOffsetVector,
            getUserData,
            targetGroup,
            config,
        ) {
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
            const labelsHolder = this.findLabelsHolder(labelType);
            if (!labelsHolder) return;

            const verticesHashMap = this.createVerticesHashMap(labelsHolder, sourceGroup);
            labelsHolder.threeJsGroup.clear();

            if (labelsHolder.config.areSpritesUsed) {
                this.createLabelsAsSprites(
                    verticesHashMap,
                    labelsHolder.getNameForLabel,
                    labelsHolder.getOffsetVector,
                    labelsHolder.getUserData,
                    labelsHolder.threeJsGroup,
                    labelsHolder.config,
                );
            } else {
                this.createLabelsAsPoints(
                    verticesHashMap,
                    labelsHolder.getNameForLabel,
                    labelsHolder.threeJsGroup,
                    labelsHolder.config,
                );
            }
            this.render();
        }

        /**
         * Creates all labels
         * @param {THREE.Group} [sourceGroup=this.structureGroup] - Group to extract atoms from
         */
        createAllLabels(sourceGroup = this.structureGroup) {
            this.labelsHolders.forEach((holder) =>
                this.createLabels(holder.labelType, sourceGroup),
            );
        }

        /**
         * Adjusts labels to camera position
         * @param {string} labelType - Type of label to adjust
         */
        adjustLabelsToCameraPosition(labelType) {
            const labelsHolder = this.findLabelsHolder(labelType);
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
         * Adjust all labels to camera position
         */
        adjustAllLabelsToCameraPosition() {
            this.labelsHolders.forEach((holder) =>
                this.adjustLabelsToCameraPosition(holder.labelType),
            );
        }

        /**
         * Toggles visibility for a specific label type
         * @param {string} labelType - Type of label to toggle
         * @returns {boolean} New visibility state
         */
        toggleLabels(labelType) {
            const labelsHolder = this.findLabelsHolder(labelType);
            if (!labelsHolder || !labelsHolder.threeJsGroup) return false;

            labelsHolder.areShown = !labelsHolder.areShown;
            labelsHolder.threeJsGroup.visible = labelsHolder.areShown;
            this.render();
            return labelsHolder.areShown;
        }
    };
