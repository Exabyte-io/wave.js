import * as THREE from "three";
import { MEASUREMENT_MODES_ENUM } from "../../enums";
import { AngleLabelsManager } from "../labels/angle";
import { LabelsManagerConstructor } from "../labels/base";
import { LinesManager } from "../lines/LinesManager";
import { BaseMeasurementManager } from "./base";
export declare class AnglesMeasurementManager extends BaseMeasurementManager<AngleLabelsManager> {
    measurementType: MEASUREMENT_MODES_ENUM;
    LabelsManagerCls: LabelsManagerConstructor<AngleLabelsManager>;
    linesManager: LinesManager;
    constructor(waveStructureGroup: THREE.Group, waveCamera: THREE.Camera, wave: any, updateState: (arg: object) => void);
    onClick(updateState: (arg: object) => void, event: MouseEvent): void;
    toggleAtomSelection(atom: THREE.Object3D): void;
    setAtomAsSelected(atom: THREE.Object3D): void;
    extractMeasurementValues(): number[][];
    getLabelObjectsFromSelectedObjects(): THREE.Object3D[];
    getAdditionalObjectsFromSelectedObjects(): THREE.Line[];
    getTripletsOfSelectedAtoms(): THREE.Object3D[][];
    getLinesFromSelectedAtoms(): THREE.Line[];
    getAnglesFromSelectedAtoms(): number[];
}
