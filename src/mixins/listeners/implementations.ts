// src/mixins/listeners/implementation.ts
import * as THREE from "three";

import { ATOM_GROUP_NAME } from "../../enums";

export const listenerImplementation = {
    destroyListeners(instance) {
        if (instance.canvas) {
            instance.canvas.removeEventListener("click", instance.onClick);
            instance.canvas.removeEventListener("mousemove", instance.onPointerMove);
        }
    },

    initListeners(instance) {
        if (instance.canvas) {
            instance.canvas.addEventListener("click", instance.onClick);
            instance.canvas.addEventListener("mousemove", instance.onPointerMove);
        }
    },
};

export const raycasterImplementation = {
    initRaycaster(instance) {
        instance.raycaster = new THREE.Raycaster();
        instance.raycaster.params.Line.threshold = 0.1;
        instance.pointer = new THREE.Vector2();
    },

    checkMouseCoordinates(instance, event) {
        instance.pointer.x = (event.offsetX / instance.canvas.width) * 2 - 1;
        instance.pointer.y = -(event.offsetY / instance.canvas.height) * 2 + 1;
        instance.raycaster.setFromCamera(instance.pointer, instance.camera);
    },

    getAtomGroup(instance) {
        const atomGroup = [];
        instance.waveStructureGroup.children.forEach((group) => {
            if (group.name === ATOM_GROUP_NAME) {
                atomGroup.push(...group.children);
            }
        });
        return atomGroup;
    },
};

