import * as THREE from "three";

import { ATOM_GROUP_NAME } from "../../enums";
import { CoordinateLabelsManager, ElementLabelsManager } from "./labelManagers";

/*
 * Base mixin containing generic logic for dealing with labels.
 * Provides core functionality for creating and managing text labels in 3D space.
 */
export const AllLabelsMixin = (superclass) =>
    class extends superclass {

        labelManagers = [];

        initializeLabelManagers() {
            const elementLabelsManager = new ElementLabelsManager(this.structureGroup);
            const coordinateLabelsManager = new CoordinateLabelsManager(this.structureGroup);
            this.labelManagers.push(elementLabelsManager, coordinateLabelsManager);
        }

        getLabelManagerByType(labelType) {
            return this.labelManagers.find((holder) => holder.labelType === labelType);
        }

        createAllLabels(sourceGroup = this.structureGroup) {
            this.labelManagers.forEach((holder) =>
                this.createLabels(holder.labelType, sourceGroup),
            );
        }

        adjustAllLabelsToCameraPosition() {
            this.labelManagers.forEach((holder) =>
                this.adjustLabelsToCameraPosition(holder.labelType),
            );
        }

        toggleLabelsVisibilityByType(labelType) {
            const labelManager = this.getLabelManagerByType(labelType);
            labelManager.toggleLabelsVisibility();
        }
    };
