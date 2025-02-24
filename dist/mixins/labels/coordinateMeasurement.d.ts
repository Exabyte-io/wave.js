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
        coordinateLabelsGroup: any;
        areCoordinateLabelsShown: any;
        initializeLabelHolders(): import("./baseLabels").LabelsHolder;
        createCoordinateText(coordinates: Array<number>, separator?: string): string;
        createSingleCoordinateLabel(text: string, position: THREE.Vector3, prefix?: string): THREE.Sprite;
        createCoordinateVerticesHashMap(): {
            [x: string]: number[];
        };
        getCoordinateLabelOffsetVector(atomPosition: THREE.Vector3, element: string): THREE.Vector3;
        createCoordinateLabels(): void;
        adjustCoordinateLabelsToCameraPosition(): void;
        toggleCoordinateLabels(): void;
        "__#1@#texturesCache": {};
        labelHolders: any[];
        createLabelTextTexture(text: string, config?: Object): THREE.
        /**
         * Copies the current array of coordinates to clipboard
         */
        Texture /**
         * Copies the current array of coordinates to clipboard
         */;
        getLabelTextTexture(text: string, config: Object): THREE.Texture;
        createLabelSprite(text: string, name: string, config: Object): THREE.Sprite;
        createLabelPoints(text: string, positions: Array<number>, name: string, config?: Object): THREE.Points;
        createLabelsAsPoints(verticesHashMap: any, getNameForLabel: Function, targetGroup: any, config: any): void;
        createLabelsAsSprites(verticesHashMap: any, getNameForLabel: Function, getOffsetVector: any, getUserData: any, targetGroup: any, config: any): void;
    };
    initializeLabelHolders({ labelType, threeJsGroupName, areShown }: {
        labelType: any;
        threeJsGroupName: any;
        areShown: any;
    }): void;
};
