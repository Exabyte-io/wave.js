import * as THREE from "three";
type Constructor<T = object> = new (...args: any[]) => T;
export declare const ListenersMixin: <T extends Constructor>(superclass: T) => {
    new (...args: any[]): {
        canvas: HTMLCanvasElement;
        onClick(event: MouseEvent): void;
        onPointerMove(event: MouseEvent): void;
        destroyListeners(): void;
        initListeners(updateState: (arg: object) => void): void;
    };
} & T;
export declare const RaycasterMixinWithListeners: <T extends Constructor>(superclass: T) => {
    new (...args: any[]): {
        raycaster: THREE.Raycaster;
        pointer: THREE.Vector2;
        intersectedAtom: THREE.Object3D | null;
        initRaycaster(): void;
        checkMouseCoordinates(event: MouseEvent, camera: THREE.Camera): void;
        canvas: HTMLCanvasElement;
        onClick(event: MouseEvent): void;
        onPointerMove(event: MouseEvent): void;
        destroyListeners(): void;
        initListeners(updateState: (arg: object) => void): void;
    };
} & T;
export {};
