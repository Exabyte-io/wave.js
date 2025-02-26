import * as THREE from "three";

import settings from "../../settings";

import { BaseLabelsManager } from "./base";

export class CoordinateLabelsManager extends BaseLabelsManager {
    labelType = "coordinate";

    THREEGroupName = "coordinates-labels";

    areShown = false;

    config: settings.coordinateLabelsConfig;

    textProcessor(atom: THREE.Object3D, position: THREE.Vector3) {
        const separator = " ";
        const precision = settings.roundPrecision;
        return [position.x, position.y, position.z]
            .map((coord) => coord.toFixed(precision))
            .join(separator);
    }

    getOffsetVector(position: THREE.Vector3, camera: THREE.Camera, offsetLength = 0) {
        // TODO: figure out how to pass element here
        const newOffsetLength = this.waveStructureGroup.getAtomRadiusByElement();
        return super.getOffsetVector(position, camera, newOffsetLength);
    }
}

export class ElementLabelsManager extends BaseLabelsManager {
    labelType = "element";

    THREEGroupName = "element-labels";

    areShown = false;

    config: settings.elementLabelsConfig;

    textProcessor(atom: Object3D, position: Vector3) {
        return atom.name;
    }

}
