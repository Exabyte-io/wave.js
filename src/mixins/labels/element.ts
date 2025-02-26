import * as THREE from "three";

import settings from "../../settings";

export class ElementLabelsManager extends BaseLabelsManager {
    labelType = "element";

    THREEGroupName = "element-labels";

    areShown = false;

    config: settings.elementLabelsConfig;

    textProcessor(atom: Object3D, position: Vector3) {
        return atom.name;
    }

}
