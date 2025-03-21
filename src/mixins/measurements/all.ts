import { MEASUREMENT_MODES_ENUM } from "../../enums";
import { AnglesMeasurementManager } from "./angle";
import { CoordinatesMeasurementManager } from "./coordinate";
import { DistancesMeasurementManager } from "./distance";
import { MeasurementSettingsHandler } from "./MeasurementSettingsHandler";

export const AllMeasurementsMixin = (superclass: any) =>
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
            const activeManager = this.getActiveMeasurementManager();
            if (activeManager && activeManager.measurementType !== measurementType) {
                activeManager.toggleActive();
            }
            measurementManager?.toggleActive();
        }

        createAllMeasurements() {
            const activeMeasurementManager = this.getActiveMeasurementManager();
            activeMeasurementManager?.createMeasurements();
        }

        resetAllMeasurements() {
            this.measurementManagers.forEach((manager) => manager.resetMeasurements());
        }

        deleteConnection() {
            const activeManager = this.getActiveMeasurementManager();
            if (activeManager && activeManager.currentSelectedLine) {
                activeManager.deleteSelectedLine();
                this.render();

                // Update state if needed
                if (activeManager.updateState) {
                    activeManager.updateState(activeManager.getSettings());
                }
            }
        }
    };
