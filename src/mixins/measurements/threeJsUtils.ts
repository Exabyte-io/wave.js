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
export function calculateAngleBetweenAtoms(atoms: THREE.Object3D[]): number {
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

export function drawLineBetweenAtoms(this: any, selectedAtoms: THREE.Object3D[]) {
    const [firstAtom, secondAtom] = selectedAtoms;
    const [firstAtomPoint, secondAtomPoint] = getPointsFromMatrixWorld(
        firstAtom.matrixWorld,
        secondAtom.matrixWorld,
    );
    const geometry = new THREE.BufferGeometry().setFromPoints([firstAtomPoint, secondAtomPoint]);
    const material = new THREE.LineBasicMaterial({ color: this.settings.colors.amber });
    const line = new THREE.Line(geometry, material);

    line.userData.atoms = [firstAtom.uuid, secondAtom.uuid];
    line.name = ATOM_CONNECTION_LINE_NAME;

    return line;
}

/**
 * Gets the position of the center of a THREE.Line
 * @param line - The THREE.Line object
 * @returns The position of the center as a THREE.Vector3
 */
export function getLineCenterCoordinate(line: THREE.Line): THREE.Vector3 {
    const geometry = line.geometry as THREE.BufferGeometry;
    const positions = geometry.attributes.position.array;

    const start = new THREE.Vector3(positions[0], positions[1], positions[2]);
    const end = new THREE.Vector3(positions[3], positions[4], positions[5]);

    const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    return center;
}
