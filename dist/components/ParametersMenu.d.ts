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
declare function ParametersMenu(props: ParametersMenuProps): import("react/jsx-runtime").JSX.Element;
export default ParametersMenu;
