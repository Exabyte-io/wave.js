import { MEASUREMENT_MODES_ENUM } from "../../enums";
import settings from "../../settings";
import { CoordinateLabelsManager } from "../labels/coordinate";
import { BaseMeasurementManager } from "./base";
export class CoordinatesMeasurementManager extends BaseMeasurementManager {
    constructor(waveStructureGroup, waveCamera, wave, updateState) {
        super(waveStructureGroup, waveCamera, wave, MEASUREMENT_MODES_ENUM.COORDINATE, updateState);
        this.measurementType = MEASUREMENT_MODES_ENUM.COORDINATE;
        this.LabelsManagerCls = CoordinateLabelsManager;
        this.config = settings.coordinateLabelsConfig;
        // @ts-ignore
        this.onClick = (updateState, event) => {
            super.onClick(event);
            updateState(this.getSettings());
        };
        this.labelsManager = this.getLabelsManagerInstance();
    }
}
