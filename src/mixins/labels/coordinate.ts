import * as THREE from "three";

import settings from "../../settings";
import { BaseLabelsManager } from "./base";

export class CoordinateLabelsManager extends BaseLabelsManager {
    labelType = "coordinate";

    THREEGroupName = "coordinates-labels";

    isVisible = false;

    config = settings.coordinateLabelsConfig;

    textProcessor(atom: THREE.Object3D, position: THREE.Vector3) {
        const separator = " ";
        const precision = settings.roundPrecision;
        return [position.x, position.y, position.z]
            .map((coord) => coord.toFixed(precision))
            .join(separator);
    }

    getOffsetVector(position: THREE.Vector3, camera: THREE.Camera, offsetLength = 0) {
        // TODO: figure out how to pass element here
        const newOffsetLength = settings.sphereRadius;
        const additionalOffsetVector = this.config.offsetVector;

        return super.getOffsetVector(position, camera, newOffsetLength, additionalOffsetVector);
    }
}
