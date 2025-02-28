import * as THREE from "three";

import { ATOM_GROUP_NAME } from "../enums";
import { BaseTHREEGroupManager } from "./base";
import { listenerImplementation, raycasterImplementation } from "./listeners/implementations";
import { IListenerCapable, IRaycasterCapable } from "./listeners/types";

// This should be mixed into Wave
export class BaseDOMListenerManagerWithThreeGroup
    extends BaseTHREEGroupManager
    implements IListenerCapable
{
    canvas: HTMLCanvasElement;

    onClick: (event: MouseEvent) => void;

    onPointerMove: (event: MouseEvent) => void;

    destroyListeners() {
        listenerImplementation.destroyListeners(this);
    }

    initListeners(updateState?: any, settings?: any) {
        this.onClick = this.onClick.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        listenerImplementation.initListeners(this);
    }
}

// This should be mixed into Wave
export class BaseDOMListenerManagerWithThreeGroupAndRaycaster
    extends BaseDOMListenerManagerWithThreeGroup
    implements IRaycasterCapable
{
    raycaster: THREE.Raycaster;

    pointer: THREE.Vector2;

    camera: THREE.Camera;

    initRaycaster() {
        raycasterImplementation.initRaycaster(this);
    }

    checkMouseCoordinates(event: MouseEvent) {
        raycasterImplementation.checkMouseCoordinates(this, event);
    }

    getAtomGroup(): THREE.Object3D[] {
        return raycasterImplementation.getAtomGroup(this);
    }
}
