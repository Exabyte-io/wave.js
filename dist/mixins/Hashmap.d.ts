import * as THREE from "three";
export interface VerticesHashMap {
    [key: string]: number[];
}
export declare class VerticesHashMapHandler {
    hashmap: VerticesHashMap;
    constructor();
    add(key: string, value: number[]): void;
    get(key: string): number[];
    iterateCoordinates(callback: (key: string, coordinateAsArray: number[]) => void): void;
}
export declare function createObjectVerticesHashMap(getVerticeKeyPerObject?: (object: THREE.Object3D) => string, objectsToUse?: THREE.Object3D[]): VerticesHashMapHandler;
