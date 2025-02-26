import * as THREE from "three";
type Constructor<T = {}> = new (...args: any[]) => T;
export declare const AngleMeasurementMixin: <T extends Constructor>(superclass: T) => {
    new (config: any): {
        [x: string]: any;
        angleConnections: THREE.Group;
        currentSelectedAngle: THREE.Line | null;
        drawLineBetweenAtoms: (selectedAtoms: THREE.Object3D[]) => THREE.Line;
        /**
         * Creates and adds a label for the angle measurement
         */
        drawAngleText(angle: number, line: THREE.Line): void;
        /**
         * Creates a connection between two atoms
         */
        createConnection(atomA: THREE.Object3D, atomB: THREE.Object3D): THREE.Line;
        /**
         * Adds connection ID to atom userData
         */
        addConnectionDataToAtom(atom: THREE.Object3D, connectionId: string): void;
        /**
         * Creates an angle visualization between three atoms
         */
        drawAngle(atomA: THREE.Object3D, atomB: THREE.Object3D, atomC: THREE.Object3D): void;
        /**
         * Deletes the selected angle connection
         */
        deleteConnection(): void;
        /**
         * Handles atom selection for angle measurement
         */
        handleAngleAtomClick(atom: THREE.Object3D, updateState: (state: {
            angle: number;
        }) => void): void;
        selectedAtoms: THREE.Object3D[];
        highlightedAtom: THREE.Object3D | null;
        raycaster: THREE.Raycaster;
        pointer: THREE.Vector2;
        measurementsGroup: THREE.Group;
        measurementSettings: any;
        currentMeasurementMode: string;
        scene: THREE.Scene;
        structureGroup: THREE.Group;
        renderer: THREE.WebGLRenderer;
        camera: THREE.Camera;
        settings: any;
        atomClickHandlers: {
            mode: string;
            handleClick: any;
        }[] | undefined;
        initializeMeasurement(measurementMode: string, handleAtomClick: any): void;
        destroyListeners(): void;
        initListeners(updateState: any, settings: any): void;
        initRaycaster(): void;
        getAtomGroups(): THREE.Object3D[];
        handleSetSelected(intersectItem: THREE.Object3D): void;
        checkMouseCoordinates(event: MouseEvent): void;
        setHexForAtom(intersectItem: THREE.Object3D): void;
        setDefaultHexForAtom(): void;
        setMeasurementMode(mode: string): boolean;
        _updateMeasurementVisibility(): void;
        createMeasurementLabel(text: string, name: string, position: THREE.Vector3): THREE.Sprite<THREE.Object3DEventMap>;
        isMeasurementModeActive(mode: string): boolean;
        onClick(updateState: any, event: MouseEvent): void;
        onPointerMove(event: MouseEvent): void;
        resetMeasurements(): void;
        "__#1@#texturesCache": {};
        labelsHolders: any[];
        initializeLabelsHolder(config: Object): import("../labels/labelsHolder").LabelsHolder;
        getLabelsHolder(labelType: string): import("../labels/labelsHolder").LabelsHolder | undefined;
        createVerticesHashMap(labelsHolder: any, sourceGroup?: THREE.Group): {
            [x: string]: number[];
        };
        createLabelTextTexture(text: string, config?: Object): THREE.Texture;
        getLabelTextTexture(text: string, config: Object): THREE.Texture;
        createLabelSprite(text: string, name: string, config: Object): THREE.Sprite;
        createLabelsAsSprites(verticesHashMap: any, getNameForLabel: any, getOffsetVector: any, getUserData: any, targetGroup: any, config: any): void;
        createLabels(labelType: string, sourceGroup?: THREE.Group): void;
        createAllLabels(sourceGroup?: THREE.Group): void;
        adjustLabelsToCameraPosition(labelType: string): void;
        adjustAllLabelsToCameraPosition(): void;
        toggleLabels(labelType: string): boolean;
    };
};
export {};
