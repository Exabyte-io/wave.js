import { CoordinatesMeasurementManager } from "./coordinate";
import { MEASUREMENT_MODES_ENUM } from "../../enums";

export const AllMeasurementsMixin = (superclass) =>
    class extends superclass {
        measurementManagers: CoordinatesMeasurementManager[] = [];

        initializeMeasurementManagers() {
            // const anglesMeasurementManager = new AnglesMeasurementManager(this.structureGroup);
            // const distancesMeasurementManager = new DistancesMeasurementManager(
            //     this.structureGroup,
            // );
            const coordinatesMeasurementManager = new CoordinatesMeasurementManager(
                this.structureGroup,
                this.camera,
                this,
            );
            this.measurementManagers.push(
                coordinatesMeasurementManager,
                // anglesMeasurementManager,
                // distancesMeasurementManager,
            );
        }

        getMeasurementManagerByType(measurementType: MEASUREMENT_MODES_ENUM) {
            return this.measurementManagers.find((m) => m.measurementType === measurementType);
        }

        getActiveMeasurementManager() {
            return this.measurementManagers.find((m) => m.isActive === true);
        }

        getMeasurementsSettings() {
            return this.measurementManagers.map((m) => m.getSettings());
        }

        toggleMeasurementByType(measurementType: MEASUREMENT_MODES_ENUM) {
            const measurementManager = this.getMeasurementManagerByType(measurementType);
            measurementManager?.toggleActive();
        }

        createMeasurementLabels() {
            const activeMeasurementManager = this.getActiveMeasurementManager();
            activeMeasurementManager?.createLabels();
        }

        updateMeasurements() {
            // TODO: call this render
        }

        // onClick(event) {
        //     this.updateMeasurements();
        //     this.rebuildScene();
        // }
    };
