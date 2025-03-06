import * as THREE from "three";

import { ATOM_CONNECTION_LINE_NAME, COLORS } from "../enums";
import settings from "../settings";
import { AtomMesh, AtomObject } from "./types/atoms";

/**
 * TODO: import from a shared utils file
 * Converts radians to degrees
 */
export function radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

export function getArrayFromVector(vector: THREE.Vector3): number[] {
    return [vector.x, vector.y, vector.z];
}

export function getObjectCoordinate(object: THREE.Object3D): THREE.Vector3 {
    return new THREE.Vector3().setFromMatrixPosition(object.matrixWorld);
}

export function getObjectCoordinateAsArray(object: THREE.Object3D): number[] {
    const position = getObjectCoordinate(object);
    return getArrayFromVector(position);
}

/**
 * Calculates the angle between three points in 3D space
 */
export function calculateAngleBetweenPoints(
    pointA: THREE.Vector3,
    pointB: THREE.Vector3,
    pointC: THREE.Vector3,
): number {
    const vecA = new THREE.Vector3().subVectors(pointA, pointB);
    const vecC = new THREE.Vector3().subVectors(pointC, pointB);

    const angleRadians = vecA.angleTo(vecC);
    return radiansToDegrees(angleRadians);
}

/**
 * Calculates angle between three atoms
 */
export function calculateAngleBetweenAtoms(atoms: THREE.Object3D[]): number {
    const [firstAtom, centerAtom, lastAtom] = atoms;

    const firstPos = getObjectCoordinate(firstAtom);
    const centerPos = getObjectCoordinate(centerAtom);
    const lastPos = getObjectCoordinate(lastAtom);

    return parseFloat(calculateAngleBetweenPoints(firstPos, centerPos, lastPos).toFixed(2));
}

/**
 * Calculates the distance between two points
 */
export function calculateDistance(pointA: THREE.Vector3, pointB: THREE.Vector3): number {
    return pointA.distanceTo(pointB);
}

/**
 * Calculates distance between two atoms
 */
export function calculateDistanceBetweenAtoms(
    atomA: THREE.Object3D,
    atomB: THREE.Object3D,
): number {
    const pointA = getObjectCoordinate(atomA);
    const pointB = getObjectCoordinate(atomB);
    return calculateDistance(pointA, pointB);
}

/**
 * Calculates the midpoint between two points
 */
export function calculateMidpoint(pointA: THREE.Vector3, pointB: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3().addVectors(pointA, pointB).multiplyScalar(0.5);
}

/**
 * Creates a position for a label at an angle between three points
 */
export function calculateAngleLabelPosition(line: THREE.Line, offset: number): THREE.Vector3 {
    const positions = line.geometry.attributes.position.array;

    const pointA = new THREE.Vector3(positions[0], positions[1], positions[2]);
    const pointB = new THREE.Vector3(positions[3], positions[4], positions[5]);
    const pointC = new THREE.Vector3(positions[6], positions[7], positions[8]);

    const vecA = new THREE.Vector3().subVectors(pointA, pointB).normalize();
    const vecC = new THREE.Vector3().subVectors(pointC, pointB).normalize();

    // Calculate the bisector
    const bisector = new THREE.Vector3().addVectors(vecA, vecC).normalize();

    // Create the offset position
    return pointB.clone().add(bisector.multiplyScalar(offset));
}

/**
 * Gets positions from matrix world for two atoms
 */
export function getPointsFromMatrixWorld(
    firstMatrix: THREE.Matrix4,
    secondMatrix: THREE.Matrix4,
): [THREE.Vector3, THREE.Vector3] {
    const firstPoint = new THREE.Vector3().setFromMatrixPosition(firstMatrix);
    const secondPoint = new THREE.Vector3().setFromMatrixPosition(secondMatrix);
    return [firstPoint, secondPoint];
}

/**
 * Creates a line between two atoms
 */
export function drawLineBetweenTwoAtoms(selectedAtoms: THREE.Object3D[]): THREE.Line {
    const [firstAtom, secondAtom] = selectedAtoms;

    const firstAtomPoint = getObjectCoordinate(firstAtom);
    const secondAtomPoint = getObjectCoordinate(secondAtom);

    const geometry = new THREE.BufferGeometry().setFromPoints([firstAtomPoint, secondAtomPoint]);
    const material = new THREE.LineBasicMaterial({ color: settings.colors.amber });
    const line = new THREE.Line(geometry, material);

    line.userData.atoms = [firstAtom.uuid, secondAtom.uuid];
    line.name = ATOM_CONNECTION_LINE_NAME;

    return line;
}

/**
 * Gets the position of the center of a THREE.Line
 */
export function getLineCenterCoordinate(line: THREE.Line): THREE.Vector3 {
    const geometry = line.geometry as THREE.BufferGeometry;
    const positions = geometry.attributes.position.array;

    const start = new THREE.Vector3(positions[0], positions[1], positions[2]);
    const end = new THREE.Vector3(positions[3], positions[4], positions[5]);

    return calculateMidpoint(start, end);
}

/**
 * Sets or resets the color for an atom by modifying its material properties.
 * If no color is provided, it restores the previous color and removes emissive effects.
 */
export function setColorForAtom(atom: THREE.Object3D, color?: number): void {
    if (!(atom instanceof THREE.Mesh)) return;

    const atomMesh = atom as AtomMesh;
    const material = atomMesh.material as THREE.MeshStandardMaterial;

    if (!material) return;

    material.emissive.setHex(color ?? COLORS.BLACK);
    if (!color && atomMesh.previousColor) {
        material.color.copy(atomMesh.previousColor);
    } else if (color && !atomMesh.previousColor) {
        atomMesh.previousColor = material.color.clone();
    }
}

/**
 * Highlights an atom with the specified color.
 */
export function highlightAtom(atom: THREE.Object3D, color: number = COLORS.RED): void {
    setColorForAtom(atom, color);
}

/**
 * Sets an atom as hovered with a color.
 */
export function setAtomAsHovered(atom: THREE.Object3D): void {
    const atomObject = atom as AtomObject;
    atomObject.userData.hovered = true;
    setColorForAtom(atom, COLORS.RED);
}

/**
 * Unsets an atom as hovered, restoring its previous color and removing the emissive effect.
 */
export function unsetAtomAsHovered(atom: THREE.Object3D): void {
    const atomObject = atom as AtomObject;
    atomObject.userData.hovered = false;
    setColorForAtom(atom);
}
