import * as THREE from "three";
import { COORDINATE_LABELS_GROUP_NAME, LABEL_TYPES } from "../../enums";
import { BaseLabelsMixin } from "./baseLabels";
export const CoordinateLabelsMixin = (superclass) => class extends BaseLabelsMixin(superclass) {
    constructor(config) {
        super(config);
        this.initializeLabelsHolder({
            labelType: LABEL_TYPES.COORDINATE,
            threeJsGroupName: COORDINATE_LABELS_GROUP_NAME,
            areShown: this.settings.areCoordinateLabelsInitiallyShown,
            config: this.settings.coordinateLabelsConfig,
            textProcessor: (atom, position) => {
                const { x, y, z } = position;
                return this.createCoordinateText([x, y, z]);
            },
            getOffsetVector: this.getCoordinateLabelOffsetVector.bind(this),
            getUserData: (text, position) => ({ atomPosition: position, atomName: text }),
            getNameForLabel: (text) => `coordinate-label-for-${text}`,
        });
    }
    /**
     * Creates a coordinate display text from coordinates
     * @param {Array<number>} coordinates - Array of [x,y,z] coordinates
     * @param {string} separator - Separator between coordinates
     * @returns {string} Formatted coordinate text
     */
    createCoordinateText(coordinates, separator = "  ") {
        const precision = this.settings.roundPrecision;
        return coordinates.map((coord) => coord.toFixed(precision)).join(separator);
    }
    /**
     * Computes an offset vector for coordinate labels
     */
    getCoordinateLabelOffsetVector(atomPosition, element) {
        const vectorToCamera = new THREE.Vector3().subVectors(this.camera.position, atomPosition);
        const offsetLength = this.getAtomRadiusByElement(element);
        const zOffset = this.settings.coordinateLabelsConfig.offsetVector[2] +
            this.getAtomRadiusByElement(element) * this.settings.atomRadiiScale;
        vectorToCamera.normalize();
        vectorToCamera.multiplyScalar(offsetLength);
        vectorToCamera.z += zOffset;
        return vectorToCamera;
    }
    toggleCoordinateLabels() {
        this.toggleLabels(LABEL_TYPES.COORDINATE);
        this.areCoordinateLabelsShown = !this.areCoordinateLabelsShown;
    }
};
