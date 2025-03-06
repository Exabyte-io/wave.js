import { MEASUREMENT_MODES, MEASUREMENT_MODES_ENUM } from "../../enums";
import { AnglesMeasurementManager } from "./angle";
import { CoordinatesMeasurementManager } from "./coordinate";
import { DistancesMeasurementManager } from "./distance";

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

export const AllMeasurementsMixin = (superclass) =>
    class extends superclass {
        measurementManagers: (
            | CoordinatesMeasurementManager
            | DistancesMeasurementManager
            | AnglesMeasurementManager
        )[] = [];

        bypassReloadViewer = false;

        initializeMeasurementManagers(updateState: any) {
            const distancesMeasurementManager = new DistancesMeasurementManager(
                this.structureGroup,
                this.camera,
                this,
                updateState,
            );

            const coordinatesMeasurementManager = new CoordinatesMeasurementManager(
                this.structureGroup,
                this.camera,
                this,
                updateState,
            );

            const anglesMeasurementManager = new AnglesMeasurementManager(
                this.structureGroup,
                this.camera,
                this,
                updateState,
            );

            this.measurementManagers.push(
                coordinatesMeasurementManager,
                distancesMeasurementManager,
                anglesMeasurementManager,
            );
        }

        getMeasurementManagerByType(measurementType: MEASUREMENT_MODES_ENUM) {
            return this.measurementManagers.find((m) => m.measurementType === measurementType);
        }

        getActiveMeasurementManager() {
            return this.measurementManagers.find((m) => m.isActive);
        }

        getMeasurementsSettings() {
            return this.measurementManagers.map((m) => m.getSettings());
        }

        getMeasurementsSettingsHandler() {
            return new MeasurementSettingsHandler(this.getMeasurementsSettings());
        }

        toggleMeasurementByType(measurementType: MEASUREMENT_MODES_ENUM, updateState: any) {
            if (!this.measurementManagers.length) {
                this.initializeMeasurementManagers(updateState);
            }
            const measurementManager = this.getMeasurementManagerByType(measurementType);
            measurementManager?.toggleActive();
        }

        createAllMeasurements() {
            const activeMeasurementManager = this.getActiveMeasurementManager();
            activeMeasurementManager?.createMeasurements();
        }
    };
