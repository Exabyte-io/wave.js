import { MEASUREMENT_MODES_ENUM } from "../../enums";
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
