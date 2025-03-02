import * as THREE from "three";

export class BaseTHREEGroupManager {
    THREEGroupName = "";

    THREEGroup: THREE.Group;

    isVisible = false;

    config: any;

    // reference to wave class objects
    waveStructureGroup: THREE.Group;

    waveCamera: THREE.Camera;

    wave: any;

    constructor(waveStructureGroup: THREE.Group, waveCamera: THREE.Camera, wave: any) {
        this.THREEGroup = new THREE.Group();
        this.THREEGroup.name = this.THREEGroupName;
        this.THREEGroup.visible = this.isVisible;
        this.waveStructureGroup = waveStructureGroup;
        this.waveStructureGroup.add(this.THREEGroup);
        this.waveCamera = waveCamera;
        this.wave = wave;
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.THREEGroup.visible = this.isVisible;
        console.log("toggleVisibility", this.THREEGroup, this.THREEGroup.visible);
        if (this.isVisible) {
            this.wave.render();
        }
    }
}
