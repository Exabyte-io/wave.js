import { CoordinateLabelsManager } from "./coordinate";
import { ElementLabelsManager } from "./element";
/*
 * Base mixin containing generic logic for dealing with labels.
 * Provides core functionality for creating and managing text labels in 3D space.
 */
export const AllLabelsMixin = (superclass) =>
    class extends superclass {
        labelManagers = [];

        initializeLabelManagers() {
            const elementLabelsManager = new ElementLabelsManager(
                this.structureGroup,
                this.camera,
                this,
            );
            const coordinateLabelsManager = new CoordinateLabelsManager(
                this.structureGroup,
                this.camera,
                this,
            );
            this.labelManagers.push(elementLabelsManager, coordinateLabelsManager);
        }

        getLabelManagerByType(labelType: string) {
            return this.labelManagers.find((manager) => manager.labelType === labelType);
        }

        createAllLabels() {
            this.labelManagers.forEach((manager) => manager.createLabels());
        }

        adjustAllLabelsToCameraPosition() {
            this.labelManagers.forEach((manager) => manager.adjustLabelsToCameraPosition());
        }

        toggleLabelsVisibilityByType(labelType: string) {
            if (!this.labelManagers.length) {
                this.initializeLabelManagers();
            }
            const labelManager = this.getLabelManagerByType(labelType);
            labelManager?.toggleLabelsVisibility();
            // this.createAllLabels();
            // this.rebuildScene();
        }

        areLabelsVisibleByType(labelType: string) {
            const labelManager = this.getLabelManagerByType(labelType);
            return labelManager?.isVisible;
        }
    };
