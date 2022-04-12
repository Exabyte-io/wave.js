import * as THREE from "three";

import { ATOM_GROUP_NAME } from "../enums";

/*
 * Mixin containing the logic for dealing with atom labes.
 * Dynamically draws labels over atoms.
 */
export const LabelsMixin = (superclass) =>
    class extends superclass {
        // eslint-disable-next-line class-methods-use-this
        createTextTexture(text) {
            const {
                fontFace,
                fontSize,
                fontWeight,
                fillColor,
                strokeColor,
                strokeLineWidth,
                textAlign,
                textBaseline,
            } = this.settings.labels;
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            context.font = `${fontWeight} ${fontSize}px ${fontFace}`;
            const metrics = context.measureText(text);
            const textWidth = metrics.width;
            const basicTextSize = textWidth > fontSize ? textWidth : fontSize;
            const textSizePowOf2 = 2 ** Math.floor(Math.log2(basicTextSize));
            const scaledFontSize = (fontSize * textSizePowOf2) / basicTextSize;
            canvas.width = textSizePowOf2;
            canvas.height = textSizePowOf2;
            context.font = `${fontWeight} ${scaledFontSize}px ${fontFace}`;
            context.textAlign = textAlign;
            context.textBaseline = textBaseline;
            context.fillStyle = fillColor;
            context.strokeStyle = strokeColor;
            context.lineWidth = strokeLineWidth;
            context.fillText(text, context.canvas.width / 2, (context.canvas.height / 2) * 1.15);
            context.strokeText(text, context.canvas.width / 2, (context.canvas.height / 2) * 1.15);
            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
        }

        createSprite(text, name) {
            const texture = this.createTextTexture(text);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.name = name;
            sprite.scale.set(0.25, 0.25, 0.25);
            sprite.visible = this.areLabelsShown;
            return sprite;
        }

        adjustLabelsToCameraPosition() {
            const { scene, camera } = this;
            const cellCenter = this.getCellCenter();
            const atomGroups =
                scene
                    .getObjectByName(ATOM_GROUP_NAME)
                    ?.parent.children.filter((object) => object.name.includes(ATOM_GROUP_NAME)) ||
                [];
            atomGroups.forEach((group) => {
                const labels = group.children.filter((child) => child instanceof THREE.Sprite);
                labels.forEach((label) => {
                    const atomUUID = label.name.replace(/label-for-/, "");
                    const atom = scene.getObjectByProperty("uuid", atomUUID);
                    const atomRadius = atom.geometry.parameters.radius;

                    const atomPosition = atom.position.clone().add(group.position);
                    const vectorToCamera = this.isCameraOrthographic
                        ? new THREE.Vector3(
                              camera.position.x - cellCenter[0],
                              camera.position.y - cellCenter[1],
                              camera.position.z - cellCenter[2],
                          )
                        : new THREE.Vector3(
                              camera.position.x - atomPosition.x,
                              camera.position.y - atomPosition.y,
                              camera.position.z - atomPosition.z,
                          );

                    const clampedVectorToCamera = vectorToCamera
                        .clone()
                        .clampLength(atomRadius, atomRadius);
                    const newLabelPosition = atom.position.clone().add(clampedVectorToCamera);
                    label.position.copy(newLabelPosition);
                });
            });
        }

        toggleLabels() {
            this.areLabelsShown = !this.areLabelsShown;

            const { scene } = this;
            const atomGroups =
                scene
                    .getObjectByName(ATOM_GROUP_NAME)
                    ?.parent.children.filter((object) => object.name.includes(ATOM_GROUP_NAME)) ||
                [];
            const labels = atomGroups
                .map((group) => group.children.filter((child) => child instanceof THREE.Sprite))
                .flat();
            labels.forEach((label) => {
                label.visible = this.areLabelsShown;
            });

            this.render();
        }

        createLabel(message, name) {
            return this.createSprite(message, name);
        }
    };
