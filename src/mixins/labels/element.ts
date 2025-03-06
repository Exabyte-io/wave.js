import * as THREE from "three";

import { LABEL_TYPES } from "../../enums";
import settings from "../../settings";
import { BaseLabelsManager } from "./base";

export class ElementLabelsManager extends BaseLabelsManager {
    labelType = LABEL_TYPES.ELEMENT;

    isVisible = false;

    config = settings.elementLabelsConfig;

    constructor(waveStructureGroup: THREE.Group, waveCamera: THREE.Camera, wave: any) {
        super(waveStructureGroup, waveCamera, wave, LABEL_TYPES.ELEMENT);
    }

    getLabelTextFromLabeledObject(object: THREE.Object3D) {
        return object.userData.symbolWithLabel;
    }
}
