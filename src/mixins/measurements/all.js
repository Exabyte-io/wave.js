import * as THREE from "three";

import { ATOM_GROUP_NAME } from "../../enums";
import { CoordinateLabelsManager, ElementLabelsManager } from "./labelManagers";

/*
 * Base mixin containing generic logic for dealing with labels.
 * Provides core functionality for creating and managing text labels in 3D space.
 */
export const AllMeasurementsMixin = (superclass) =>
    class extends superclass {

        measurementManagers = [];

        initializeMeasurementManagers() {
            const anglesMeasurementManager = new AnglesMeasurementManager(this.structureGroup);
            const distancesMeasurementManager = new DistancesMeasurementManager(this.structureGroup);
            const coordinatesMeasurementManager = new CoordinatesMeasurementManager(this.structureGroup);
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

        onClick: (event: MouseEvent) => {
            this.updateMeasurements();
            this.rebuildScene();
        };

    };
