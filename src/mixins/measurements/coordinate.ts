import * as THREE from "three";

import { MEASUREMENT_MODES_ENUM } from "../../enums";
import { BaseMeasurementManager } from "./base";
import settings from "../../settings";
import { CoordinateLabelsManager } from "../labels/coordinate";
import { LabelsManagerConstructor } from "../labels/base";

export class CoordinatesMeasurementManager extends BaseMeasurementManager<CoordinateLabelsManager> {
    measurementType = MEASUREMENT_MODES_ENUM.COORDINATE;

    override LabelsManagerCls: LabelsManagerConstructor<CoordinateLabelsManager> =
        CoordinateLabelsManager;

    config = settings.coordinateLabelsConfig;

    constructor(waveStructureGroup: THREE.Group, waveCamera: THREE.Camera, wave: any) {
        super(waveStructureGroup, waveCamera, wave);
    }

    onClick = (event: MouseEvent) => {
        super.onClick(event);
        if (!this.selectedAtoms.length) return;
        const labelsManager = this.getLabelsManagerInstance();
        labelsManager.createLabels(this.selectedAtoms, this.THREEGroup);
        labelsManager.toggleVisibility();
    };
}
