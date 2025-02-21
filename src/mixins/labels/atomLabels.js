import * as THREE from "three";

import { ATOM_GROUP_NAME, LABELS_GROUP_NAME } from "../../enums";
import { BaseLabelsMixin } from "./baseLabels";

const labelTypes = {
    element: "element",
    coordinate: "coordinate",
};

/*
 * Mixin containing the logic for dealing with atom-specific labels.
 * Extends the base label functionality with features specific to atom labeling.
 */
export const AtomLabelsMixin = (superclass) =>
    class extends BaseLabelsMixin(superclass) {
        constructor(config) {
            super(config);
            this.labelTypes = [labelTypes.element, labelTypes.coordinate];
            this.atomLabelsGroup = new THREE.Group();
            this.atomLabelsGroup.name = LABELS_GROUP_NAME;
            this.areAtomLabelsShown = this.settings.areAtomLabelsInitiallyShown;
            this.atomLabelsGroup.visible = this.areAtomLabelsShown;
            this.structureGroup.add(this.atomLabelsGroup);

        }

        /**
         * Creates a hash map representing the positions (vertices) for atom labels.
         * The hash map uses atom names as keys and corresponding 3D positions as values.
         * If an atom name already exists in the hash map, it appends the atom's coordinates to the associated entry.
         *
         * @returns {Object.<string, Array.<number>>} HashMap with atom names as keys and an array of vertices as values.
         */
        createVerticesHashMap(labelType, ) {
            const verticesHashMap = {};
            this.structureGroup.children.forEach((group) => {
                if (group.name !== ATOM_GROUP_NAME) return;

                group.children.forEach((atom) => {
                    if (atom instanceof THREE.Mesh) {
                        const text = atom.userData.symbolWithLabel;
                        const position = new THREE.Vector3().setFromMatrixPosition(
                            atom.matrixWorld,
                        );
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
        getLabelOffsetVector(atomPosition, element) {
            const vectorToCamera = new THREE.Vector3().subVectors(
                this.camera.position,
                atomPosition,
            );
            const offsetLength = this.getAtomRadiusByElement(element);
            return vectorToCamera.normalize().multiplyScalar(offsetLength);
        }

        /**
         * Creates labels as sprites or points
         * depending on the settings.atomLabelsConfig.areSpritesUsed value
         */
        createAtomLabels() {
            const verticesHashMap = this.createVerticesHashMap();
            const getNameForLabel = (text) => `element-label-for-${text}`;

            if (this.settings.atomLabelsConfig.areSpritesUsed) {
                this.createLabelsAsSprites(
                    verticesHashMap,
                    getNameForLabel,
                    this.getLabelOffsetVector.bind(this),
                    (text, position) => ({ atomPosition: position, atomName: text }),
                    this.atomLabelsGroup,
                    this.settings.atomLabelsConfig,
                );
                console.log(this.atomLabelsGroup);
            } else {
                this.createLabelsAsPoints(verticesHashMap, getNameForLabel);
            }
            this.render();
        }

        /**
         * Adjusts label positions in 3D space so that they don't overlap with their corresponding atoms
         * and always face the camera.
         * @method adjustAtomLabelsToCameraPosition
         */
        adjustAtomLabelsToCameraPosition() {
            if (!this.areAtomLabelsShown || !this.settings.atomLabelsConfig.areSpritesUsed) return;
            this.atomLabelsGroup.children.forEach((label) => {
                const { atomPosition, atomName: element } = label.userData;
                const offsetVector = this.getLabelOffsetVector(atomPosition, element);
                label.position.addVectors(atomPosition, offsetVector);
                label.visible = this.areAtomLabelsShown;
                label.lookAt(this.camera.position);
            });
        }

        /**
         * Toggles the visibility of all labels
         */
        toggleAtomLabels() {
            if (!this.atomLabelsGroup) return;
            this.areAtomLabelsShown = !this.areAtomLabelsShown;
            this.atomLabelsGroup.visible = this.areAtomLabelsShown;
            this.render();
        }
    };
