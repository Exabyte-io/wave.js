import { MEASUREMENT_MODES_ENUM } from "../enums";
import { MeasurementSettingsForType } from "../mixins/measurements/MeasurementSettingsHandler";
/**
 * A mode was previously signalled only by the Edit icon changing colour, and a measurement mode
 * not at all: it is armed from a dropdown that then closes, after which every click means
 * something different with nothing on screen to say so (finding F5). Edit mode additionally
 * remaps orbit-rotate to the right mouse button (spec section 3f) - a change to what the primary
 * mouse gesture does, advertised nowhere (F4).
 *
 * This pill names the active mode, states the bindings that appear in no tooltip or menu, and
 * offers a one-click exit so leaving a mode does not mean hunting back through the menu that
 * armed it. Absence of a pill is itself information: clicks do nothing but orbit.
 */
export interface ModePillProps {
    /** Edit mode is active. Mutually exclusive with a measurement, per decision D-12. */
    isEditModeActive?: boolean;
    /** The armed measurement mode, or null. */
    activeMeasurement?: MeasurementSettingsForType | null;
    /** Exits edit mode. */
    onExitEditMode?: () => void;
    /** Exits the given measurement mode. */
    onExitMeasurement?: (measurementType: MEASUREMENT_MODES_ENUM) => void;
    /** Whether orbit controls are on, which decides what the right button is said to do. */
    isOrbitEnabled?: boolean;
}
/**
 * Bindings worth stating in the pill, sourced from settings so a rebind cannot desync them.
 *
 * `isOrbitEnabled` gates the right-button note. Orbit controls start disabled
 * (`initOrbitControls(enabled = false)`), so while they are off the right button orbits nothing -
 * and advertising a binding that does nothing is the defect this whole slice is trying to undo.
 */
export declare function getEditModeBindings({ isOrbitEnabled, }?: {
    isOrbitEnabled?: boolean;
}): string[];
declare function ModePill(props: ModePillProps): import("react/jsx-runtime").JSX.Element | null;
export default ModePill;
