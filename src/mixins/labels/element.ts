import * as THREE from "three";
import { Object3D } from "three";

import settings from "../../settings";
import { BaseLabelsManager } from "./base";

export class ElementLabelsManager extends BaseLabelsManager {
    labelType = "element";

    THREEGroupName = "element-labels";

    isVisible = false;

    config = settings.elementLabelsConfig;
}
