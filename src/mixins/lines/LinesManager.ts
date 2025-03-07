import * as THREE from "three";

import { ATOM_CONNECTION_LINE_NAME } from "../../enums";
import settings from "../../settings";
import { BaseTHREEGroupManager } from "../base";
import { calculateMidpoint, getAtomWorldPosition } from "../threeJsUtils";

export class LinesManager extends BaseTHREEGroupManager {
    /**
     * Creates a line between two atoms
     */
    createLineBetweenAtoms(firstAtom: THREE.Object3D, secondAtom: THREE.Object3D): THREE.Line {
        const firstAtomPoint = getAtomWorldPosition(firstAtom);
        const secondAtomPoint = getAtomWorldPosition(secondAtom);

        const line = this.createLineBetweenPoints(firstAtomPoint, secondAtomPoint);

        line.userData.atomicIndices = [
            firstAtom.userData.atomicIndex,
            secondAtom.userData.atomicIndex,
        ];

        this.THREEGroup.add(line);
        return line;
    }

    private createLineBetweenPoints(start: THREE.Vector3, end: THREE.Vector3): THREE.Line {
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({ color: settings.colors.amber });
        const line = new THREE.Line(geometry, material);
        line.name = ATOM_CONNECTION_LINE_NAME;

        return line;
    }

    createLinesFromAtomPairs(atomPairs: THREE.Object3D[][]): THREE.Line[] {
        return atomPairs.map((pair) => {
            const line = this.createLineBetweenAtoms(pair[0], pair[1]);
            return line;
        });
    }

    /**
     * Gets the center position of a line
     */
    getLineCenterPosition(line: THREE.Line): THREE.Vector3 {
        const geometry = line.geometry as THREE.BufferGeometry;
        const positions = geometry.attributes.position.array;

        const start = new THREE.Vector3(positions[0], positions[1], positions[2]);
        const end = new THREE.Vector3(positions[3], positions[4], positions[5]);

        return calculateMidpoint(start, end);
    }

    /**
     * Removes a line from the group
     */
    removeLine(line: THREE.Line): void {
        this.THREEGroup.remove(line);
    }

    /**
     * Gets all lines in the group
     */
    getLines(): THREE.Line[] {
        return this.THREEGroup.children.filter(
            (child) => child.type === "Line" && child.name === ATOM_CONNECTION_LINE_NAME,
        ) as THREE.Line[];
    }
}
