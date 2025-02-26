export function CoordinateMeasurementMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        selectedAtomsIds: Set<any>;
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
        toggleAtomSelection(atom: THREE.Mesh): void;
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
        createCoordinateText(coordinates: Array<number>, separator?: string): string;
        getCoordinateLabelOffsetVector(atomPosition: any, element: any): THREE.Vector3;
        toggleCoordinateLabels(): void;
        areCoordinateLabelsShown: any;
        "__#1@#texturesCache": {};
        labelsHolders: any[];
        initializeLabelsHolder(config: Object): import("./labelsHolder").LabelsHolder;
        getLabelsHolder(labelType: string): import("./labelsHolder").LabelsHolder | undefined;
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
import * as THREE from "three";
