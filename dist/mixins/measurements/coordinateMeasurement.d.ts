export function CoordinateMeasurementMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        coordinateMeasurementGroup: any;
        selectedAtomsForCoordinates: Set<any>;
        coordinatesArray: any[];
        isCoordinateMeasurementActive: boolean;
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
        selectedAtoms: any[];
        intersected: any;
        measurementLabelsGroup: any;
        destroyListeners(): void;
        initListeners(updateState: Function, settings: any): void;
        measurementSettings: any;
        initRaycaster(): void;
        raycaster: any;
        pointer: any;
        getAtomGroups(): any[];
        handleSetSelected(intersectItem: any): void;
        getPointsFromMatrixWorld(firstMatrix: any, secondMatrix: any): any[];
        checkMouseCoordinates(event: any): void;
        setHexForAtom(intersectItem: any): void;
        setDefaultHexForAtom(): void;
        createMeasurementLabel(text: any, name: any, position: any): any;
        onClick(updateState: any, event: any): void;
        onPointerMove(event: any): void;
        resetMeasurements(): void;
        addConnection(atom: any, connectionId: any): void;
        calculateDistanceBetweenAtoms(atoms: any): any;
    };
};
