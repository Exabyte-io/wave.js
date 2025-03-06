import * as THREE from "three";
import { MEASUREMENT_MODES_ENUM } from "../../enums";
import { BaseTHREEGroupManager } from "../base";
import { BaseLabelsManager, LabelsManagerConstructor } from "../labels/base";
declare const BaseManager: {
    new (...args: any[]): {
        raycaster: THREE.Raycaster;
        pointer: THREE.Vector2;
        intersectedAtom: THREE.Object3D | null;
        initRaycaster(): void;
        checkMouseCoordinates(event: MouseEvent, camera: THREE.Camera): void;
        canvas: HTMLCanvasElement;
        onClick(event: MouseEvent): void;
        onPointerMove(event: MouseEvent): void;
        destroyListeners(): void;
        initListeners(updateState: (arg: object) => void): void;
    };
} & typeof BaseTHREEGroupManager;
/**
 * Base class for managing measurements.
 * Contains generic logic for handling measurements: toggling measurement, selecting atoms, creating labels.
 */
export declare class BaseMeasurementManager<T extends BaseLabelsManager> extends BaseManager {
    measurementType: MEASUREMENT_MODES_ENUM;
    selectedAtoms: THREE.Object3D[];
    isActive: boolean;
    values: any[];
    LabelsManagerCls: LabelsManagerConstructor<T>;
    labelsManager: any;
    updateState: any;
    constructor(waveStructureGroup: THREE.Group, waveCamera: THREE.Camera, wave: any, groupName: string, updateState: any);
    protected getLabelsManagerInstance(): T;
    toggleActive: () => void;
    getSelectedAtomIndices(): any[];
    getAtomObjectByAtomicIndex(atomicIndex: number): any;
    setAtomAsSelected(atomObject: THREE.Object3D): void;
    unsetAtomAsSelected(atomObject: THREE.Object3D): void;
    setIntersectedAtom(intersectItem: THREE.Object3D | null): void;
    isIntersectedAtomSelected(): boolean;
    getIntersections(): THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[];
    toggleAtomSelection(atomObject: THREE.Object3D): void;
    refillSelectedAtoms(): void;
    getSettings(): {
        isActive: boolean;
        measurementType: MEASUREMENT_MODES_ENUM;
        values: any[];
    };
    onClick(event: MouseEvent): void;
    onPointerMove: (event: MouseEvent) => void;
    copyValuesToClipboard(): void;
    extractMeasurementValues(): number[] | number[][];
    createMeasurementLabel(text: string, name: string, position: THREE.Vector3, threeGroup?: THREE.Group<THREE.Object3DEventMap>): void;
    getLabelObjectsFromSelectedObjects(): THREE.Object3D[];
    getAdditionalObjectsFromSelectedObjects(): THREE.Object3D[];
    createMeasurements(): void;
    highlightSelectedAtoms(): void;
    resetMeasurements(): void;
}
export {};
