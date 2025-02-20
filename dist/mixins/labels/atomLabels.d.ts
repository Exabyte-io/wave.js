export function ElementLabelsMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        "__#2@#elementTexturesCache": {};
        "__#2@#elementLabelsGroup": any;
        areElementLabelsShown: any;
        /**
         * Creates a hash map representing the positions (vertices) for atom labels.
         * The hash map uses atom names as keys and corresponding 3D positions as values.
         * If an atom name already exists in the hash map, it appends the atom's coordinates to the associated entry.
         *
         * @returns {Object.<string, Array.<number>>} HashMap with atom names as keys and an array of vertices as values.
         */
        createVerticesHashMap(): {
            [x: string]: number[];
        };
        /**
         * Computes an offset vector for a given atom position to position labels correctly.
         * This method returns a vector pointing from the atom to the camera but with a
         * length equal to the sphere radius.
         * @param {THREE.Vector3} atomPosition - The 3D position of the atom.
         * @param {String} element - The name of the atom.
         * @returns {THREE.Vector3} - Offset vector for the label.
         */
        getLabelOffsetVector(atomPosition: THREE.Vector3, element: string): THREE.Vector3;
        /**
         * Creates labels as sprites or points
         * depending on the settings.elementLabelsConfig.areSpritesUsed value
         */
        createElementLabels(): void;
        /**
         * Adjusts label positions in 3D space so that they don't overlap with their corresponding atoms
         * and always face the camera.
         * @method adjustElementLabelsToCameraPosition
         */
        adjustElementLabelsToCameraPosition(): void;
        /**
         * Toggles the visibility of all labels
         */
        toggleElementLabels(): void;
        "__#1@#texturesCache": {};
        createLabelTextTexture(text: string, config?: Object): THREE.Texture;
        getLabelTextTexture(text: string, config: Object): THREE.Texture;
        createLabelSprite(text: string, name: string, config: Object, options?: Object): THREE.Sprite;
        createLabelPoints(text: string, positions: Array<number>, name: string, config: Object): THREE.Points;
        createLabelsAsSprites(labelData: Object, getNameForLabel: Function, getLabelOffset: Function, getAdditionalData: Function, targetGroup: THREE.Group, config: Object): void;
        createLabelsAsPoints(labelData: Object, getNameForLabel: Function, targetGroup: THREE.Group, config: Object): void;
    };
};
