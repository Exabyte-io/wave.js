import { LABEL_TYPES } from "../../enums";
import settings from "../../settings";
import { getArrayFromVector } from "../utils_three";
import { BaseLabelsManager } from "./base";
// @ts-ignore
export class CoordinateLabelsManager extends BaseLabelsManager {
    constructor(waveStructureGroup, waveCamera, wave, groupName = LABEL_TYPES.COORDINATE) {
        super(waveStructureGroup, waveCamera, wave, groupName);
        this.labelType = LABEL_TYPES.COORDINATE;
        this.isVisible = false;
        this.config = settings.coordinateLabelsConfig;
    }
    getLabelTextFromLabeledObject(atom) {
        const separator = " ";
        const precision = settings.roundPrecision;
        const vectorAsArray = getArrayFromVector(atom.position);
        return vectorAsArray.map((coord) => coord.toFixed(precision)).join(separator);
    }
}
