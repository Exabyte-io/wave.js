export function CoordinateLabelsMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        /**
         * Creates a coordinate display text from coordinates
         * @param {Array<number>} coordinates - Array of [x,y,z] coordinates
         * @param {string} separator - Separator between coordinates
         * @returns {string} Formatted coordinate text
         */
        createCoordinateText(coordinates: Array<number>, separator?: string): string;
        /**
         * Computes an offset vector for coordinate labels
         */
        getCoordinateLabelOffsetVector(atomPosition: any, element: any): THREE.Vector3;
        toggleCoordinateLabels(): void;
        areCoordinateLabelsShown: any;
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
