import * as THREE from "three";
export const ListenersMixin = (superclass) => class extends superclass {
    constructor() {
        super(...arguments);
        this.canvas = document.createElement("canvas");
    }
    onClick(event) {
        console.log("clicked");
    }
    onPointerMove(event) {
        console.log("moved");
    }
    destroyListeners() {
        this.canvas.removeEventListener("click", this.onClick);
        this.canvas.removeEventListener("mousemove", this.onPointerMove);
    }
    initListeners(updateState) {
        // @ts-ignore
        const clickFunction = this.onClick.bind(this, updateState);
        this.canvas.addEventListener("click", clickFunction);
        this.canvas.addEventListener("mousemove", this.onPointerMove);
    }
};
export const RaycasterMixinWithListeners = (superclass) => class extends ListenersMixin(superclass) {
    constructor() {
        super(...arguments);
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.intersectedObject = null;
    }
    initRaycaster() {
        this.raycaster = new THREE.Raycaster();
        // Assigned wholesale rather than mutating `.threshold` in place: Raycaster's
        // `params.Line` is optional, so the in-place write was an unchecked dereference
        // that only typechecked because @types/three was 33 minors ahead of the runtime.
        this.raycaster.params.Line = { threshold: 0.1 };
        this.pointer = new THREE.Vector2();
    }
    checkMouseCoordinates(event, camera) {
        this.pointer.x = (event.offsetX / this.canvas.width) * 2 - 1;
        this.pointer.y = -(event.offsetY / this.canvas.height) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, camera);
    }
};
