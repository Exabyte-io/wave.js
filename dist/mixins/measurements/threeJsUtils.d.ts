import * as THREE from "three";
/**
 * TODO: import from a shared utils file
 * Converts radians to degrees
 */
export declare function radiansToDegrees(radians: number): number;
/**
 * Gets the world position of an object
 */
export declare function getWorldPosition(object: THREE.Object3D): THREE.Vector3;
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
export declare function calculateAngleLabelPosition(line: THREE.Line, offset: number): THREE.Vector3;
/**
 * Gets positions from matrix world for two atoms
 */
export declare function getPointsFromMatrixWorld(firstMatrix: THREE.Matrix4, secondMatrix: THREE.Matrix4): [THREE.Vector3, THREE.Vector3];
/**
 * Creates a line between two atoms
 */
export declare function drawLineBetweenAtoms(this: any, selectedAtoms: THREE.Object3D[]): THREE.Line;
/**
 * Gets the position of the center of a THREE.Line
 */
export declare function getLineCenterCoordinate(line: THREE.Line): THREE.Vector3;
