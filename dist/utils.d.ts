/**
 * Converts a given scene data to a material.
 * Lattice is constructed from the LineSegments object.
 * Basis is constructed based on all SphereMesh objects.
 */
export function ThreeDSceneDataToMaterial(scene: any): import("@mat3ra/made").Material<import("@mat3ra/made/dist/js/Material").MaterialSchemaMap>;
/**
 * Converts given materials to scene data.
 * The first material is used as parent and it's unit cell is used in case multiple materials are passed.
 * Other materials are added as a group under the first material with their cell hidden by default.
 * Atoms are slightly shifted along X axis if multiple materials are passed.
 */
export function materialsToThreeDSceneData(materials: any, shift?: number[]): any;
