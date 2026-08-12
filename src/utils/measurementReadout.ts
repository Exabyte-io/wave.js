import { MEASUREMENT_MODES, MEASUREMENT_MODES_ENUM } from "../enums";
import { MeasurementSettingsForType } from "../mixins/measurements/MeasurementSettingsHandler";
import settings from "../settings";

/**
 * Turns the measurement state the managers already report into something displayable.
 *
 * A measurement result used to exist only as a 3D sprite plus a silent clipboard write, and
 * arming a mode left no trace once its menu closed (finding F5). Both the mode pill and the
 * status bar need the same two answers - what has been measured, and how many picks are still
 * outstanding - so neither component owns this.
 */

/** Human-facing name of a mode, short enough for a pill badge. */
export function getMeasurementLabel(measurementType?: MEASUREMENT_MODES_ENUM | string): string {
    switch (measurementType) {
        case MEASUREMENT_MODES.DISTANCE:
            return "Distance";
        case MEASUREMENT_MODES.ANGLE:
            return "Angle";
        case MEASUREMENT_MODES.COORDINATE:
            return "Coordinates";
        default:
            return "";
    }
}

/** What the mode does with a click, for the pill's hint text. */
export function getMeasurementHint(measurement?: MeasurementSettingsForType | null): string {
    if (!measurement) return "";
    const needed = measurement.atomsPerMeasurement || 1;
    if (measurement.measurementType === MEASUREMENT_MODES.COORDINATE) {
        return "every atom you click is copied to the clipboard";
    }
    const nouns: Record<number, string> = { 2: "two atoms", 3: "three atoms" };
    return `click ${nouns[needed] || `${needed} atoms`} · result copied to the clipboard`;
}

export interface MeasurementProgress {
    /** Picks made toward the measurement in progress, 0 when nothing is half-specified. */
    picked: number;
    /** Picks one measurement consumes. */
    needed: number;
    /** True when a measurement is part-specified and waiting on more clicks. */
    isPartial: boolean;
}

/**
 * Progress toward the *next* measurement. The managers keep every pick in one flat list and
 * group it into pairs or triplets, so the remainder is what is outstanding: 5 picks in distance
 * mode means two finished pairs and one atom waiting for its partner.
 */
export function getMeasurementProgress(
    measurement?: MeasurementSettingsForType | null,
): MeasurementProgress {
    const needed = Math.max(1, measurement?.atomsPerMeasurement || 1);
    const count = measurement?.selectedAtomsCount || 0;
    const picked = needed > 1 ? count % needed : 0;
    return { picked, needed, isPartial: picked > 0 };
}

const round = (value: number) => value.toFixed(settings.roundPrecision);

/**
 * The most recent measurement, formatted for a one-line readout, or null when there is none.
 * Distances and angles arrive as flat number lists; coordinate mode reports position triples.
 */
export function formatMeasurementValue(
    measurement?: MeasurementSettingsForType | null,
): string | null {
    const values = measurement?.values;
    if (!Array.isArray(values) || !values.length) return null;
    const latest = values[values.length - 1];

    if (measurement?.measurementType === MEASUREMENT_MODES.COORDINATE) {
        if (!Array.isArray(latest)) return null;
        return `(${latest.map((component: number) => round(component)).join(", ")})`;
    }
    if (typeof latest !== "number" || Number.isNaN(latest)) return null;
    if (measurement?.measurementType === MEASUREMENT_MODES.ANGLE) {
        return `${round(latest)}°`;
    }
    return `d = ${round(latest)} Å`;
}
