import * as THREE from "three";
import { COORDINATE_LABELS_GROUP_NAME, ELEMENT_LABELS_GROUP_NAME, LABEL_TYPES } from "../../enums";
import { BaseLabelsMixin } from "./baseLabels";
export const AtomLabelsMixin = (superclass) => class extends BaseLabelsMixin(superclass) {
    constructor(config) {
        super(config);
        this.initializeAllLabelHolders();
        this.areCoordinateLabelsShown = this.findLabelHolder(LABEL_TYPES.COORDINATE).areShown;
        this.areElementLabelsShown = this.findLabelHolder(LABEL_TYPES.ELEMENT).areShown;
    }
    /**
     * Initialize all label holders for atoms (elements, coordinates)
     * @returns {void}
     */
    initializeAllLabelHolders() {
        this.initializeLabelHolder({
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
        this.initializeLabelHolder({
            labelType: LABEL_TYPES.ELEMENT,
            threeJsGroupName: ELEMENT_LABELS_GROUP_NAME,
            areShown: this.settings.areElementLabelsInitiallyShown,
            config: this.settings.elementLabelsConfig,
            textProcessor: (atom) => atom.userData.symbolWithLabel,
            getOffsetVector: this.getElementLabelOffsetVector.bind(this),
            getUserData: (text, position) => ({ atomPosition: position, atomName: text }),
            getNameForLabel: (text) => `element-label-for-${text}`,
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
    /**
     * Computes an offset vector for element labels
     */
    getElementLabelOffsetVector(atomPosition, element) {
        const vectorToCamera = new THREE.Vector3().subVectors(this.camera.position, atomPosition);
        const offsetLength = this.getAtomRadiusByElement(element);
        return vectorToCamera.normalize().multiplyScalar(offsetLength);
    }
    toggleElementLabels() {
        this.toggleLabels(LABEL_TYPES.ELEMENT);
        this.areElementLabelsShown = this.findLabelHolder(LABEL_TYPES.ELEMENT).areShown;
    }
    toggleCoordinateLabels() {
        this.toggleLabels(LABEL_TYPES.COORDINATE);
        this.areCoordinateLabelsShown = this.findLabelHolder(LABEL_TYPES.COORDINATE).areShown;
    }
};
