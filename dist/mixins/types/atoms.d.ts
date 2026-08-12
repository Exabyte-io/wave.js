import * as THREE from "three";
export interface AtomUserData {
    symbolWithLabel: string;
    atomicIndex: number;
    selected?: boolean;
    hovered?: boolean;
    connections?: string[];
    [key: string]: any;
}
export interface AtomMesh extends THREE.Mesh {
    previousColor?: THREE.Color;
    userData: AtomUserData;
}
export interface AtomObject extends THREE.Object3D {
    userData: AtomUserData;
}
