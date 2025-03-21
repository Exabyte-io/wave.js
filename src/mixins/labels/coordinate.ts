import * as THREE from "three";

import { LABEL_TYPES } from "../../enums";
import settings from "../../settings";
import { getArrayFromVector } from "../utils_three";
import { BaseLabelsManager } from "./base";

// @ts-ignore
export class CoordinateLabelsManager extends BaseLabelsManager {
    override labelType = LABEL_TYPES.COORDINATE;

    isVisible = false;

    config = settings.coordinateLabelsConfig;

    constructor(
        waveStructureGroup: THREE.Group,
        waveCamera: THREE.Camera,
        wave: any,
        groupName = LABEL_TYPES.COORDINATE,
    ) {
        super(waveStructureGroup, waveCamera, wave, groupName);
    }

    getLabelTextFromLabeledObject(atom: THREE.Object3D) {
        const separator = " ";
        const precision = settings.roundPrecision;
        const vectorAsArray = getArrayFromVector(atom.position);
        return vectorAsArray.map((coord: number) => coord.toFixed(precision)).join(separator);
    }
}
