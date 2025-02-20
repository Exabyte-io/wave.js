export function CoordinateLabelsMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        /**
         * Creates a hash map representing the positions (vertices) for coordinate labels.
         * The hash map uses coordinates as keys and corresponding 3D positions as values.
         *
         * @returns {Object.<string, Array.<number>>} HashMap with coordinates as keys and an array of vertices as values.
         */
        createCoordinateVerticesHashMap(): {
            [x: string]: number[];
        };
        /**
         * Computes an offset vector for a given atom position to position coordinate labels correctly.
         * This method returns a vector pointing from the atom to the camera but with a
         * length equal to the sphere radius plus an additional offset.
         * @param {THREE.Vector3} atomPosition - The 3D position of the atom.
         * @param {String} element - The name of the atom.
         * @returns {THREE.Vector3} - Offset vector for the label.
         */
        getCoordinateLabelOffsetVector(atomPosition: THREE.Vector3, element: string): THREE.Vector3;
        /**
         * Creates coordinate labels as sprites or points
         * depending on the settings.coordinateLabelsConfig.areSpritesUsed value
         */
        createCoordinateLabels(): void;
        /**
         * Adjusts coordinate label positions in 3D space so that they don't overlap with their corresponding atoms
         * and always face the camera.
         * @method adjustCoordinateLabelsToCameraPosition
         */
        adjustCoordinateLabelsToCameraPosition(): void;
        /**
         * Toggles the visibility of all coordinate labels
         */
        toggleCoordinateLabels(): void;
        areCoordinateLabelsShown: any;
        "__#1@#texturesCache": {};
        labelsGroup: any;
        createLabelTextTexture(text: string): THREE.Texture;
        getLabelTextTexture(text: string): THREE.Texture;
        createLabelSprite(text: string, name: string, options?: Object): THREE.Sprite;
        createLabelPoints(text: string, positions: Array<number>, name: string): THREE.Points;
        createLabelsAsPoints(labelData: Object, getNameForLabel: Function): void;
        createLabelsAsSprites(labelData: Object, getNameForLabel: Function, getLabelOffset: Function, getAdditionalData?: Function): void;
        clearLabels(): void;
    };
};
