export function BaseLabelsMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        "__#1@#texturesCache": {};
        labelsGroup: any;
        /**
         * Creates a new texture based on a 2D canvas with the supplied text
         * @param {String} text - the text to be placed on the texture;
         * @return {THREE.Texture}
         */
        createLabelTextTexture(text: string): THREE.Texture;
        /**
         * Returns cached or newly created texture with label text
         * @param {String} text - the text to be placed on the texture;
         * @return {THREE.Texture}
         */
        getLabelTextTexture(text: string): THREE.Texture;
        /**
         * Creates a sprite with a label text
         * @param {String} text - the text to be displayed on the label
         * @param {String} name - the name of the created sprite
         * @param {Object} options - additional options for the sprite (scale, etc.)
         * @return {THREE.Sprite}
         */
        createLabelSprite(text: string, name: string, options?: Object): THREE.Sprite;
        /**
         * Creates a label as points for efficient rendering of many labels
         * @param {String} text - the text to be displayed
         * @param {Array<number>} positions - array of positions [x1,y1,z1,x2,y2,z2,...]
         * @param {String} name - name for the points object
         * @returns {THREE.Points}
         */
        createLabelPoints(text: string, positions: Array<number>, name: string): THREE.Points;
        /**
         * Creates and positions multiple labels efficiently using Three.Points
         * For best performance when rendering many labels.
         * @param {Object} labelData - Map of label text to array of positions
         * @param {Function} getNameForLabel - Function to generate name for each label
         */
        createLabelsAsPoints(labelData: Object, getNameForLabel: Function): void;
        /**
         * Creates and positions multiple labels as sprites
         * More flexible but less performant than Points for many labels
         * @param {Object} labelData - Map of label text to array of positions
         * @param {Function} getNameForLabel - Function to generate name for each label
         * @param {Function} getLabelOffset - Function to calculate offset for each label
         * @param {Function} getAdditionalData - Function to get additional data for each label
         */
        createLabelsAsSprites(labelData: Object, getNameForLabel: Function, getLabelOffset: Function, getAdditionalData?: Function): void;
        /**
         * Toggles the visibility of all labels
         */
        toggleLabels(): void;
        areLabelsShown: any;
        /**
         * Clears all labels from the labels group
         */
        clearLabels(): void;
    };
    [x: string]: any;
};
