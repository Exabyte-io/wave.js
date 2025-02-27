import * as THREE from "three";

export class BaseTHREEGroupManager {
    THREEGroupName = "";

    THREEGroup: THREE.Group;

    isVisible = false;

    config: any;

    // reference to wave class objects
    waveStructureGroup: THREE.Group;

    waveCamera: THREE.Camera;

    constructor(waveStructureGroup: THREE.Group, waveCamera: THREE.Camera) {
        this.THREEGroup = new THREE.Group();
        this.THREEGroup.name = this.THREEGroupName;
        this.THREEGroup.visible = this.isVisible;
        this.waveStructureGroup = waveStructureGroup;
        this.waveStructureGroup.add(this.THREEGroup);
        this.waveCamera = waveCamera;
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.THREEGroup.visible = this.isVisible;
    }
}
