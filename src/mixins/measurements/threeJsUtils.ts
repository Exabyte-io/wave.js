import * as THREE from "three";
import { ATOM_CONNECTION_LINE_NAME } from "../../enums";

/**
 * TODO: import from a shared utils file
 * Converts radians to degrees
 * @param radians - Angle in radians
 * @returns Angle in degrees
 */
export function radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

/**
 * Calculates angle between three atoms
 * @param atoms - Array of three atoms forming an angle
 * @returns Angle in degrees as a string with 2 decimal places
 */
export function calculateAngleBetweenAtoms(atoms: THREE.Object3D[]): string {
    const [firstAtom, centerAtom, lastAtom] = atoms;

    // Get positions from matrix world
    const firstPos = new THREE.Vector3().setFromMatrixPosition(firstAtom.matrixWorld);
    const centerPos = new THREE.Vector3().setFromMatrixPosition(centerAtom.matrixWorld);
    const lastPos = new THREE.Vector3().setFromMatrixPosition(lastAtom.matrixWorld);

    // Calculate vectors from center to first and last atoms
    const vecA = new THREE.Vector3().subVectors(firstPos, centerPos);
    const vecB = new THREE.Vector3().subVectors(lastPos, centerPos);

    // Calculate angle
    const angleRadians = vecA.angleTo(vecB);
    return radiansToDegrees(angleRadians).toFixed(2);
}

/**
 * Calculates distance between two atoms
 * @param atomA - First atom
 * @param atomB - Second atom
 * @returns Distance in Angstroms
 */
export function calculateDistanceBetweenAtoms(
    atomA: THREE.Object3D,
    atomB: THREE.Object3D,
): number {
    const pointA = new THREE.Vector3().setFromMatrixPosition(atomA.matrixWorld);
    const pointB = new THREE.Vector3().setFromMatrixPosition(atomB.matrixWorld);
    return pointA.distanceTo(pointB);
}

/**
 * Gets positions from matrix world for two atoms
 * @param firstMatrix - Matrix world of first atom
 * @param secondMatrix - Matrix world of second atom
 * @returns Array of two Vector3 positions
 */
export function getPointsFromMatrixWorld(
    firstMatrix: THREE.Matrix4,
    secondMatrix: THREE.Matrix4,
): [THREE.Vector3, THREE.Vector3] {
    const firstPoint = new THREE.Vector3().setFromMatrixPosition(firstMatrix);
    const secondPoint = new THREE.Vector3().setFromMatrixPosition(secondMatrix);
    return [firstPoint, secondPoint];
}

export function addConnection(atom: THREE.Object3D, connectionId: string) {
    if (!atom.userData.connections) {
        atom.userData.connections = [];
    }
    atom.userData.connections.push(connectionId);
}

export function drawLineBetweenAtoms(this: any, selectedAtoms: THREE.Object3D[]): THREE.Line {
    const [firstAtom, secondAtom] = selectedAtoms;
    const [firstAtomPoint, secondAtomPoint] = getPointsFromMatrixWorld(
        firstAtom.matrixWorld,
        secondAtom.matrixWorld,
    );
    const geometry = new THREE.BufferGeometry().setFromPoints([firstAtomPoint, secondAtomPoint]);
    const material = new THREE.LineBasicMaterial({ color: this.settings.colors.amber });
    const line = new THREE.Line(geometry, material);
    addConnection(firstAtom, line.uuid);
    addConnection(secondAtom, line.uuid);
    line.userData.atoms = [firstAtom.uuid, secondAtom.uuid];
    line.name = ATOM_CONNECTION_LINE_NAME;
    this.atomConnections.add(line);
    this.scene.add(this.atomConnections);
    return line;
}
