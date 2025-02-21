import * as THREE from "three";

import { ATOM_GROUP_NAME, COORDINATE_LABELS_GROUP_NAME } from "../../enums";
import { BaseLabelsMixin } from "./baseLabels";

/*
 * Mixin containing the logic for dealing with atom-specific labels.
 * Extends the base label functionality with features specific to atom labeling.
 */
export const CoordinateLabelsMixin = (superclass) =>
    class extends BaseLabelsMixin(superclass) {
        constructor(config) {
            super(config);
            this.coordinateLabelsGroup = new THREE.Group();
            this.coordinateLabelsGroup.name = COORDINATE_LABELS_GROUP_NAME;
            this.areCoordinateLabelsShown = this.settings.areCoordinateLabelsInitiallyShown;
            this.coordinateLabelsGroup.visible = this.areCoordinateLabelsShown;
            this.structureGroup.add(this.coordinateLabelsGroup);
        }

        /**
         * Formats coordinates into an array of fixed precision values
         * @param {THREE.Vector3} position - The position vector to format
         * @returns {Array<number>} Array of [x,y,z] coordinates with fixed precision
         */
        formatCoordinates(position) {
            const precision = this.settings.roundPrecision;
            return [
                Number(position.x.toFixed(precision)),
                Number(position.y.toFixed(precision)),
                Number(position.z.toFixed(precision)),
            ];
        }

        /**
         * Creates a display text from coordinates
         * @param {Array<number>} coordinates - Array of [x,y,z] coordinates
         * @param {string} separator - Separator between coordinates
         * @returns {string} Formatted coordinate text
         */
        createCoordinateText(coordinates, separator = "  ") {
            const precision = this.settings.roundPrecision;
            return coordinates.map((coord) => coord.toFixed(precision)).join(separator);
        }

        /**
         * Creates a single coordinate label with proper positioning and offset
         * @param {string} text - The coordinate text to display
         * @param {THREE.Vector3} position - The position where to place the label
         * @param {string} prefix - Optional prefix for the label name
         * @returns {THREE.Sprite} The created label
         */
        createSingleCoordinateLabel(text, position, prefix = "coordinate") {
            const name = `${prefix}-label-${text}`;
            const label = this.createLabelSprite(text, name, this.settings.coordinateLabelsConfig);
            const offsetVector = this.getCoordinateLabelOffsetVector(position, text);
            label.userData = { atomPosition: position, atomName: text };
            label.position.addVectors(position, offsetVector);
            label.lookAt(this.camera.position);
            return label;
        }

        /**
         * Creates a hash map representing the positions (vertices) for atom labels.
         * The hash map uses atom names as keys and corresponding 3D positions as values.
         * If an atom name already exists in the hash map, it appends the atom's coordinates to the associated entry.
         *
         * @returns {Object.<string, Array.<number>>} HashMap with atom names as keys and an array of vertices as values.
         */
        createCoordinateVerticesHashMap() {
            const verticesHashMap = {};
            this.structureGroup.children.forEach((group) => {
                if (group.name !== ATOM_GROUP_NAME) return;

                group.children.forEach((atom) => {
                    if (atom instanceof THREE.Mesh) {
                        const position = new THREE.Vector3().setFromMatrixPosition(
                            atom.matrixWorld,
                        );
                        const coordinates = this.formatCoordinates(position);
                        const text = this.createCoordinateText(coordinates);
                        const { x, y, z } = position;
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
         * Computes an offset vector for a given atom position to position labels correctly.
         * This method returns a vector pointing from the atom to the camera but with a
         * length equal to the sphere radius.
         * @param {THREE.Vector3} atomPosition - The 3D position of the atom.
         * @param {String} element - The name of the atom.
         * @returns {THREE.Vector3} - Offset vector for the label.
         */
        getCoordinateLabelOffsetVector(atomPosition, element) {
            const vectorToCamera = new THREE.Vector3().subVectors(
                this.camera.position,
                atomPosition,
            );
            const offsetLength = this.getAtomRadiusByElement(element);
            const zOffset =
                this.settings.coordinateLabelsConfig.offsetVector[2] +
                this.getAtomRadiusByElement(element) * this.settings.atomRadiiScale;

            vectorToCamera.normalize();
            vectorToCamera.multiplyScalar(offsetLength);

            vectorToCamera.z += zOffset;

            return vectorToCamera;
        }

        /**
         * Creates labels as sprites or points
         * depending on the settings.coordinateLabelsConfig.areSpritesUsed value
         */
        createCoordinateLabels() {
            const verticesHashMap = this.createCoordinateVerticesHashMap();
            const getNameForLabel = (text) => `coordinate-label-for-${text}`;

            if (this.settings.coordinateLabelsConfig.areSpritesUsed) {
                this.createLabelsAsSprites(
                    verticesHashMap,
                    getNameForLabel,
                    this.getCoordinateLabelOffsetVector.bind(this),
                    (text, position) => ({ atomPosition: position, atomName: text }),
                    this.coordinateLabelsGroup,
                    this.settings.coordinateLabelsConfig,
                );
            } else {
                this.createLabelsAsPoints(
                    verticesHashMap,
                    getNameForLabel,
                    this.coordinateLabelsGroup,
                    this.settings.coordinateLabelsConfig,
                );
            }
            this.render();
        }

        /**
         * Adjusts label positions in 3D space so that they don't overlap with their corresponding atoms
         * and always face the camera.
         * @method adjustCoordinateLabelsToCameraPosition
         */
        adjustCoordinateLabelsToCameraPosition() {
            if (
                !this.areCoordinateLabelsShown ||
                !this.settings.coordinateLabelsConfig.areSpritesUsed
            )
                return;
            this.coordinateLabelsGroup.children.forEach((label) => {
                const { atomPosition, atomName: element } = label.userData;
                const offsetVector = this.getCoordinateLabelOffsetVector(atomPosition, element);
                label.position.addVectors(atomPosition, offsetVector);
                label.visible = this.areCoordinateLabelsShown;
                label.lookAt(this.camera.position);
            });
        }

        /**
         * Toggles the visibility of all labels
         */
        toggleCoordinateLabels() {
            if (!this.coordinateLabelsGroup) return;
            this.areCoordinateLabelsShown = !this.areCoordinateLabelsShown;
            this.coordinateLabelsGroup.visible = this.areCoordinateLabelsShown;
            this.render();
        }
    };
