export function CoordinateLabelsMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        coordinateLabelsGroup: any;
        areCoordinateLabelsShown: any;
        /**
         * Formats coordinates into an array of fixed precision values
         * @param {THREE.Vector3} position - The position vector to format
         * @returns {Array<number>} Array of [x,y,z] coordinates with fixed precision
         */
        formatCoordinates(position: THREE.Vector3): Array<number>;
        /**
         * Creates a display text from coordinates
         * @param {Array<number>} coordinates - Array of [x,y,z] coordinates
         * @param {string} separator - Separator between coordinates
         * @returns {string} Formatted coordinate text
         */
        createCoordinateText(coordinates: Array<number>, separator?: string): string;
        /**
         * Creates a single coordinate label with proper positioning and offset
         * @param {string} text - The coordinate text to display
         * @param {THREE.Vector3} position - The position where to place the label
         * @param {string} prefix - Optional prefix for the label name
         * @returns {THREE.Sprite} The created label
         */
        createSingleCoordinateLabel(text: string, position: THREE.Vector3, prefix?: string): THREE.Sprite;
        /**
         * Creates a hash map representing the positions (vertices) for atom labels.
         * The hash map uses atom names as keys and corresponding 3D positions as values.
         * If an atom name already exists in the hash map, it appends the atom's coordinates to the associated entry.
         *
         * @returns {Object.<string, Array.<number>>} HashMap with atom names as keys and an array of vertices as values.
         */
        createCoordinateVerticesHashMap(): {
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
        getCoordinateLabelOffsetVector(atomPosition: THREE.Vector3, element: string): THREE.Vector3;
        /**
         * Creates labels as sprites or points
         * depending on the settings.coordinateLabelsConfig.areSpritesUsed value
         */
        createCoordinateLabels(): void;
        /**
         * Adjusts label positions in 3D space so that they don't overlap with their corresponding atoms
         * and always face the camera.
         * @method adjustCoordinateLabelsToCameraPosition
         */
        adjustCoordinateLabelsToCameraPosition(): void;
        /**
         * Toggles the visibility of all labels
         */
        toggleCoordinateLabels(): void;
        "__#1@#texturesCache": {};
        createLabelTextTexture(text: string, config?: Object): THREE.Texture;
        getLabelTextTexture(text: string, config: Object): THREE.Texture;
        createLabelSprite(text: string, name: string, config: Object): THREE.Sprite;
        createLabelPoints(text: string, positions: Array<number>, name: string, config?: Object): THREE.Points;
        createLabelsAsPoints(verticesHashMap: any, getNameForLabel: Function, targetGroup: any, config: any): void;
        createLabelsAsSprites(verticesHashMap: any, getNameForLabel: Function, getOffsetVector: any, getUserData: any, targetGroup: any, config: any): void;
    };
};
