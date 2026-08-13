/**
 * Viewer parameters.
 *
 * These were five bare number inputs (finding F7). Their ranges existed only as invisible
 * `inputProps`, there was no way back to a default, and nothing said what a value would cost - a
 * 4x4x4 repetition on a 24-atom cell draws 1,536 atoms with no warning. Radius and bond cutoff in
 * particular are found by nudging until the picture reads right, which is a job for a slider; the
 * numeric box stays beside each one so a value can still be read off and reproduced exactly.
 */
export type ViewerSettings = {
    isViewAdjustable: boolean;
    atomRadiiScale: number;
    repetitionsAlongLatticeVectorA: number;
    repetitionsAlongLatticeVectorB: number;
    repetitionsAlongLatticeVectorC: number;
    chemicalConnectivityFactor: number;
};
type PartialViewerSettings = Partial<ViewerSettings>;
interface ParametersMenuProps {
    viewerSettings: ViewerSettings;
    /** Atoms in the unit cell, so the repetition cost can be stated rather than guessed. */
    atomCountInCell?: number;
    onSettingChange: (setting: PartialViewerSettings) => void;
}
export declare const PARAMETER_RANGES: {
    atomRadiiScale: {
        min: number;
        max: number;
        step: number;
    };
    chemicalConnectivityFactor: {
        min: number;
        max: number;
        step: number;
    };
    repetitions: {
        min: number;
        max: number;
        step: number;
    };
};
/** Defaults come from settings, so "reset" cannot drift from what the viewer actually starts with. */
export declare function getParameterDefaults(): PartialViewerSettings;
/** How many atoms a repetition actually draws - the cost the old UI never mentioned. */
export declare function getDrawnAtomCount(viewerSettings: Pick<ViewerSettings, "repetitionsAlongLatticeVectorA" | "repetitionsAlongLatticeVectorB" | "repetitionsAlongLatticeVectorC">, atomCountInCell?: number): number;
/**
 * Clamps whichever of these settings a patch carries, leaving everything else untouched.
 *
 * The menu clamps what a user types, but values also arrive from outside it - URL parameters
 * (`utils/viewSettingsUrl.ts`) and a host's `initialViewSettings` - and those were never checked.
 * That is how an out-of-range value gets in: a saved link with `atomRadiiScale=3` renders at 3, shows
 * "3.00" in the field, pins the slider at its maximum, and then silently drops to the maximum the
 * first time the slider is touched. Narrowing the radius range from 10 to 1 turned that from a corner
 * case into a likely one, so the boundary is worth guarding rather than the control alone.
 */
export declare function clampParameterSettings(partialSettings: PartialViewerSettings): PartialViewerSettings;
declare function ParametersMenu(props: ParametersMenuProps): import("react/jsx-runtime").JSX.Element;
export default ParametersMenu;
