import { LABEL_TYPES } from "../../enums";
import settings from "../../settings";
import { BaseLabelsManager } from "./base";
export class ElementLabelsManager extends BaseLabelsManager {
    constructor(waveStructureGroup, waveCamera, wave) {
        super(waveStructureGroup, waveCamera, wave, LABEL_TYPES.ELEMENT);
        this.labelType = LABEL_TYPES.ELEMENT;
        this.isVisible = false;
        this.config = settings.elementLabelsConfig;
    }
    getLabelTextFromLabeledObject(object) {
        return object.userData.symbolWithLabel;
    }
}
