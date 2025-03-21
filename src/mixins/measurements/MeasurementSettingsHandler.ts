import { MEASUREMENT_MODES, MEASUREMENT_MODES_ENUM } from "../../enums";

export type MeasurementSettingsForType = {
    isActive: boolean;
    measurementType: MEASUREMENT_MODES_ENUM;
    values: any[];
};

export class MeasurementSettingsHandler {
    measurementsSettings: MeasurementSettingsForType[];

    constructor(measurementsSettings: MeasurementSettingsForType[]) {
        this.measurementsSettings = measurementsSettings;
        this.isMeasurementActiveByType = this.isMeasurementActiveByType.bind(this);
    }

    isMeasurementActiveByType(measurementType: MEASUREMENT_MODES_ENUM) {
        const settingsForType = this.measurementsSettings.find(
            (setting) => setting.measurementType === measurementType,
        );
        return Boolean(settingsForType?.isActive);
    }

    updateMeasurementSettingsByType(newSettings: MeasurementSettingsForType) {
        const settingsForType = this.measurementsSettings.find(
            (setting) => setting.measurementType === newSettings.measurementType,
        );
        if (settingsForType) {
            Object.assign(settingsForType, newSettings);
        }
    }

    getSettingsByType(measurementType: MEASUREMENT_MODES_ENUM) {
        const settingsForType = this.measurementsSettings.find(
            (setting) => setting.measurementType === measurementType,
        );
        if (!settingsForType) {
            throw new Error(`No settings found for measurement type ${measurementType}`);
        }
    }
}

export const defaultMeasurementsSettings = [
    {
        isActive: false,
        measurementType: MEASUREMENT_MODES.DISTANCE,
        values: [],
    },
    {
        isActive: false,
        measurementType: MEASUREMENT_MODES.ANGLE,
        values: [],
    },
    {
        isActive: false,
        measurementType: MEASUREMENT_MODES.COORDINATE,
        values: [],
    },
];
