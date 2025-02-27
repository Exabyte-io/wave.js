import * as THREE from "three";

import { ATOM_GROUP_NAME } from "../enums";
import { BaseTHREEGroupManager } from "./base";

// This should be mixed into Wave
export class BaseDOMListenerManagerWithThreeGroup extends BaseTHREEGroupManager {
    canvas: HTMLCanvasElement;

    onClick: (event: MouseEvent) => void;

    onPointerMove: (event: MouseEvent) => void;

    destroyListeners() {
        this.canvas.removeEventListener("click", this.onClick);
        this.canvas.removeEventListener("mousemove", this.onPointerMove);
    }

    initListeners() {
        this.onClick = this.onClick.bind(this.onClick);
        this.onPointerMove = this.onPointerMove.bind(this.onPointerMove);
        this.canvas.addEventListener("click", this.onClick);
        this.canvas.addEventListener("mousemove", this.onPointerMove);
    }
}

// This should be mixed into Wave
export class BaseDOMListenreeManagerWtihThreeGroupAndRaycaster extends BaseDOMListenerManagerWithThreeGroup {
    raycaster: THREE.Raycaster;

    pointer: THREE.Vector2;

    initRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Line.threshold = 0.1;
        this.pointer = new THREE.Vector2();
    }

    checkMouseCoordinates(event: MouseEvent) {
        this.pointer.x = (event.offsetX / this.canvas.width) * 2 - 1;
        this.pointer.y = -(event.offsetY / this.canvas.height) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);
    }

    getAtomGroups(): THREE.Object3D[] {
        const atomGroups: THREE.Object3D[] = [];
        this.waveStructureGroup.children.forEach((group) => {
            if (group.name === ATOM_GROUP_NAME) {
                atomGroups.push(...group.children);
            }
        });
        return atomGroups;
    }
}
