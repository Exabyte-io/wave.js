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
        //
        // /**
        //  * Creates a sprite with a label text
        //  * @param {String} text - the text displayed on the atom label;
        //  * should be 1-2 symbols long to fit the square form of the label shown in front of a sphere
        //  * @param {String} name - the name of the created sprite;
        //  * naming convention: label-for-<atom mesh uuid>
        //  * @return {THREE.Sprite}
        //  */
        // createLabelSprite(text, name) {
        //     const texture = this.getLabelTextTexture(text);
        //     const spriteMaterial = new THREE.SpriteMaterial({
        //         map: texture,
        //         depthTest: false,
        //     });
        //     const sprite = new THREE.Sprite(spriteMaterial);
        //     sprite.name = name;
        //     sprite.scale.set(0.25, 0.25, 0.25);
        //     sprite.visible = this.areLabelsShown;
        //     return sprite;
        // }

        /*
         * removes labels that situated in the labels array
         */
        removeLabels() {
            this.labelsGroup.children.forEach((label) => this.labelsGroup.remove(label));
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

        /*
         * function that creates label sprites as points.
         * If we want to use a lot of labels and don't want to have a huge impact
         * from rendering scene we should use Three.Points or Three.InstancedMesh.
         * https://threejs.org/docs/#api/en/objects/Points
         * https://threejs.org/docs/?q=instanced#api/en/objects/InstancedMesh
         */
        createLabelSprites() {
            if (this.labelsGroup.children.length) {
                this.removeLabels();
            }
            console.log("Creating labels");
            const verticesHashMap = this.createVerticesHashMap();
            console.log(verticesHashMap);
            Object.entries(verticesHashMap).forEach(([key, vertices]) => {
                console.log(key);
                for (let i = 0; i < vertices.length; i += 3) {
                    const texture = this.getLabelTextTexture(key);
                    const labelMaterial = new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        side: THREE.DoubleSide,
                        depthFunc: THREE.LessEqualDepth,
                        depthTest: true,
                    });
                    const labelGeometry = new THREE.PlaneBufferGeometry(0.25, 0.25); // Adjust the size as needed
                    const labelPlane = new THREE.Mesh(labelGeometry, labelMaterial);
                    // offset must be a vector in the direction from atom to camera with radius of atom
                    const atomPos = new THREE.Vector3(
                        vertices[i],
                        vertices[i + 1],
                        vertices[i + 2],
                    );
                    const offsetVector = this.getLabelOffsetVector(atomPos);
                    labelPlane.position.set(
                        vertices[i] + offsetVector.x,
                        vertices[i + 1] + offsetVector.y,
                        vertices[i + 2] + offsetVector.z,
                    );

                    console.log(this.camera, this.camera.position);
                    labelPlane.userData.atomPosition = atomPos;

                    labelPlane.lookAt(this.camera.position);
                    labelPlane.updateMatrix();
                    this.labelsGroup.add(labelPlane);
                }
            });
            this.structureGroup.add(this.labelsGroup);
            console.log(this.labelsGroup);
            console.log(this.scene);
            this.render();
        }

        adjustLabelsToCameraPosition() {
            this.labelsGroup.children.forEach((label) => {
                // Assuming you have a way to get the corresponding atom for each label
                const atomPos = label.userData.atomPosition;

                const offsetVector = this.getLabelOffsetVector(atomPos);

                label.position.set(
                    atomPos.x + offsetVector.x,
                    atomPos.y + offsetVector.y,
                    atomPos.z + offsetVector.z,
                );

                // Ensure the label always faces the camera
                label.lookAt(this.camera.position);
            });
        }

        /**
         * Calculates a vector from the atom center to the camera clamped to the atom sphere radius.
         * @param {THREE.Group} group - the instance of THREE group containing the atom mesh;
         * @param {THREE.Mesh} atom - the instance of THREE mesh representing the atom;
         */
        getLabelOffsetVector(atomPosition) {
            // Calculate vector from atom to camera
            const vectorToCamera = new THREE.Vector3().subVectors(
                this.camera.position,
                atomPosition,
            );

            // Normalize the vector (makes its length = 1) and scale it by the desired offset.
            // Here I assume a constant offset, but you can adjust as needed.
            const offsetLength = 0.7; // or atomRadius + small_value
            const offsetVector = vectorToCamera.normalize().multiplyScalar(offsetLength);
            console.log(offsetVector);
            return offsetVector;
        }

        /**
         * Toggles the visibility of all the text labels within the atom group
         */
        toggleLabels() {
            this.areLabelsShown = !this.areLabelsShown;
            this.labelsGroup.visible = this.areLabelsShown;

            const atomGroups = this.scene
                .getObjectByName(ATOM_GROUP_NAME)
                .parent.children.filter((object) => object.name.includes(ATOM_GROUP_NAME));
            const labels = atomGroups
                .map((group) => group.children.filter((child) => child instanceof THREE.Sprite))
                .flat();
            labels.forEach((label) => {
                label.visible = this.areLabelsShown;
            });

            this.render();
        }
    };
