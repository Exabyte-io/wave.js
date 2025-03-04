import * as THREE from "three";

import { MEASUREMENT_MODES_ENUM } from "../../enums";
import settings from "../../settings";
import { LabelsManagerConstructor } from "../labels/base";
import { CoordinateLabelsManager } from "../labels/coordinate";
import { BaseMeasurementManager } from "./base";

export class CoordinatesMeasurementManager extends BaseMeasurementManager<CoordinateLabelsManager> {
    measurementType = MEASUREMENT_MODES_ENUM.COORDINATE;

    override LabelsManagerCls: LabelsManagerConstructor<CoordinateLabelsManager> =
        CoordinateLabelsManager;

    config = settings.coordinateLabelsConfig;

    constructor(
        waveStructureGroup: THREE.Group,
        waveCamera: THREE.Camera,
        wave: any,
        updateState: any,
    ) {
        super(waveStructureGroup, waveCamera, wave, MEASUREMENT_MODES_ENUM.COORDINATE, updateState);
        this.labelsManager = this.getLabelsManagerInstance();
    }

    onClick = (updateState: (arg: object) => void, event: MouseEvent) => {
        super.onClick(event);
        updateState(this.getSettings());
    };
}
