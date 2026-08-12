import { MEASUREMENT_MODES_ENUM } from "../../enums";
export type MeasurementSettingsForType = {
    isActive: boolean;
    measurementType: MEASUREMENT_MODES_ENUM;
    values: any[];
    /** Atom picks recorded so far for this mode. */
    selectedAtomsCount?: number;
    /** Picks one measurement of this mode consumes - 2 for a distance, 3 for an angle. */
    atomsPerMeasurement?: number;
};
export declare class MeasurementSettingsHandler {
    measurementsSettings: MeasurementSettingsForType[];
    constructor(measurementsSettings: MeasurementSettingsForType[]);
    isMeasurementActiveByType(measurementType: MEASUREMENT_MODES_ENUM): boolean;
    updateMeasurementSettingsByType(newSettings: MeasurementSettingsForType): void;
    /**
     * The settings entry for whichever mode is currently armed, or null when none is. The modes
     * are mutually exclusive in practice (toggling one clears the others), so "the active mode"
     * is well defined; if that ever stopped holding, the first match is still the one whose
     * clicks the user is about to make.
     */
    getActiveMeasurement(): MeasurementSettingsForType | null;
    getSettingsByType(measurementType: MEASUREMENT_MODES_ENUM): void;
}
export declare const defaultMeasurementsSettings: {
    isActive: boolean;
    measurementType: string;
    values: never[];
}[];
