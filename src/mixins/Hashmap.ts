import * as THREE from "three";

import { getArrayFromVector } from "./utils_three";

export interface VerticesHashMap {
    [key: string]: number[];
}

export class VerticesHashMapHandler {
    hashmap: VerticesHashMap;

    constructor() {
        this.hashmap = {};
    }

    add(key: string, value: number[]) {
        if (!this.hashmap[key]) {
            this.hashmap[key] = [...value];
        } else {
            this.hashmap[key].push(...value);
        }
    }

    get(key: string) {
        return this.hashmap[key];
    }

    iterateCoordinates(callback: (key: string, coordinateAsArray: number[]) => void) {
        Object.entries(this.hashmap).forEach(([key, vertices]) => {
            for (let i = 0; i < vertices.length; i += 3) {
                const coordinateAsArray = vertices.slice(i, i + 3);
                callback(key, coordinateAsArray);
            }
        });
    }
}

export function createObjectVerticesHashMap(
    getVerticeKeyPerObject = (object: THREE.Object3D) => object.name,
    objectsToUse: THREE.Object3D[] = [],
) {
    const positionsHashMap = new VerticesHashMapHandler();
    const getVerticeKeyPerObjectFn = getVerticeKeyPerObject;
    if (objectsToUse)
        objectsToUse.forEach((object: THREE.Object3D) => {
            const [x, y, z] = getArrayFromVector(object.position);
            const mapKey = getVerticeKeyPerObjectFn(object);
            positionsHashMap.add(mapKey, [x, y, z]);
        });
    return positionsHashMap;
}
