import { CoordinateLabelsManager } from "./coordinate";
import { ElementLabelsManager } from "./element";
/*
 * Base mixin containing generic logic for dealing with labels.
 * Provides core functionality for creating and managing text labels in 3D space.
 */
export const AllLabelsMixin = (superclass) => class extends superclass {
    constructor() {
        super(...arguments);
        this.labelManagers = [];
    }
    initializeLabelManagers() {
        const elementLabelsManager = new ElementLabelsManager(this.structureGroup, this.camera, this);
        const coordinateLabelsManager = new CoordinateLabelsManager(this.structureGroup, this.camera, this);
        this.labelManagers.push(elementLabelsManager, coordinateLabelsManager);
    }
    getLabelManagerByType(labelType) {
        return this.labelManagers.find((manager) => manager.labelType === labelType);
    }
    createAllLabels() {
        this.labelManagers.forEach((manager) => manager.createLabels());
    }
    adjustAllLabelsToCameraPosition() {
        this.labelManagers.forEach((manager) => manager.adjustLabelsToCameraPosition());
    }
    toggleLabelsVisibilityByType(labelType) {
        if (!this.labelManagers.length) {
            this.initializeLabelManagers();
        }
        const labelManager = this.getLabelManagerByType(labelType);
        labelManager === null || labelManager === void 0 ? void 0 : labelManager.toggleVisibility();
        // this.createAllLabels();
        // this.rebuildScene();
    }
    areLabelsVisibleByType(labelType) {
        const labelManager = this.getLabelManagerByType(labelType);
        return labelManager === null || labelManager === void 0 ? void 0 : labelManager.isVisible;
    }
};
