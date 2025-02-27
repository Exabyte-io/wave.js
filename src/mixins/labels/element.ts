import * as THREE from "three";

import settings from "../../settings";
import { BaseLabelsManager } from "./base";

export class ElementLabelsManager extends BaseLabelsManager {
    labelType = "element";

    THREEGroupName = "element-labels";

    isVisible = false;

    config = settings.elementLabelsConfig;

    textProcessor(atom: THREE.Object3D, position: THREE.Vector3) {
        return atom.name;
    }

    getOffsetVector(position: THREE.Vector3, camera: THREE.Camera, offsetLength = 0) {
        const vectorToCamera = new THREE.Vector3().subVectors(camera.position, position);
        const zOffset =
            settings.coordinateLabelsConfig.offsetVector[2] +
            offsetLength * settings.atomRadiiScale;

        vectorToCamera.normalize();
        vectorToCamera.multiplyScalar(offsetLength);
        vectorToCamera.z += zOffset;

        return vectorToCamera;
    }
}
