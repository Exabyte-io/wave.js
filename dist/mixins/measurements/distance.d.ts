import * as THREE from "three";
import { MEASUREMENT_MODES_ENUM } from "../../enums";
import { LabelsManagerConstructor } from "../labels/base";
import { DistanceLabelsManager } from "../labels/distance";
import { LinesManager } from "../lines/LinesManager";
import { BaseMeasurementManager } from "./base";
export declare class DistancesMeasurementManager extends BaseMeasurementManager<DistanceLabelsManager> {
    measurementType: MEASUREMENT_MODES_ENUM;
    LabelsManagerCls: LabelsManagerConstructor<DistanceLabelsManager>;
    currentSelectedLine: THREE.Line | null;
    linesManager: LinesManager;
    constructor(waveStructureGroup: THREE.Group, waveCamera: THREE.Camera, wave: any, updateState: (arg: object) => void);
    onClick(updateState: (arg: object) => void, event: MouseEvent): void;
    toggleAtomSelection(atom: THREE.Object3D): void;
    setAtomAsSelected(atom: THREE.Object3D): void;
    extractMeasurementValues(): number[];
    getLabelObjectsFromSelectedObjects(): THREE.Object3D[];
    getAdditionalObjectsFromSelectedObjects(): THREE.Line[];
    getPairsOfSelectedAtoms(): THREE.Object3D[][];
    getLinesFromSelectedAtoms(): THREE.Line[];
    getLineLengthsFromSelectedAtoms(): number[];
    getLineCentersFromSelectedAtoms(): THREE.Vector3[];
}
