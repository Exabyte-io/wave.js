import * as THREE from "three";

import { MEASUREMENT_MODES_ENUM } from "../../enums";
import { BaseMeasurementManager } from "./base";
import settings from "../../settings";
import { CoordinateLabelsManager } from "../labels/coordinate";
import { LabelsManagerConstructor } from "../labels/base";
import { getObjectCoordinate, getObjectCoordinateAsArray } from "../threeJsUtils";

export class CoordinatesMeasurementManager extends BaseMeasurementManager<CoordinateLabelsManager> {
    measurementType = MEASUREMENT_MODES_ENUM.COORDINATE;

    override LabelsManagerCls: LabelsManagerConstructor<CoordinateLabelsManager> =
        CoordinateLabelsManager;

    config = settings.coordinateLabelsConfig;

    constructor(
        waveStructureGroup: THREE.Group,
        waveCamera: THREE.Camera,
        wave: any,
        updateState: any,
    ) {
        super(waveStructureGroup, waveCamera, wave, updateState);
        this.labelsManager = this.getLabelsManagerInstance();
    }

    onClick = (updateState, event: MouseEvent) => {
        super.onClick(event);
        if (!this.selectedAtoms.length) return;
        // this.createMeasurementLabelsForAtoms();

        // this.labelsManager.createLabels(this.selectedAtoms, this.THREEGroup);
        // this.labelsManager.toggleVisibility();
        updateState(this.getSettings(), this.getTHREEGroupsToPersist());
        console.log("updateState", updateState);
    };

    getTHREEGroupsToPersist() {
        return [this.THREEGroup];
    }

    createMeasurements() {
        if (!this.selectedAtoms.length || !this.isActive) return;
        this.selectedAtoms.forEach((atom) => {
            const positionAsArray = getObjectCoordinateAsArray(atom);
            const positionText = positionAsArray.map((coord) => coord.toFixed(2)).join(", ");
            this.createMeasurementLabel(
                positionText,
                `label-for-${positionText}`,
                getObjectCoordinate(atom),
            );
        });
    }

    refillSelectedAtoms() {
        const currentAtoms = this.collectAllAtoms();
        const newSelectedAtoms = [];

        if (!this.selectedAtoms || !this.selectedAtoms.length) return;
        this.selectedAtoms.forEach((atom) => {
            const newAtom = currentAtoms.find((currentAtom) => {
                const firstAtomPoint = getObjectCoordinate(atom);
                const secondAtomPoint = getObjectCoordinate(currentAtom.matrixWorld);
                if (!firstAtomPoint.distanceTo(secondAtomPoint)) {
                    return currentAtom;
                }
                return null;
            });
            this.handleSetSelected(newAtom);
            newAtom.userData = { ...atom.userData };
            newSelectedAtomspush(newAtom);
        });
        this.selectedAtoms = newSelectedAtoms;
    }
}
