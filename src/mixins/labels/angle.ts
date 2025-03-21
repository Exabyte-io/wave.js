import * as THREE from "three";

import settings from "../../settings";
import { BaseLabelsManager } from "./base";

export class AngleLabelsManager extends BaseLabelsManager {
    labelType = "angle";

    config = settings.angleLabelsConfig;

    getLabelTextFromLabeledObject(object: THREE.Object3D): string {
        if (object.userData.angle !== undefined) {
            return `${object.userData.angle.toFixed(2)}°`;
        }
        return "";
    }
}
