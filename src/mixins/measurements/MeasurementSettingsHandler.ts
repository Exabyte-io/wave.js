import { MEASUREMENT_MODES, MEASUREMENT_MODES_ENUM } from "../../enums";

export type MeasurementSettingsForType = {
    isActive: boolean;
    measurementType: MEASUREMENT_MODES_ENUM;
    values: any[];
    /** Atom picks recorded so far for this mode. */
    selectedAtomsCount?: number;
    /** Picks one measurement of this mode consumes - 2 for a distance, 3 for an angle. */
    atomsPerMeasurement?: number;
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

    /**
     * The settings entry for whichever mode is currently armed, or null when none is. The modes
     * are mutually exclusive in practice (toggling one clears the others), so "the active mode"
     * is well defined; if that ever stopped holding, the first match is still the one whose
     * clicks the user is about to make.
     */
    getActiveMeasurement(): MeasurementSettingsForType | null {
        return this.measurementsSettings.find((setting) => setting.isActive) || null;
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
