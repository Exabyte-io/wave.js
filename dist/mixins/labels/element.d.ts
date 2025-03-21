import * as THREE from "three";
import { BaseLabelsManager } from "./base";
export declare class ElementLabelsManager extends BaseLabelsManager {
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
        textParameters: {
            fillStyle: string;
            strokeStyle: string;
            lineWidth: number;
            textAlign: string;
            textBaseline: string;
        };
    };
    constructor(waveStructureGroup: THREE.Group, waveCamera: THREE.Camera, wave: any);
    getLabelTextFromLabeledObject(object: THREE.Object3D): any;
}
