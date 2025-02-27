import * as THREE from "three";

import { AnglesMeasurementManager } from "./angle";
import { CoordinatesMeasurementManager } from "./coordinate";
import { DistancesMeasurementManager } from "./distance";
/*
 * Base mixin containing generic logic for dealing with labels.
 * Provides core functionality for creating and managing text labels in 3D space.
 */
export const AllMeasurementsMixin = (superclass) =>
    class extends superclass {
        measurementManagers = [];

        initializeMeasurementManagers() {
            const anglesMeasurementManager = new AnglesMeasurementManager(this.structureGroup);
            const distancesMeasurementManager = new DistancesMeasurementManager(
                this.structureGroup,
            );
            const coordinatesMeasurementManager = new CoordinatesMeasurementManager(
                this.structureGroup,
            );
            this.measurementManagers.push(anglesMeasurementManager, distancesMeasurementManager);
        }

        getMeasurementManagerByType(measurementType) {
            return this.measurementManagers.find((m) => m.type === measurementType);
        }

        getActiveMeasurementManager() {
            return this.measurementManagers.find((m) => m.isActive === true);
        }

        createMeasurmentLabels() {
            const activeMeasurementManager = this.getActiveMeasurementManager();
            activeMeasurementManager.createLabels();
        }

        updateMeasurements() {
            // TODO: call this render
        }

        onClick(event) {
            this.updateMeasurements();
            this.rebuildScene();
        }
    };
