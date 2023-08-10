import * as THREE from "three";

import { ATOM_GROUP_NAME, LABELS_GROUP_NAME } from "../enums";
// eslint-disable-next-line import/no-cycle
import { setParameters } from "../utils";
/*
 * Mixin containing the logic for dealing with atom labes.
 * Dynamically draws labels over atoms.
 */
export const LabelsMixin = (superclass) =>
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
        // eslint-disable-next-line class-methods-use-this
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
         * @param {String} text - the text displayed on the atom label;
         * should be 1-2 symbols long to fit the square form of the label shown in front of a sphere
         * @param {String} name - the name of the created sprite;
         * naming convention: label-for-<atom mesh uuid>
         * @return {THREE.Sprite}
         */
        createLabelSprite(text, name) {
            const texture = this.getLabelTextTexture(text);
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthFunc: THREE.LessEqualDepth,
                depthTest: true,
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.name = name;
            sprite.scale.set(0.25, 0.25, 0.25);
            return sprite;
        }

        /**
         * Adjusts label positions in 3D space so that they don't overlap with their corresponding atoms
         * and always face the camera.
         * @method adjustLabelsToCameraPosition
         */
        adjustLabelsToCameraPosition() {
            if (!this.areLabelsShown) return;
            this.labelsGroup.children.forEach((label) => {
                const atomPos = label.userData.atomPosition;
                const offsetVector = this.getLabelOffsetVector(atomPos);

                label.position.set(
                    atomPos.x + offsetVector.x,
                    atomPos.y + offsetVector.y,
                    atomPos.z + offsetVector.z,
                );

                label.visible = this.areLabelsShown;
                label.lookAt(this.camera.position);
            });
        }

        /**
         * removes labels that situated in the labels array
         */
        removeLabels() {
            console.log(this.labelsGroup.children);
            this.labelsGroup.children.forEach((label) => {
                console.log(label);
                this.labelsGroup.remove(label);
            });
            console.log(this.labelsGroup.children);
        }

        /**
         * Since we using a THREE.Points object for drawing label we need to know all atom names that should be drawn and in which
         * places it should be drawn. This function creates vertices hashMap where key is atom name, value is array of vertices
         * where this atom is situated. Since we don't know how many atom names there could be, we should to iterate through all
         * array of atoms and obtain atom names as a keys to hashMap. If the name already exists in the hash map we will just
         * push the coordinates of the atom on which label should be drawn
         * @returns {Object.<key, Array.<number>>}
         */
        createVerticesHashMap() {
            const verticesHashMap = {};
            this.structureGroup.children.forEach((group) => {
                if (group.name !== ATOM_GROUP_NAME) return;

                group.children.forEach((atom) => {
                    if (atom instanceof THREE.Mesh) {
                        const text = atom.name.split("-")[0];
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
         * Generates and positions label sprites in the 3D space based on the vertices of atoms.
         * If any labels already exist, they are removed before creating new ones.
         * The method uses a hashmap of vertices to organize and label atoms.
         * Each label is created as a sprite and is positioned with an offset in the direction
         * from the atom to the camera based on the radius of the atom.
         * Once all labels are created, they are added to the labelsGroup and rendered.
         * If we want to use a lot of labels and don't want to have a huge impact
         *  from rendering scene we should use Three.Points or Three.InstancedMesh.
         *  https://threejs.org/docs/#api/en/objects/Points
         *  https://threejs.org/docs/?q=instanced#api/en/objects/InstancedMesh
         */
        createLabelsAsSprites() {
            if (this.labelsGroup.children.length) {
                this.removeLabels();
            }
            const verticesHashMap = this.createVerticesHashMap();
            Object.entries(verticesHashMap).forEach(([key, vertices]) => {
                for (let i = 0; i < vertices.length; i += 3) {
                    const atomPos = new THREE.Vector3(
                        vertices[i],
                        vertices[i + 1],
                        vertices[i + 2],
                    );
                    const offsetVector = this.getLabelOffsetVector(atomPos);
                    const labelSprite = this.createLabelSprite(key, `label-for-${key}`);
                    labelSprite.userData.atomPosition = atomPos;
                    labelSprite.position.set(
                        vertices[i] + offsetVector.x,
                        vertices[i + 1] + offsetVector.y,
                        vertices[i + 2] + offsetVector.z,
                    );
                    labelSprite.updateMatrix();
                    this.labelsGroup.add(labelSprite);
                }
            });
            this.structureGroup.add(this.labelsGroup);
            this.render();
        }

        /**
         * Computes an offset vector for a given atom position to position labels correctly.
         * This method returns a vector pointing from the atom to the camera but with a
         * length equal to the sphere radius.
         * @param {THREE.Vector3} atomPosition - The 3D position of the atom.
         * @returns {THREE.Vector3} - Offset vector for the label.
         */
        getLabelOffsetVector(atomPosition) {
            const vectorToCamera = new THREE.Vector3().subVectors(
                this.camera.position,
                atomPosition,
            );

            const offsetLength = this.settings.sphereRadius;
            return vectorToCamera.normalize().multiplyScalar(offsetLength);
        }

        /**
         * Toggles the visibility of all the text labels within the atom group
         */
        toggleLabels() {
            this.areLabelsShown = !this.areLabelsShown;
            this.labelsGroup.visible = this.areLabelsShown;

            this.render();
        }
    };
