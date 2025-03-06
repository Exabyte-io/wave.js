import * as THREE from "three";
export declare class BaseTHREEGroupManager {
    THREEGroup: THREE.Group;
    isVisible: boolean;
    config: any;
    waveStructureGroup: THREE.Group;
    waveCamera: THREE.Camera;
    wave: any;
    constructor(waveStructureGroup: THREE.Group, waveCamera: THREE.Camera, wave: any, groupName?: string);
    addToWaveStructureGroup(): void;
    toggleVisibility(): void;
}
