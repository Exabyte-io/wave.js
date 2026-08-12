import * as THREE from "three";
import { BaseTHREEGroupManager } from "../base";
import { VerticesHashMapHandler } from "../Hashmap";
export type LabelsManagerConstructor<T extends BaseLabelsManager> = new (waveStructureGroup: THREE.Group, waveCamera: THREE.Camera, wave: any) => T;
export declare abstract class BaseLabelsManager extends BaseTHREEGroupManager {
    labelType: string;
    private THREETexturesCache;
    abstract getLabelTextFromLabeledObject(object: THREE.Object3D): string;
    getOffsetVectorMultiplierPerAtomName(atomName: string): any;
    getVectorToCameraNormalized(position: THREE.Vector3, camera: THREE.Camera): THREE.Vector3;
    getOffsetVector(position: THREE.Vector3, camera: THREE.Camera, offsetLength?: number): THREE.Vector3;
    getNameForLabel(text: string): string;
    createLabelTextTexture(text: string): THREE.Texture;
    getLabelTextTexture(text: string): THREE.Texture;
    /**
     * Creates a sprite with a label text
     */
    createLabelSprite(text: string, name: string): THREE.Sprite;
    /**
     * Creates and positions multiple labels as sprites
     * More flexible but less performant than Points for many labels
     */
    createLabelsAsSprites(verticesHashMap: VerticesHashMapHandler, threeGroup?: THREE.Group): void;
    createLabels(atoms?: THREE.Object3D, threeGroup?: THREE.Group): void;
    getLabelPositionWithOffset(position: THREE.Vector3, atomName: string): THREE.Vector3;
    /**
     * Adjusts labels to camera position. Applied to labels of a specific type.
     */
    adjustLabelsToCameraPosition(): void;
}
