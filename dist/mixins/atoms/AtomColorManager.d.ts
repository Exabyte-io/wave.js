import * as THREE from "three";
import { BaseTHREEGroupManager } from "../base";
export declare class AtomColorManager extends BaseTHREEGroupManager {
    /**
     * Sets the color for an atom by modifying its material properties
     */
    static setColorForAtom(atom: THREE.Object3D, color?: number): void;
    /**
     * Highlights an atom with the specified color
     */
    static highlightAtom(atom: THREE.Object3D, color?: number): void;
    /**
     * Sets atom as hovered with orange color
     */
    static setAtomAsHovered(atom: THREE.Object3D): void;
    /**
     * Unsets atom as hovered and restores previous color
     */
    static unsetAtomAsHovered(atom: THREE.Object3D): void;
}
