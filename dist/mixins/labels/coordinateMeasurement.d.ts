export function CoordinateMeasurementMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        coordinateMeasurementGroup: any;
        selectedAtomsForCoordinates: Set<any>;
        coordinatesArray: any[];
        isCoordinateMeasurementActive: boolean;
        /**
         * Toggles coordinate measurement mode on/off
         */
        toggleCoordinateMeasurement(): void;
        /**
         * Copies the current array of coordinates to clipboard
         */
        copyCoordinatesToClipboard(): void;
        /**
         * Selects or deselects an atom for coordinate measurement
         * @param {THREE.Mesh} atom - The atom to toggle selection for
         */
        toggleAtomCoordinateSelection(atom: THREE.Mesh): void;
        /**
         * Selects an atom and creates its coordinate label
         * @param {THREE.Mesh} atom - The atom to select
         */
        selectAtomCoordinate(atom: THREE.Mesh): void;
        /**
         * Deselects an atom and removes its coordinate label
         * @param {THREE.Mesh} atom - The atom to deselect
         */
        deselectAtomCoordinate(atom: THREE.Mesh): void;
        /**
         * Clears all coordinate measurements and resets atoms
         */
        clearCoordinateMeasurements(): void;
        /**
         * Updates coordinate measurement labels during camera movement
         */
        adjustCoordinateMeasurementLabels(): void;
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
