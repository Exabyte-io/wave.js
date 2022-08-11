import * as THREE from "three";
import { ATOM_GROUP_NAME } from "../enums";
// eslint-disable-next-line import/no-cycle
import { setParameters } from "../utils";
import { DEFAULT_LABEL_MATERIALS_CONFIG } from "../config";
/*
 * Mixin containing the logic for dealing with atom labes.
 * Dynamically draws labels over atoms.
 */
export const LabelsMixin = (superclass) =>
    class extends superclass {
        #texturesCache = {};

        #labels = [];

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
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.name = name;
            sprite.scale.set(0.25, 0.25, 0.25);
            sprite.visible = this.areLabelsShown;
            return sprite;
        }

        /**
         * Adjusts the label sprites' positions so that the center of every sprite
         * is always in the point where the atom's bound sphere is intersected
         * by the line joining the atom's center with the camera.
         */
        adjustLabelsToCameraPosition() {
            if (!this.areLabelsShown) return;

            const atomGroups = this.scene
                .getObjectByName(ATOM_GROUP_NAME)
                .parent.children.filter((object) => object.name.includes(ATOM_GROUP_NAME));
            atomGroups.forEach((group) => {
                const labels = group.children.filter((child) => child instanceof THREE.Sprite);
                labels.forEach((label) => {
                    const atomUUID = label.name.replace(/label-for-/, "");
                    const atom = this.scene.getObjectByProperty("uuid", atomUUID);
                    const clampedVectorToCamera = this.getClampedVectorToCamera(group, atom);
                    const newLabelPosition = atom.position.clone().add(clampedVectorToCamera);
                    label.position.copy(newLabelPosition);
                });
            });
        }

        /*
         * removes labels that situated in the labels array
         */
        removeLabels() {
            this.#labels.forEach((label) => this.structureGroup.remove(label));
        }

        /**
         * this function is creates vertices hashMap where key is atom name, value is array of vertices where this atoms is situated
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
        createLabelSpritesAsPoints() {
            if (this.#labels.length) {
                this.removeLabels();
            }

            const verticesHashMap = this.createVerticesHashMap();
            Object.entries(verticesHashMap).forEach(([key, vertices]) => {
                const texture = this.getLabelTextTexture(key);
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
                const material = new THREE.PointsMaterial({
                    ...DEFAULT_LABEL_MATERIALS_CONFIG,
                    map: texture,
                });
                const particles = new THREE.Points(geometry, material);
                particles.visible = this.areLabelsShown;
                particles.name = `labels-for-${key}`;
                this.#labels.push(particles);
                this.structureGroup.add(particles);
            });

            this.render();
        }

        /**
         * Calculates a vector from the atom center to the camera clamped to the atom sphere radius.
         * @param {THREE.Group} group - the instance of THREE group containing the atom mesh;
         * @param {THREE.Mesh} atom - the instance of THREE mesh representing the atom;
         */
        getClampedVectorToCamera(group, atom) {
            const { center: cellCenter } = this.getCellViewParams();
            const atomRadius = atom.geometry.parameters.radius;
            const atomPosition = atom.position.clone().add(group.position);
            const vectorToCamera = this.isCameraOrthographic
                ? new THREE.Vector3(
                      this.camera.position.x - cellCenter[0],
                      this.camera.position.y - cellCenter[1],
                      this.camera.position.z - cellCenter[2],
                  )
                : new THREE.Vector3(
                      this.camera.position.x - atomPosition.x,
                      this.camera.position.y - atomPosition.y,
                      this.camera.position.z - atomPosition.z,
                  );
            const clampedVectorToCamera = vectorToCamera.clampLength(atomRadius, atomRadius);
            return clampedVectorToCamera;
        }

        /**
         * Toggles the visibility of all the text labels within the atom group
         */
        toggleLabels() {
            this.areLabelsShown = !this.areLabelsShown;
            this.#labels.forEach((label) => (label.visible = this.areLabelsShown));

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
