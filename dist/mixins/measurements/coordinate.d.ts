import * as THREE from "three";
import { MEASUREMENT_MODES_ENUM } from "../../enums";
import { LabelsManagerConstructor } from "../labels/base";
import { CoordinateLabelsManager } from "../labels/coordinate";
import { BaseMeasurementManager } from "./base";
export declare class CoordinatesMeasurementManager extends BaseMeasurementManager<CoordinateLabelsManager> {
    measurementType: MEASUREMENT_MODES_ENUM;
    LabelsManagerCls: LabelsManagerConstructor<CoordinateLabelsManager>;
    config: {
        areSpritesUsed: boolean;
        fontFace: string;
        fontSize: number;
        fontWeight: string;
        scale: number;
        scaleWidth: number;
        scaleHeight: number;
        offsetVector: number[];
        textParameters: {
            fillStyle: string;
            strokeStyle: string;
            lineWidth: number;
            textAlign: string;
            textBaseline: string;
        };
    };
    constructor(waveStructureGroup: THREE.Group, waveCamera: THREE.Camera, wave: any, updateState: any);
    onClick: (updateState: (arg: object) => void, event: MouseEvent) => void;
}
