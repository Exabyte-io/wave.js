import * as THREE from "three";
import { COLORS } from "../../enums";
import { BaseTHREEGroupManager } from "../base";
export class AtomColorManager extends BaseTHREEGroupManager {
    /**
     * Sets the color for an atom by modifying its material properties
     */
    static setColorForAtom(atom, color) {
        if (!(atom instanceof THREE.Mesh))
            return;
        const atomMesh = atom;
        const material = atomMesh.material;
        if (!material || !material.emissive)
            return;
        const newColor = color || (atomMesh.previousColor ? atomMesh.previousColor.getHex() : COLORS.WHITE);
        atomMesh.previousColor = material.color.clone();
        material.emissive.setHex(newColor);
    }
    /**
     * Highlights an atom with the specified color
     */
    static highlightAtom(atom, color = COLORS.RED) {
        this.setColorForAtom(atom, color);
    }
    /**
     * Sets atom as hovered with orange color
     */
    static setAtomAsHovered(atom) {
        const atomObject = atom;
        atomObject.userData.hovered = true;
        this.setColorForAtom(atom, COLORS.ORANGE);
    }
    /**
     * Unsets atom as hovered and restores previous color
     */
    static unsetAtomAsHovered(atom) {
        const atomObject = atom;
        atomObject.userData.hovered = false;
        this.setColorForAtom(atom);
    }
}
