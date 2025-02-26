export function LabelsAsPointsMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        /**
         * Creates a label as points for efficient rendering of many labels
         * @param {String} text - the text to be displayed
         * @param {Array<number>} positions - array of positions [x1,y1,z1,x2,y2,z2,...]
         * @param {String} name - name for the points object
         * @param {Object} config - additional options for the points (size, etc.)
         * @returns {THREE.Points}
         */
        createLabelPoints(text: string, positions: Array<number>, name: string, config?: Object): THREE.Points;
        /**
         * Creates and positions multiple labels efficiently using Three.Points
         * For best performance when rendering many labels.
         * @param {Object} verticesHashMap - Object with label names as keys and arrays of positions as values
         * @param {Function} getNameForLabel - Function to get the name for a label
         * @param {THREE.Group} targetGroup - Group to add the labels to
         * @param {Object} config - Additional options for the points (size, etc.)
         */
        createLabelsAsPoints(verticesHashMap: Object, getNameForLabel: Function, targetGroup: THREE.Group, config: Object): void;
        /**
         * Creates labels for a specific label type
         * @param {string} labelType - Type of label to create
         * @param {THREE.Group} [sourceGroup=this.structureGroup] - Group to extract atoms from
         */
        createLabels(labelType: string, sourceGroup?: THREE.Group): void;
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
        createAllLabels(sourceGroup?: THREE.Group): void;
        adjustLabelsToCameraPosition(labelType: string): void;
        adjustAllLabelsToCameraPosition(): void;
        toggleLabels(labelType: string): boolean;
    };
};
import * as THREE from "three";
