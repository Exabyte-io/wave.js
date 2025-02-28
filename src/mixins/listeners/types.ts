// src/mixins/listeners/types.ts
import * as THREE from "three";

export interface IListenerCapable {
    canvas: HTMLCanvasElement;
    onClick: (event: MouseEvent) => void;
    onPointerMove: (event: MouseEvent) => void;

    destroyListeners(): void;
    initListeners(updateState?: any, settings?: any): void;
}

export interface IRaycasterCapable {
    raycaster: THREE.Raycaster;
    pointer: THREE.Vector2;
    camera: THREE.Camera;

    initRaycaster(): void;
    checkMouseCoordinates(event: MouseEvent): void;
    getAtomGroup(): THREE.Object3D[];
}
