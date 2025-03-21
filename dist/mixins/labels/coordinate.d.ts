import * as THREE from "three";
import { BaseLabelsManager } from "./base";
export declare class CoordinateLabelsManager extends BaseLabelsManager {
    labelType: string;
    isVisible: boolean;
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
    constructor(waveStructureGroup: THREE.Group, waveCamera: THREE.Camera, wave: any, groupName?: string);
    getLabelTextFromLabeledObject(atom: THREE.Object3D): string;
}
