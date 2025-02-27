import * as THREE from "three";

import settings from "../../settings";
import { BaseLabelsManager } from "./base";

export class ElementLabelsManager extends BaseLabelsManager {
    labelType = "element";

    THREEGroupName = "element-labels";

    isVisible = false;

    config = settings.elementLabelsConfig;

    textProcessor(atom: THREE.Object3D, position: THREE.Vector3) {
        return atom.name.split("-")[0];
    }

    getOffsetVector(position: THREE.Vector3, camera: THREE.Camera, offsetLength = 0) {
        // TODO: figure out how to pass element here
        const newOffsetLength = settings.sphereRadius;
        return super.getOffsetVector(position, camera, newOffsetLength);
    }
}
