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
         * @param {THREE.Vector3} position - The position of the atom
         */
        selectAtomCoordinate(atom: THREE.Mesh, position: THREE.Vector3): void;
        /**
         * Deselects an atom and removes its coordinate label
         * @param {THREE.Mesh} atom - The atom to deselect
         */
        deselectAtomCoordinate(atom: THREE.Mesh): void;
        /**
         * Creates a single coordinate label with proper positioning and offset
         * @param {string} text - The coordinate text to display
         * @param {THREE.Vector3} position - The position where to place the label
         * @returns {THREE.Sprite} The created label
         */
        createSingleCoordinateLabel(text: string, position: THREE.Vector3): THREE.Sprite;
        /**
         * Clears all coordinate measurements and resets atoms
         */
        clearCoordinateMeasurements(): void;
        /**
         * Updates coordinate measurement labels during camera movement
         */
        adjustCoordinateMeasurementLabels(): void;
        "__#1@#texturesCache": {};
        createLabelTextTexture(text: string, config?: Object): THREE.Texture;
        getLabelTextTexture(text: string, config: Object): THREE.Texture;
        createLabelSprite(text: string, name: string, config: Object): THREE.Sprite;
        createLabelPoints(text: string, positions: Array<number>, name: string, config?: Object): THREE.Points;
        createLabelsAsPoints(verticesHashMap: any, getNameForLabel: Function, targetGroup: any, config: any): void;
        createLabelsAsSprites(verticesHashMap: any, getNameForLabel: Function, getOffsetVector: any, getUserData: any, targetGroup: any, config: any): void;
    };
};
