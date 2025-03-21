import * as THREE from "three";

import { LABEL_TYPES } from "../../enums";
import settings from "../../settings";
import { BaseLabelsManager } from "./base";

export class DistanceLabelsManager extends BaseLabelsManager {
    override labelType = LABEL_TYPES.DISTANCE;

    isVisible = false;

    config = settings.distanceLabelsConfig;

    constructor(
        waveStructureGroup: THREE.Group,
        waveCamera: THREE.Camera,
        wave: any,
        groupName = LABEL_TYPES.DISTANCE,
    ) {
        super(waveStructureGroup, waveCamera, wave, groupName);
    }

    getLabelTextFromLabeledObject(object: THREE.Object3D): string {
        if (object.userData.distance !== undefined) {
            const { distance } = object.userData;
            return `${distance.toFixed(settings.roundPrecision)} Å`;
        }
        return "";
    }
}
