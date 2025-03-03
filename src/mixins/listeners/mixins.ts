import * as THREE from "three";

type Constructor<T = {}> = new (...args: any[]) => T;

export const ListenersMixin = <T extends Constructor>(superclass: T) =>
    class extends superclass {
        canvas: HTMLCanvasElement;

        onClick(event: MouseEvent) {
            console.log("clicked");
        }

        onPointerMove(event: MouseEvent) {
            console.log("moved");
        }

        destroyListeners() {
            this.canvas.removeEventListener("click", this.onClick);
            this.canvas.removeEventListener("mousemove", this.onPointerMove);
        }

        initListeners(updateState) {
            const clickFunction = this.onClick.bind(this, updateState);
            this.canvas.addEventListener("click", clickFunction);
            this.canvas.addEventListener("mousemove", this.onPointerMove);
        }
    };

export const RaycasterMixinWithListeners = <T extends Constructor>(superclass: T) =>
    class extends ListenersMixin(superclass) {
        raycaster: THREE.Raycaster = new THREE.Raycaster();

        pointer: THREE.Vector2 = new THREE.Vector2();

        intersectedAtom: THREE.Object3D | null = null;

        initRaycaster() {
            this.raycaster = new THREE.Raycaster();
            this.raycaster.params.Line.threshold = 0.1;
            this.pointer = new THREE.Vector2();
        }

        checkMouseCoordinates(event: MouseEvent, camera: THREE.Camera) {
            this.pointer.x = (event.offsetX / this.canvas.width) * 2 - 1;
            this.pointer.y = -(event.offsetY / this.canvas.height) * 2 + 1;
            this.raycaster.setFromCamera(this.pointer, camera);
        }
    };
