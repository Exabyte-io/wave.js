import * as THREE from "three";

import { LABEL_TYPES } from "../enums";

export class BaseTHREEGroupManager {
    THREEGroup: THREE.Group;

    isVisible = false;

    config: any;

    // reference to wave class objects
    waveStructureGroup: THREE.Group;

    waveCamera: THREE.Camera;

    wave: any;

    constructor(
        waveStructureGroup: THREE.Group,
        waveCamera: THREE.Camera,
        wave: any,
        groupName = "base-group-name",
    ) {
        this.THREEGroup = new THREE.Group();
        this.THREEGroup.name = groupName;
        this.THREEGroup.visible = this.isVisible;
        this.waveStructureGroup = waveStructureGroup;
        this.waveCamera = waveCamera;
        this.wave = wave;
    }

    addToWaveStructureGroup() {
        this.waveStructureGroup.add(this.THREEGroup);
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.THREEGroup.visible = this.isVisible;
    }
}
