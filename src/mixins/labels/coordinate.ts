import * as THREE from "three";
import { Object3D } from "three";

import settings from "../../settings";
import { getArrayFromVector } from "../threeJsUtils";
import { BaseLabelsManager } from "./base";

// @ts-ignore
export class CoordinateLabelsManager extends BaseLabelsManager {
    labelType = "coordinate";

    THREEGroupName = "coordinates-labels";

    isVisible = false;

    config = settings.coordinateLabelsConfig;

    getLabelTextFromAtomObject(atom: THREE.Object3D) {
        const separator = " ";
        const precision = settings.roundPrecision;
        const vectorAsArray = getArrayFromVector(atom.position);
        return vectorAsArray.map((coord: number) => coord.toFixed(precision)).join(separator);
    }
}
