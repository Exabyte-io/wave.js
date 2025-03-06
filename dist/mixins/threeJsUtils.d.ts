import * as THREE from "three";
/**
 * TODO: import from a shared utils file
 * Converts radians to degrees
 */
export declare function radiansToDegrees(radians: number): number;
export declare function getArrayFromVector(vector: THREE.Vector3): number[];
export declare function getObjectCoordinate(object: THREE.Object3D): THREE.Vector3;
export declare function getObjectCoordinateAsArray(object: THREE.Object3D): number[];
/**
 * Calculates the angle between three points in 3D space
 */
export declare function calculateAngleBetweenPoints(pointA: THREE.Vector3, pointB: THREE.Vector3, pointC: THREE.Vector3): number;
/**
 * Calculates angle between three atoms
 */
export declare function calculateAngleBetweenAtoms(atoms: THREE.Object3D[]): number;
/**
 * Calculates the distance between two points
 */
export declare function calculateDistance(pointA: THREE.Vector3, pointB: THREE.Vector3): number;
/**
 * Calculates distance between two atoms
 */
export declare function calculateDistanceBetweenAtoms(atomA: THREE.Object3D, atomB: THREE.Object3D): number;
/**
 * Calculates the midpoint between two points
 */
export declare function calculateMidpoint(pointA: THREE.Vector3, pointB: THREE.Vector3): THREE.Vector3;
/**
 * Creates a position for a label at an angle between three points
 */
export declare function calculateAngleLabelPosition([firstAtom, centerAtom, thirdAtom]: THREE.Object3D[], offsetDistance?: number): THREE.Vector3;
export declare function isIntersectionObjectAnAtom(intersection: THREE.Intersection): boolean;
/**
 * Sets or resets the color for an atom by modifying its material properties.
 * If no color is provided, it restores the previous color and removes emissive effects.
 */
export declare function setColorForAtom(atom: THREE.Object3D, color?: number): void;
/**
 * Highlights an atom with the specified color.
 */
export declare function highlightAtom(atom: THREE.Object3D, color?: number): void;
/**
 * Sets an atom as hovered with a color.
 */
export declare function setAtomAsHovered(atom: THREE.Object3D): void;
/**
 * Unsets an atom as hovered, restoring its previous color and removing the emissive effect.
 */
export declare function unsetAtomAsHovered(atom: THREE.Object3D): void;
