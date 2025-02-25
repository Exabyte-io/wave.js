export function BaseLabelsMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        "__#1@#texturesCache": {};
        labelsHolders: any[];
        /**
         * Initializes a label holder with provided configuration
         * @param {Object} config - Configuration for the label holder
         * @returns {LabelsHolder} The initialized label holder
         */
        initializeLabelsHolder(config: Object): LabelsHolder;
        /**
         * Finds a label holder by type
         * @param {string} labelType - The type of label holder to find
         * @returns {LabelsHolder|undefined} The found label holder or undefined
         */
        findLabelsHolder(labelType: string): LabelsHolder | undefined;
        /**
         * Creates a hash map representing the positions for labels.
         * @param {labelsHolder} labelsHolder - The label holder to create vertices for
         * @param {THREE.Group} [sourceGroup=this.structureGroup] - The group to extract atoms from
         * @returns {Object.<string, Array.<number>>} HashMap with label text as keys and an array of vertices as values.
         */
        createVerticesHashMap(labelsHolder: any, sourceGroup?: THREE.Group): {
            [x: string]: number[];
        };
        /**
         * Creates a new texture based on a 2D canvas with the supplied text
         * @param {String} text - the text to be placed on the texture;
         * @param {Object} config - additional options for the texture (scaleWidth, scaleHeight, etc.)
         * @return {THREE.Texture}
         */
        createLabelTextTexture(text: string, config?: Object): THREE.Texture;
        /**
         * Returns cached or newly created texture with label text
         * @param {String} text - the text to be placed on the texture;
         * @param {Object} config - additional options for the texture (scaleWidth, scaleHeight, etc.)
         * @return {THREE.Texture}
         */
        getLabelTextTexture(text: string, config: Object): THREE.Texture;
        /**
         * Creates a sprite with a label text
         * @param {String} text - the text to be displayed on the label
         * @param {String} name - the name of the created sprite
         * @param {Object} config - additional options for the sprite (scale, etc.)
         * @return {THREE.Sprite}
         */
        createLabelSprite(text: string, name: string, config: Object): THREE.Sprite;
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
         * @param {Object} labelData - Map of label text to array of positions
         * @param {Function} getNameForLabel - Function to generate name for each label
         */
        createLabelsAsPoints(verticesHashMap: any, getNameForLabel: Function, targetGroup: any, config: any): void;
        /**
         * Creates and positions multiple labels as sprites
         * More flexible but less performant than Points for many labels
         * @param {Object} labelData - Map of label text to array of positions
         * @param {Function} getNameForLabel - Function to generate name for each label
         * @param {Function} getLabelOffset - Function to calculate offset for each label
         * @param {Function} getAdditionalData - Function to get additional data for each label
         */
        createLabelsAsSprites(verticesHashMap: any, getNameForLabel: Function, getOffsetVector: any, getUserData: any, targetGroup: any, config: any): void;
        /**
         * Creates labels for a specific label type
         * @param {string} labelType - Type of label to create
         * @param {THREE.Group} [sourceGroup=this.structureGroup] - Group to extract atoms from
         */
        createLabels(labelType: string, sourceGroup?: THREE.Group): void;
        /**
         * Creates all labels
         * @param {THREE.Group} [sourceGroup=this.structureGroup] - Group to extract atoms from
         */
        createAllLabels(sourceGroup?: THREE.Group): void;
        /**
         * Adjusts labels to camera position
         * @param {string} labelType - Type of label to adjust
         */
        adjustLabelsToCameraPosition(labelType: string): void;
        /**
         * Adjust all labels to camera position
         */
        adjustAllLabelsToCameraPosition(): void;
        /**
         * Toggles visibility for a specific label type
         * @param {string} labelType - Type of label to toggle
         * @returns {boolean} New visibility state
         */
        toggleLabels(labelType: string): boolean;
    };
    [x: string]: any;
};
import { LabelsHolder } from "./labelsHolder";
