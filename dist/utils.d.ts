/**
 * Converts a given scene data to a material.
 * Lattice is constructed from the LineSegments object(s) representing the unit cell.
 * Basis is constructed from the base structure's atom sphere meshes (see
 * extractBasisFromScene above for what that excludes).
 */
export function ThreeDSceneDataToMaterial(scene: any): import("@mat3ra/made").Material;
/**
 * Converts given materials to scene data.
 * The first material is used as parent and it's unit cell is used in case multiple materials are passed.
 * Other materials are added as a group under the first material with their cell hidden by default.
 * Atoms are slightly shifted along X axis if multiple materials are passed.
 */
export function materialsToThreeDSceneData(materials: any, shift?: number[]): any;
