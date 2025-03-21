import settings from "../../settings";
import { BaseLabelsManager } from "./base";
export class AngleLabelsManager extends BaseLabelsManager {
    constructor() {
        super(...arguments);
        this.labelType = "angle";
        this.config = settings.angleLabelsConfig;
    }
    getLabelTextFromLabeledObject(object) {
        if (object.userData.angle !== undefined) {
            return `${object.userData.angle.toFixed(2)}°`;
        }
        return "";
    }
}
