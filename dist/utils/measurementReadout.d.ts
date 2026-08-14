import { MEASUREMENT_MODES_ENUM } from "../enums";
import { MeasurementSettingsForType } from "../mixins/measurements/MeasurementSettingsHandler";
/**
 * Turns the measurement state the managers already report into something displayable.
 *
 * A measurement result used to exist only as a 3D sprite plus a silent clipboard write, and
 * arming a mode left no trace once its menu closed (finding F5). Both the mode pill and the
 * status bar need the same two answers - what has been measured, and how many picks are still
 * outstanding - so neither component owns this.
 */
/** Human-facing name of a mode, short enough for a pill badge. */
export declare function getMeasurementLabel(measurementType?: MEASUREMENT_MODES_ENUM | string): string;
/** What the mode does with a click, for the pill's hint text. */
export declare function getMeasurementHint(measurement?: MeasurementSettingsForType | null): string;
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
export declare function getMeasurementProgress(measurement?: MeasurementSettingsForType | null): MeasurementProgress;
/**
 * The most recent measurement, formatted for a one-line readout, or null when there is none.
 * Distances and angles arrive as flat number lists; coordinate mode reports position triples.
 */
export declare function formatMeasurementValue(measurement?: MeasurementSettingsForType | null): string | null;
