import * as THREE from "three";
import { BaseTHREEGroupManager } from "../base";
export declare class LinesManager extends BaseTHREEGroupManager {
    /**
     * Creates a line between two atoms
     */
    createLineBetweenAtoms(firstAtom: THREE.Object3D, secondAtom: THREE.Object3D): THREE.Line;
    private createLineBetweenPoints;
    createLinesFromAtomPairs(atomPairs: THREE.Object3D[][]): THREE.Line[];
    /**
     * Creates an angle line connecting three atoms
     */
    createAngleBetweenAtoms(firstAtom: THREE.Object3D, middleAtom: THREE.Object3D, lastAtom: THREE.Object3D): THREE.Line;
    /**
     * Gets the center position of a line
     */
    getLineCenterPosition(line: THREE.Line): THREE.Vector3;
    /**
     * Removes a line from the group
     */
    removeLine(line: THREE.Line): void;
    /**
     * Gets all lines in the group
     */
    getLines(): THREE.Line[];
    setLineAsHovered(line: THREE.Line): void;
    unsetLineAsHovered(line: THREE.Line): void;
    setLineAsSelected(line: THREE.Line): void;
    unsetLineAsSelected(line: THREE.Line): void;
    deselectAllLines(): void;
}
