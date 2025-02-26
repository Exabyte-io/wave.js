export function ElementLabelsMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        /**
         * Computes an offset vector for element labels
         */
        getElementLabelOffsetVector(atomPosition: any, element: any): THREE.Vector3;
        toggleElementLabels(): void;
        areElementLabelsShown: any;
        "__#1@#texturesCache": {};
        labelsHolders: any[];
        initializeLabelsHolder(config: Object): import("./labelsHolder").LabelsHolder;
        getLabelsHolder(labelType: string): import("./labelsHolder").LabelsHolder | undefined;
        createVerticesHashMap(labelsHolder: any, sourceGroup?: THREE.Group): {
            [x: string]: number[];
        };
        createLabelTextTexture(text: string, config?: Object): THREE.Texture;
        getLabelTextTexture(text: string, config: Object): THREE.Texture;
        createLabelSprite(text: string, name: string, config: Object): THREE.Sprite;
        createLabelsAsSprites(verticesHashMap: any, getNameForLabel: any, getOffsetVector: any, getUserData: any, targetGroup: any, config: any): void;
        createLabels(labelType: string, sourceGroup?: THREE.Group): void;
        createAllLabels(sourceGroup?: THREE.Group): void;
        adjustLabelsToCameraPosition(labelType: string): void;
        adjustAllLabelsToCameraPosition(): void;
        toggleLabels(labelType: string): boolean;
    };
};
import * as THREE from "three";
