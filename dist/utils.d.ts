/**
 * Converts a given scene data to a material.
 * Lattice is constructed from the LineSegments object(s) representing the unit cell.
 * Basis is constructed from the base structure's atom sphere meshes (see
 * extractBasisFromScene above for what that excludes).
 */
export function ThreeDSceneDataToMaterial(scene: any): import("@mat3ra/made").Material<import("@mat3ra/made/dist/js/Material").MaterialSchemaMap>;
