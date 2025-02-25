import * as THREE from "three";

export class LabelsHolder {
    constructor(config) {
        this.labelType = config.labelType || "labels";
        this.threeJsGroupName = config.threeJsGroupName || "LABELS_GROUP_NAME";
        this.areShown = config.areShown || false;
        this.threeJsGroup = new THREE.Group();
        this.threeJsGroup.name = this.threeJsGroupName;
        this.threeJsGroup.visible = this.areShown;

        this.config = config.config || {};

        // Processing functions
        this.textProcessor = config.textProcessor || (() => "");
        this.getOffsetVector = config.getOffsetVector || (() => new THREE.Vector3());
        this.getUserData =
            config.getUserData ||
            ((text, position) => ({ atomPosition: position, atomName: text }));
        this.getNameForLabel =
            config.getNameForLabel || ((text) => `${this.labelType}-label-for-${text}`);
    }
}
