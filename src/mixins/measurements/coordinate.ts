import * as THREE from "three";

import { MEASUREMENT_MODES } from "../../enums";
import { BaseMeasurementManager } from "./base";
import { getObjectCoordinate, getObjectCoordinateAsArray } from "../threeJsUtils";
import settings from "../../settings";
import { CoordinateLabelsManager } from "../labels/coordinate";

export class CoordinatesMeasurementManager extends BaseMeasurementManager {
    measurementType = MEASUREMENT_MODES.COORDINATE;

    LabelsManager = CoordinateLabelsManager;

    config = settings.coordinateLabelsConfig;

    onClick = (event: MouseEvent) => {
        super.onClick(event);
        this.selectedAtoms.forEach((atom) => {
            const positionAsArray = getObjectCoordinateAsArray(atom);
            const positionText = positionAsArray.map((coord) => coord.toFixed(2)).join(", ");
            this.createMeasurementLabel(
                positionText,
                `label-for-${positionText}`,
                getObjectCoordinate(atom),
            );
        });
    };
}
