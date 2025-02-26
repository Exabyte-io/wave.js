import * as THREE from "three";
import { ATOM_CONNECTION_LINE_NAME } from "../../enums";
/**
 * TODO: import from a shared utils file
 * Converts radians to degrees
 */
export function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}
/**
 * Gets the world position of an object
 */
export function getWorldPosition(object) {
    return new THREE.Vector3().setFromMatrixPosition(object.matrixWorld);
}
/**
 * Calculates the angle between three points in 3D space
 */
export function calculateAngleBetweenPoints(pointA, pointB, pointC) {
    const vecA = new THREE.Vector3().subVectors(pointA, pointB);
    const vecC = new THREE.Vector3().subVectors(pointC, pointB);
    const angleRadians = vecA.angleTo(vecC);
    return radiansToDegrees(angleRadians);
}
/**
 * Calculates angle between three atoms
 */
export function calculateAngleBetweenAtoms(atoms) {
    const [firstAtom, centerAtom, lastAtom] = atoms;
    const firstPos = getWorldPosition(firstAtom);
    const centerPos = getWorldPosition(centerAtom);
    const lastPos = getWorldPosition(lastAtom);
    return parseFloat(calculateAngleBetweenPoints(firstPos, centerPos, lastPos).toFixed(2));
}
/**
 * Calculates the distance between two points
 */
export function calculateDistance(pointA, pointB) {
    return pointA.distanceTo(pointB);
}
/**
 * Calculates distance between two atoms
 */
export function calculateDistanceBetweenAtoms(atomA, atomB) {
    const pointA = getWorldPosition(atomA);
    const pointB = getWorldPosition(atomB);
    return calculateDistance(pointA, pointB);
}
/**
 * Calculates the midpoint between two points
 */
export function calculateMidpoint(pointA, pointB) {
    return new THREE.Vector3().addVectors(pointA, pointB).multiplyScalar(0.5);
}
/**
 * Creates a position for a label at an angle between three points
 */
export function calculateAngleLabelPosition(line, offset) {
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
export function getPointsFromMatrixWorld(firstMatrix, secondMatrix) {
    const firstPoint = new THREE.Vector3().setFromMatrixPosition(firstMatrix);
    const secondPoint = new THREE.Vector3().setFromMatrixPosition(secondMatrix);
    return [firstPoint, secondPoint];
}
/**
 * Creates a line between two atoms
 */
export function drawLineBetweenAtoms(selectedAtoms) {
    const [firstAtom, secondAtom] = selectedAtoms;
    const firstAtomPoint = getWorldPosition(firstAtom);
    const secondAtomPoint = getWorldPosition(secondAtom);
    const geometry = new THREE.BufferGeometry().setFromPoints([firstAtomPoint, secondAtomPoint]);
    const material = new THREE.LineBasicMaterial({ color: this.settings.colors.amber });
    const line = new THREE.Line(geometry, material);
    line.userData.atoms = [firstAtom.uuid, secondAtom.uuid];
    line.name = ATOM_CONNECTION_LINE_NAME;
    return line;
}
/**
 * Gets the position of the center of a THREE.Line
 */
export function getLineCenterCoordinate(line) {
    const geometry = line.geometry;
    const positions = geometry.attributes.position.array;
    const start = new THREE.Vector3(positions[0], positions[1], positions[2]);
    const end = new THREE.Vector3(positions[3], positions[4], positions[5]);
    return calculateMidpoint(start, end);
}
