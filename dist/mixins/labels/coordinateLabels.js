import * as THREE from "three";
import { ATOM_GROUP_NAME } from "../../enums";
import { BaseLabelsMixin } from "./baseLabels";
/*
 * Mixin containing the logic for dealing with coordinate-specific labels.
 * Extends the base label functionality with features specific to coordinate labeling.
 */
export const CoordinateLabelsMixin = (superclass) => class extends BaseLabelsMixin(superclass) {
    /**
     * Creates a hash map representing the positions (vertices) for coordinate labels.
     * The hash map uses coordinates as keys and corresponding 3D positions as values.
     *
     * @returns {Object.<string, Array.<number>>} HashMap with coordinates as keys and an array of vertices as values.
     */
    createCoordinateVerticesHashMap() {
        const verticesHashMap = {};
        this.structureGroup.children.forEach((group) => {
            if (group.name !== ATOM_GROUP_NAME)
                return;
            group.children.forEach((atom) => {
                if (atom instanceof THREE.Mesh) {
                    const position = new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld);
                    const { x, y, z } = position;
                    const text = `(${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`;
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
     * Computes an offset vector for a given atom position to position coordinate labels correctly.
     * This method returns a vector pointing from the atom to the camera but with a
     * length equal to the sphere radius plus an additional offset.
     * @param {THREE.Vector3} atomPosition - The 3D position of the atom.
     * @param {String} element - The name of the atom.
     * @returns {THREE.Vector3} - Offset vector for the label.
     */
    getCoordinateLabelOffsetVector(atomPosition, element) {
        const vectorToCamera = new THREE.Vector3().subVectors(this.camera.position, atomPosition);
        // Add a bit more offset for coordinate labels to not overlap with element labels
        const offsetLength = this.getAtomRadiusByElement(element) * 1.5;
        return vectorToCamera.normalize().multiplyScalar(offsetLength);
    }
    /**
     * Creates coordinate labels as sprites or points
     * depending on the settings.coordinateLabelsConfig.areSpritesUsed value
     */
    createCoordinateLabels() {
        const verticesHashMap = this.createCoordinateVerticesHashMap();
        const getNameForLabel = (text) => `coordinate-label-for-${text}`;
        if (this.settings.coordinateLabelsConfig.areSpritesUsed) {
            this.createLabelsAsSprites(verticesHashMap, getNameForLabel, this.getCoordinateLabelOffsetVector.bind(this), (text, position) => ({ atomPosition: position, atomName: text }), this.coordinateLabelsGroup, this.settings.coordinateLabelsConfig);
        }
        else {
            this.createLabelsAsPoints(verticesHashMap, getNameForLabel, this.coordinateLabelsGroup, this.settings.coordinateLabelsConfig);
        }
        this.render();
    }
    /**
     * Adjusts coordinate label positions in 3D space so that they don't overlap with their corresponding atoms
     * and always face the camera.
     * @method adjustCoordinateLabelsToCameraPosition
     */
    adjustCoordinateLabelsToCameraPosition() {
        if (!this.areCoordinateLabelsShown || !this.settings.coordinateLabelsConfig.areSpritesUsed)
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
     * Toggles the visibility of all coordinate labels
     */
    toggleCoordinateLabels() {
        this.areCoordinateLabelsShown = !this.areCoordinateLabelsShown;
        this.coordinateLabelsGroup.visible = this.areCoordinateLabelsShown;
        this.render();
    }
};
