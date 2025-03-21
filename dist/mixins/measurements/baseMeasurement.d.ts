export function BaseMeasurementMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        selectedAtoms: any[];
        intersected: any;
        measurementLabelsGroup: any;
        destroyListeners(): void;
        /**
         * Function to initialize listeners for checking DOM events.
         * @param {Function} updateState - functions for updating data in react.
         * @param settings - measurements settings object, this object helps to define state in this class.
         */
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
    [x: string]: any;
};
