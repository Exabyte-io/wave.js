import * as THREE from "three";
import { BaseLabelsManager } from "./base";
export declare class AngleLabelsManager extends BaseLabelsManager {
    labelType: string;
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
    getLabelTextFromLabeledObject(object: THREE.Object3D): string;
}
