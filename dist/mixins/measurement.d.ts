export function MeasurementMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        selectedAtoms: any[];
        intersected: any;
        atomConnections: any;
        angles: any;
        measurementLabels: any;
        currentSelectedLine: any;
        destroyListeners(): void;
        /**
         * Function to initialize listeners for checking DOM events.
         * @param {Function} updateState - functions for updating data in react.
         * @param settings - measurements settings object, this object helps to define state in this class.
         */
        initListeners(updateState: Function, settings: any): void;
        measurementSettings: any;
        /**
         * Function that initialize raycaster, this raycaster is used for checking on which atom you are clicking.
         * Also checking mousemove events
         */
        initRaycaster(): void;
        raycaster: any;
        pointer: any;
        /**
         * Function that collects all atomGroups that we have in structure groups
         */
        getAtomGroups(): any[];
        /**
         * Function set color for connection line. Used for highlighting connections on mousemove event.
         * @Param intersectItem -> item on which mouse is pointing now
         */
        setHexForLine(intersectItem: any): void;
        /**
         * Function set color for atoms. Used for highlighting atoms on mousemove event.
         * @Param intersectItem -> item on which mouse is pointing now
         */
        setHexForAtom(intersectItem: any): void;
        /**
         * Function set default color for connection.
         * Used for unsetting color when mouse is no longer points connection.
         */
        setDefaultHexForLine(): void;
        /**
         * Function set default color for atom.
         * Used for unsetting color when mouse is no longer points atom.
         */
        setDefaultHexForAtom(): void;
        /**
         * Function set default color for atom or connection.
         * Used for unsetting color when mouse is no longer points on atom or connection.
         */
        handleUnsetHex(): void;
        /**
         * Function checks pointer movements
         * @Param event -> simple javascript DOM event
         */
        onPointerMove(event: any): void;
        /**
         * Function checks and updates mouse pointer coordinates
         * @Param event -> simple javascript DOM event
         */
        checkMouseCoordinates(event: any): void;
        /**
         * Function that deletes an angle with label.
         */
        deleteConnectionsUsingAngle(): void;
        /**
         * Function that deletes connection between to atoms.
         */
        deleteConnection(): void;
        /**
         * Function that handles clicks on some connection between to atoms.
         * @Param intersectItem -> current selected connection
         */
        handleConnectionClick(intersectItem: any): void;
        /**
         * Function that handles clicks. This function updates mouse coordinates,
         * gets all intersected objects and apply logic according to object type or name.
         * @Param updateState -> function for updating state in React;
         * @Param event -> js DOM event
         */
        onClick(updateState: any, event: any): void;
        /**
         * Returns array of intersected objects.
         * @param event
         * @returns {[]}
         */
        getIntersectedObjects(event: any): [];
        /**
         *
         * @param {Array} atomArray - array to be checked
         * @param {Array} param1 - atom pair to checked
         * @returns boolean value - true if atom pair is already exist in array.
         */
        checkAtomPairExistence(atomArray: any[], [atomA, atomB]: any[]): boolean;
        shouldCalculateDistance(): any;
        shouldCalculateAngles(): any;
        /**
         * Function that used for getting control points that used for drawing curve line.
         * @param {Number} angle - angle value between atoms.
         */
        getDistanceToControlPointByAngle(angle: number): number;
        /**
         * Function that gets points for drawing curve line
         * @param atomPositions - positions of the atoms between we calculating an angle.
         * @param {Number} angle - angle value between atoms.
         */
        getPointsForAngleDraw(atomPositions: any, angle: number): any[];
        /**
         * Function that draws curved line and angle value on it
         * @param atomGroup - positions of the atoms between we calculating an angle.
         * @param {Number} angle - angle value between atoms.
         * @param atomConnections - array of connections that connects atoms.
         */
        drawAngleCurveAndText(atomGroup: any, angle: number, atomConnections: any): void;
        /**
         * Function that find point between pointA and pointB that is situated on the length
         * @param pointA
         * @param pointB
         * @param length
         * @return point that is situated on the length between to vectors
         */
        getPointInBetweenByLength(pointA: any, pointB: any, length: any): any;
        /**
         * Function that find point between pointA and pointB that is situated on the percentage length
         * @param pointA
         * @param pointB
         * @param length
         * @return point that is situated on the percentage length between to vectors
         */
        getPointInBetweenByPercentage(pointA: any, pointB: any, percentage: any): any;
        /**
         * Function that draws angle text.
         * @param angle - angle value that should be rendered
         * @param position - position on which text should be rendered.
         * @param line - on which this text is rendered.
         */
        drawAngleText(angle: any, position: any, line: any): void;
        /**
         * Function that draws distance text.
         * @param distance - distance value that should be rendered.
         */
        drawDistanceText(distance: any): void;
        handleSetSelected(intersectItem: any): void;
        /**
         * Function that deselects atom if it's clicked second time.
         * @param atom - atom that should be deselected.
         */
        deSelectAtom(atom: any): void;
        /**
         * Function that adds atoms to selected array if this atom is not same as last added atoms
         * @param intersectedAtom - atom that should be added
         */
        addIfTwoLastNotSame(intersectedAtom: any): void;
        /**
         * Function that adds atoms to selected array if this atom is same as last selected atom
         * @param intersectedAtom - atom that should be added
         */
        addIfLastNotSame(intersectedAtom: any): void;
        /**
         * Function that adds connection between atoms
         * @param atom - atom to which connection should be added
         * @param {String} uuid - id of the connection.
         */
        addConnection(atom: any, uuid: string): void;
        drawLineBetweenAtoms(lastselectedAtoms: any): any;
        resetMeasurements(): void;
        /**
         * Function that gets points that related to the world.
         * Used for duplicated atoms.
         * @param firstMatrix - point world matrix
         * @param secondMatrix - point world matrix
         */
        getPointsFromMatrixWorld(firstMatrix: any, secondMatrix: any): any[];
        /**
         * Function used for calculating distance between 2 atoms.
         * @atoms - 2 atoms between which distance should be calculated.
         */
        calculateDistanceBetweenAtoms(atoms: any): any;
        radiansToDegrees(radians: any): number;
        /**
         * Function used for calculating angle between 3 atoms.
         * @atoms - 3 atoms between which angle should be calculated.
         */
        calculateAngleBetweenAtoms(atoms: any): string;
        /**
         * Function that draws coordinate text.
         * @param {THREE.Vector3} position - position of the atom
         * @param {Object} atom - the atom object
         */
        drawCoordinateText(position: THREE.Vector3, atom: Object): void;
        /**
         * Toggles coordinate measurement for a specific atom
         * @param {THREE.Mesh} atom - The atom to toggle coordinates for
         */
        toggleAtomCoordinateLabel(atom: THREE.Mesh): void;
        deleteCoordinateLabels(): void;
    };
    [x: string]: any;
};
