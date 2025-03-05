import * as THREE from "three";

import { COLORS } from "../../enums";
import { BaseTHREEGroupManager } from "../base";
import { AtomMesh, AtomObject } from "../types/atoms";

// TODO: move to utils
export class AtomColorManager extends BaseTHREEGroupManager {
    /**
     * Sets the color for an atom by modifying its material properties
     */
    static setColorForAtom(atom: THREE.Object3D, color?: number): void {
        if (!(atom instanceof THREE.Mesh)) return;

        const atomMesh = atom as AtomMesh;
        const material = atomMesh.material as THREE.MeshStandardMaterial;

        if (!material || !material.emissive) return;

        const newColor =
            color || (atomMesh.previousColor ? atomMesh.previousColor.getHex() : COLORS.WHITE);
        atomMesh.previousColor = material.color.clone();
        material.emissive.setHex(newColor);
    }

    /**
     * Highlights an atom with the specified color
     */
    static highlightAtom(atom: THREE.Object3D, color: number = COLORS.RED): void {
        this.setColorForAtom(atom, color);
    }

    /**
     * Sets atom as hovered with orange color
     */
    static setAtomAsHovered(atom: THREE.Object3D): void {
        const atomObject = atom as AtomObject;
        atomObject.userData.hovered = true;
        this.setColorForAtom(atom, COLORS.ORANGE);
    }

    /**
     * Unsets atom as hovered and restores previous color
     */
    static unsetAtomAsHovered(atom: THREE.Object3D): void {
        const atomObject = atom as AtomObject;
        atomObject.userData.hovered = false;
        this.setColorForAtom(atom);
    }
}
