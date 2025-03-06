import * as THREE from "three";
import { ATOM_CONNECTION_LINE_NAME } from "../../enums";
import settings from "../../settings";
import { BaseTHREEGroupManager } from "../base";
import { calculateMidpoint } from "../threeJsUtils";
export class LinesManager extends BaseTHREEGroupManager {
    /**
     * Creates a line between two atoms
     */
    createLineBetweenAtoms(firstAtom, secondAtom) {
        const firstAtomPoint = firstAtom.position.clone();
        const secondAtomPoint = secondAtom.position.clone();
        const geometry = new THREE.BufferGeometry().setFromPoints([
            firstAtomPoint,
            secondAtomPoint,
        ]);
        const material = new THREE.LineBasicMaterial({ color: settings.colors.amber });
        const line = new THREE.Line(geometry, material);
        line.userData.atomicIndices = [
            firstAtom.userData.atomicIndex,
            secondAtom.userData.atomicIndex,
        ];
        line.name = ATOM_CONNECTION_LINE_NAME;
        this.THREEGroup.add(line);
        return line;
    }
    /**
     * Creates lines between pairs of atoms
     */
    createLinesFromAtomPairs(atomPairs) {
        return atomPairs.map((pair) => {
            const line = this.createLineBetweenAtoms(pair[0], pair[1]);
            return line;
        });
    }
    /**
     * Gets the center position of a line
     */
    getLineCenterPosition(line) {
        const geometry = line.geometry;
        const positions = geometry.attributes.position.array;
        const start = new THREE.Vector3(positions[0], positions[1], positions[2]);
        const end = new THREE.Vector3(positions[3], positions[4], positions[5]);
        return calculateMidpoint(start, end);
    }
    /**
     * Removes a line from the group
     */
    removeLine(line) {
        this.THREEGroup.remove(line);
    }
    /**
     * Gets all lines in the group
     */
    getLines() {
        return this.THREEGroup.children.filter((child) => child.type === "Line" && child.name === ATOM_CONNECTION_LINE_NAME);
    }
}
