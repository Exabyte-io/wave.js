import { LABEL_TYPES } from "../../enums";
import settings from "../../settings";
import { BaseLabelsManager } from "./base";
export class DistanceLabelsManager extends BaseLabelsManager {
    constructor(waveStructureGroup, waveCamera, wave, groupName = LABEL_TYPES.DISTANCE) {
        super(waveStructureGroup, waveCamera, wave, groupName);
        this.labelType = LABEL_TYPES.DISTANCE;
        this.isVisible = false;
        this.config = settings.distanceLabelsConfig;
    }
    getLabelTextFromLabeledObject(object) {
        if (object.userData.distance !== undefined) {
            const { distance } = object.userData;
            return `${distance.toFixed(settings.roundPrecision)} Å`;
        }
        return "";
    }
}
