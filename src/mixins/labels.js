import * as THREE from "three";

import { ATOM_GROUP_NAME, LABELS_GROUP_NAME } from "../enums";
// eslint-disable-next-line import/no-cycle
import { setParameters } from "../utils";
/*
 * Mixin containing the logic for dealing with atom labels.
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
                const { atomPosition, atomName: element } = label.userData;
                const offsetVector = this.getLabelOffsetVector(atomPosition, element);
                label.position.addVectors(atomPosition, offsetVector);
                label.visible = this.areLabelsShown;
                label.lookAt(this.camera.position);
            });
        }

        /**
         * Creates a hash map representing the positions (vertices) for atom labels.
         * The hash map uses atom names as keys and corresponding 3D positions as values.
         * If an atom name already exists in the hash map, it appends the atom's coordinates to the associated entry.
         *
         * @returns {Object.<string, Array.<number>>} HashMap with atom names as keys and an array of vertices as values.
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

        /*
         * function that creates label sprites as points.
         * If we want to use a lot of labels and don't want to have a huge impact
         * from rendering scene we should use Three.Points or Three.InstancedMesh.
         * https://threejs.org/docs/#api/en/objects/Points
         * https://threejs.org/docs/?q=instanced#api/en/objects/InstancedMesh
         */
        createLabelsAsPoints() {
            this.labelsGroup.clear();
            const verticesHashMap = this.createVerticesHashMap();
            Object.entries(verticesHashMap).forEach(([key, vertices]) => {
                const texture = this.getLabelTextTexture(key);
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
                const material = new THREE.PointsMaterial({
                    ...this.settings.labelPointsConfig,
                    map: texture,
                });
                const particles = new THREE.Points(geometry, material);
                particles.visible = true;
                particles.name = `labels-for-${key}`;
                this.labelsGroup.add(particles);
                this.structureGroup.add(this.labelsGroup);
            });

            this.render();
        }

        /**
         * Creates and positions label sprites based on atom vertices.
         * Clears any existing labels, then uses a hash map of vertices to determine label placement.
         * Each label, represented as a sprite, is positioned at an offset determined by the atom's radius.
         * For performance considerations, when using many labels, consider using Three.Points or Three.InstancedMesh.
         *
         * https://threejs.org/docs/#api/en/objects/Points
         * https://threejs.org/docs/?q=instanced#api/en/objects/InstancedMesh
         */
        createLabelsAsSprites() {
            this.labelsGroup.clear();
            const verticesHashMap = this.createVerticesHashMap();
            Object.entries(verticesHashMap).forEach(([key, vertices]) => {
                for (let i = 0; i < vertices.length; i += 3) {
                    const atomPosition = new THREE.Vector3().fromArray(vertices, i);
                    const labelSprite = this.createLabelSprite(key, `label-for-${key}`);
                    const offsetVector = this.getLabelOffsetVector(atomPosition, key);
                    labelSprite.userData = { atomPosition, atomName: key };
                    labelSprite.position.addVectors(atomPosition, offsetVector);
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
         * Toggles the visibility of all the text labels within the atom group
         */
        toggleLabels() {
            this.areLabelsShown = !this.areLabelsShown;
            this.labelsGroup.visible = this.areLabelsShown;

            this.render();
        }
    };
