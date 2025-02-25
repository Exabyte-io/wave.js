import * as THREE from "three";

import { ELEMENT_LABELS_GROUP_NAME, LABEL_TYPES } from "../../enums";
import { BaseLabelsMixin } from "./baseLabels";

export const ElementLabelsMixin = (superclass) =>
    class extends BaseLabelsMixin(superclass) {
        constructor(config) {
            super(config);
            this.initializeLabelsHolder({
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
         * Computes an offset vector for element labels
         */
        getElementLabelOffsetVector(atomPosition, element) {
            const vectorToCamera = new THREE.Vector3().subVectors(
                this.camera.position,
                atomPosition,
            );
            const offsetLength = this.getAtomRadiusByElement(element);
            return vectorToCamera.normalize().multiplyScalar(offsetLength);
        }

        toggleElementLabels() {
            this.toggleLabels(LABEL_TYPES.ELEMENT);
            this.areElementLabelsShown = !this.areElementLabelsShown;
        }
    };
