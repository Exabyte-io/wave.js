import * as THREE from "three";
export class BaseTHREEGroupManager {
    constructor(waveStructureGroup, waveCamera, wave, groupName = "base-group-name") {
        this.isVisible = false;
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
