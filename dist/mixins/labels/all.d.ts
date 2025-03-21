import { CoordinateLabelsManager } from "./coordinate";
import { ElementLabelsManager } from "./element";
export declare const AllLabelsMixin: (superclass: any) => {
    new (): {
        [x: string]: any;
        labelManagers: (ElementLabelsManager | CoordinateLabelsManager)[];
        initializeLabelManagers(): void;
        getLabelManagerByType(labelType: string): CoordinateLabelsManager | ElementLabelsManager | undefined;
        createAllLabels(): void;
        adjustAllLabelsToCameraPosition(): void;
        toggleLabelsVisibilityByType(labelType: string): void;
        areLabelsVisibleByType(labelType: string): boolean | undefined;
    };
    [x: string]: any;
};
