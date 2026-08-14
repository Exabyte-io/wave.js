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
    /**
     * The settings entry for whichever mode is currently armed, or null when none is. The modes
     * are mutually exclusive in practice (toggling one clears the others), so "the active mode"
     * is well defined; if that ever stopped holding, the first match is still the one whose
     * clicks the user is about to make.
     */
    getActiveMeasurement() {
        return this.measurementsSettings.find((setting) => setting.isActive) || null;
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
