import { MEASUREMENT_MODES } from "../../enums";
export class MeasurementSettingsHandler {
    constructor(measurementsSettings) {
        this.measurementsSettings = measurementsSettings;
        this.isMeasurementActiveByType = this.isMeasurementActiveByType.bind(this);
    }
    isMeasurementActiveByType(measurementType) {
        const settingsForType = this.measurementsSettings.find((setting) => setting.measurementType === measurementType);
        return Boolean(settingsForType === null || settingsForType === void 0 ? void 0 : settingsForType.isActive);
    }
    updateMeasurementSettingsByType(newSettings) {
        const settingsForType = this.measurementsSettings.find((setting) => setting.measurementType === newSettings.measurementType);
        if (settingsForType) {
            Object.assign(settingsForType, newSettings);
        }
    }
    getSettingsByType(measurementType) {
        const settingsForType = this.measurementsSettings.find((setting) => setting.measurementType === measurementType);
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
