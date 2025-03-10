import { MEASUREMENT_MODES_ENUM } from "../../enums";
import { AnglesMeasurementManager } from "./angle";
import { CoordinatesMeasurementManager } from "./coordinate";
import { DistancesMeasurementManager } from "./distance";
export type MeasurementSettingsForType = {
    isActive: boolean;
    measurementType: MEASUREMENT_MODES_ENUM;
    values: any[];
};
export declare class MeasurementSettingsHandler {
    measurementsSettings: MeasurementSettingsForType[];
    constructor(measurementsSettings: MeasurementSettingsForType[]);
    isMeasurementActiveByType(measurementType: MEASUREMENT_MODES_ENUM): boolean;
    updateMeasurementSettingsByType(newSettings: MeasurementSettingsForType): void;
    getSettingsByType(measurementType: MEASUREMENT_MODES_ENUM): void;
}
export declare const defaultMeasurementsSettings: {
    isActive: boolean;
    measurementType: string;
    values: never[];
}[];
export declare const AllMeasurementsMixin: (superclass: any) => {
    new (): {
        [x: string]: any;
        measurementManagers: (CoordinatesMeasurementManager | DistancesMeasurementManager | AnglesMeasurementManager)[];
        bypassReloadViewer: boolean;
        initializeMeasurementManagers(updateState: any): void;
        getMeasurementManagerByType(measurementType: MEASUREMENT_MODES_ENUM): AnglesMeasurementManager | CoordinatesMeasurementManager | DistancesMeasurementManager | undefined;
        getActiveMeasurementManager(): AnglesMeasurementManager | CoordinatesMeasurementManager | DistancesMeasurementManager | undefined;
        getMeasurementsSettings(): {
            isActive: boolean;
            measurementType: MEASUREMENT_MODES_ENUM;
            values: any[];
        }[];
        getMeasurementsSettingsHandler(): MeasurementSettingsHandler;
        toggleMeasurementByType(measurementType: MEASUREMENT_MODES_ENUM, updateState: any): void;
        createAllMeasurements(): void;
        resetAllMeasurements(): void;
        deleteConnection(): void;
    };
    [x: string]: any;
};
