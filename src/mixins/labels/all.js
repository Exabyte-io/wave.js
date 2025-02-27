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
            const elementLabelsManager = new ElementLabelsManager(this.structureGroup, this.camera);
            const coordinateLabelsManager = new CoordinateLabelsManager(
                this.structureGroup,
                this.camera,
            );
            this.labelManagers.push(elementLabelsManager, coordinateLabelsManager);
        }

        getLabelManagerByType(labelType) {
            return this.labelManagers.find((holder) => holder.labelType === labelType);
        }

        createAllLabels(sourceGroup = this.structureGroup) {
            this.labelManagers.forEach((holder) => holder.createLabels());
        }

        adjustAllLabelsToCameraPosition() {
            this.labelManagers.forEach((holder) => holder.adjustLabelsToCameraPosition());
        }

        toggleLabelsVisibilityByType(labelType) {
            const labelManager = this.getLabelManagerByType(labelType);
            if (labelManager) {
                labelManager.toggleLabelsVisibility();
            }
        }
    };
