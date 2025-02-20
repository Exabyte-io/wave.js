export function BaseLabelsMixin(superclass: any): {
    new (): {
        [x: string]: any;
        "__#1@#texturesCache": {};
        /**
         * Creates a new texture based on a 2D canvas with the supplied text
         * @param {String} text - the text to be placed on the texture;
         * @param {Object} config - configuration for the label text (optional)
         * @return {THREE.Texture}
         */
        createLabelTextTexture(text: string, config?: Object): THREE.Texture;
        /**
         * Returns cached or newly created texture with label text
         * @param {String} text - the text to be placed on the texture;
         * @param {Object} config - configuration for the label text
         * @return {THREE.Texture}
         */
        getLabelTextTexture(text: string, config: Object): THREE.Texture;
        /**
         * Creates a sprite with a label text
         * @param {String} text - the text to be displayed on the label
         * @param {String} name - the name of the created sprite
         * @param {Object} config - configuration for the label text
         * @param {Object} options - additional options for the sprite (scale, etc.)
         * @return {THREE.Sprite}
         */
        createLabelSprite(text: string, name: string, config: Object, options?: Object): THREE.Sprite;
        /**
         * Creates a label as points for efficient rendering of many labels
         * @param {String} text - the text to be displayed
         * @param {Array<number>} positions - array of positions [x1,y1,z1,x2,y2,z2,...]
         * @param {String} name - name for the points object
         * @param {Object} config - configuration for the label text
         * @returns {THREE.Points}
         */
        createLabelPoints(text: string, positions: Array<number>, name: string, config: Object): THREE.Points;
        /**
         * Creates and positions multiple labels as sprites
         * @param {Object} labelData - Map of label text to array of positions
         * @param {Function} getNameForLabel - Function to generate name for each label
         * @param {Function} getLabelOffset - Function to calculate offset for each label
         * @param {Function} getAdditionalData - Function to get additional data for each label
         * @param {THREE.Group} targetGroup - The group to add the labels to
         * @param {Object} config - Configuration for the label text
         */
        createLabelsAsSprites(labelData: Object, getNameForLabel: Function, getLabelOffset: Function, getAdditionalData: Function, targetGroup: THREE.Group, config: Object): void;
        /**
         * Creates and positions multiple labels efficiently using Three.Points
         * @param {Object} labelData - Map of label text to array of positions
         * @param {Function} getNameForLabel - Function to generate name for each label
         * @param {THREE.Group} targetGroup - The group to add the labels to
         * @param {Object} config - Configuration for the label text
         */
        createLabelsAsPoints(labelData: Object, getNameForLabel: Function, targetGroup: THREE.Group, config: Object): void;
    };
    [x: string]: any;
};
