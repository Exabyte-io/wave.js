export function AtomLabelsMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        areCoordinateLabelsShown: any;
        areElementLabelsShown: any;
        /**
         * Initialize all label holders for atoms (elements, coordinates)
         * @returns {void}
         */
        initializeAllLabelHolders(): void;
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
        getCoordinateLabelOffsetVector(atomPosition: any, element: any): any;
        /**
         * Computes an offset vector for element labels
         */
        getElementLabelOffsetVector(atomPosition: any, element: any): any;
        toggleElementLabels(): void;
        toggleCoordinateLabels(): void;
        "__#1@#texturesCache": {};
        labelHolders: any[];
        initializeLabelHolder(config: Object): LabelsHolder;
        findLabelHolder(labelType: string): LabelsHolder | undefined;
        createVerticesHashMap(labelHolder: LabelsHolder): {
            [x: string]: number[];
        };
        createLabelTextTexture(text: string, config?: Object): THREE.Texture;
        getLabelTextTexture(text: string, config: Object): THREE.Texture;
        createLabelSprite(text: string, name: string, config: Object): THREE.Sprite;
        createLabelPoints(text: string, positions: Array<number>, name: string, config?: Object): THREE.Points;
        createLabelsAsPoints(verticesHashMap: any, getNameForLabel: Function, targetGroup: any, config: any): void;
        createLabelsAsSprites(verticesHashMap: any, getNameForLabel: Function, getOffsetVector: any, getUserData: any, targetGroup: any, config: any): void;
        createLabels(labelType: string): void;
        createAllLabels(): void;
        adjustLabelsToCameraPosition(labelType: string): void;
        adjustAllLabelsToCameraPosition(): void;
        toggleLabels(labelType: string): boolean;
    };
};
