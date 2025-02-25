export function CoordinateMeasurementMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        selectedAtomsForCoordinates: Set<any>;
        coordinatesArray: any[];
        isCoordinateMeasurementActive: boolean;
        /**
         * Toggles coordinate measurement mode on/off and initializes the label holder
         */
        toggleCoordinateMeasurement(): void;
        /**
         * Copies the current array of coordinates to clipboard
         */
        copyCoordinatesToClipboard(): void;
        /**
         * Selects or deselects an atom for coordinate measurement and updates the group
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
        areCoordinateLabelsShown: any;
        areElementLabelsShown: any;
        initializeAllLabelsHolders(): void;
        createCoordinateText(coordinates: Array<number>, separator?: string): string;
        getCoordinateLabelOffsetVector(atomPosition: any, element: any): any;
        getElementLabelOffsetVector(atomPosition: any, element: any): any;
        toggleElementLabels(): void;
        toggleCoordinateLabels(): void;
        "__#1@#texturesCache": {};
        labelsHolders: any[];
        initializeLabelsHolder(config: Object): import("./labelsHolder").LabelsHolder;
        findLabelsHolder(labelType: string): import("./labelsHolder").LabelsHolder | undefined;
        createVerticesHashMap(labelsHolder: any, sourceGroup?: THREE.Group): {
            [x: string]: number[];
        };
        createLabelTextTexture(text: string, config?: Object): THREE.Texture;
        getLabelTextTexture(text: string, config: Object): THREE.Texture;
        createLabelSprite(text: string, name: string, config: Object): THREE.Sprite;
        createLabelPoints(text: string, positions: Array<number>, name: string, config?: Object): THREE.Points;
        createLabelsAsPoints(verticesHashMap: any, getNameForLabel: Function, targetGroup: any, config: any): void;
        createLabelsAsSprites(verticesHashMap: any, getNameForLabel: Function, getOffsetVector: any, getUserData: any, targetGroup: any, config: any): void;
        createLabels(labelType: string, sourceGroup?: THREE.Group): void;
        createAllLabels(sourceGroup?: THREE.Group): void;
        adjustLabelsToCameraPosition(labelType: string): void;
        adjustAllLabelsToCameraPosition(): void;
        toggleLabels(labelType: string): boolean;
    };
};
