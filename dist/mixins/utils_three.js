import * as THREE from "three";
import { COLORS } from "../enums";
/**
 * TODO: import from a shared utils file
 * Converts radians to degrees
 */
export function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}
export function getArrayFromVector(vector) {
    return [vector.x, vector.y, vector.z];
}
export function getObjectCoordinate(object) {
    return new THREE.Vector3().setFromMatrixPosition(object.matrixWorld);
}
export function getObjectCoordinateAsArray(object) {
    const position = getObjectCoordinate(object);
    return getArrayFromVector(position);
}
/**
 * Gets the world position of an atom, accounting for repetition
 */
export function getAtomWorldPosition(atom) {
    const position = new THREE.Vector3();
    // If we have a cached world position (for repeated atoms), use it
    if (atom.userData && atom.userData.worldPosition) {
        position.copy(atom.userData.worldPosition);
    }
    else {
        atom.getWorldPosition(position);
    }
    return position;
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
    const firstPos = getObjectCoordinate(firstAtom);
    const centerPos = getObjectCoordinate(centerAtom);
    const lastPos = getObjectCoordinate(lastAtom);
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
    const pointA = getObjectCoordinate(atomA);
    const pointB = getObjectCoordinate(atomB);
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
export function calculateAngleLabelPosition([firstAtom, centerAtom, thirdAtom], offsetDistance = 0.75) {
    const centerPos = getObjectCoordinate(centerAtom);
    const firstPos = getObjectCoordinate(firstAtom);
    const thirdPos = getObjectCoordinate(thirdAtom);
    // Create vectors from center to first and third points
    const vecFirst = new THREE.Vector3().subVectors(firstPos, centerPos).normalize();
    const vecThird = new THREE.Vector3().subVectors(thirdPos, centerPos).normalize();
    // Calculate the bisector
    const bisector = new THREE.Vector3().addVectors(vecFirst, vecThird).normalize();
    // Position on the bisector at the given distance
    return centerPos.clone().add(bisector.multiplyScalar(offsetDistance));
}
export function isIntersectionObjectAnAtom(intersection) {
    return intersection.object.type === "Mesh";
}
/**
 * Sets or resets the color for an atom by modifying its material properties.
 * If no color is provided, it restores the previous color and removes emissive effects.
 */
export function setColorForAtom(atom, color) {
    if (!(atom instanceof THREE.Mesh))
        return;
    const atomMesh = atom;
    const material = atomMesh.material;
    if (!material)
        return;
    material.emissive.setHex(color !== null && color !== void 0 ? color : COLORS.BLACK);
    if (!color && atomMesh.previousColor) {
        material.color.copy(atomMesh.previousColor);
    }
    else if (color && !atomMesh.previousColor) {
        atomMesh.previousColor = material.color.clone();
    }
}
/**
 * Highlights an atom with the specified color.
 */
export function highlightAtom(atom, color = COLORS.RED) {
    setColorForAtom(atom, color);
}
/**
 * Sets an atom as hovered with a color.
 */
export function setAtomAsHovered(atom) {
    const atomObject = atom;
    atomObject.userData.hovered = true;
    setColorForAtom(atom, COLORS.RED);
}
/**
 * Unsets an atom as hovered, restoring its previous color and removing the emissive effect.
 */
export function unsetAtomAsHovered(atom) {
    const atomObject = atom;
    atomObject.userData.hovered = false;
    setColorForAtom(atom);
}
export function isObjectAnAtom(object) {
    return object instanceof THREE.Mesh;
}
