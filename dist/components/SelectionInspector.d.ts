/**
 * The per-selection data, as a card rather than more buttons.
 *
 * Split out of the 84 px icon column (finding F1), where a value like `-0.083` had to fit a
 * `small` MUI field 84 px wide with a floating label, and where the fields sat below eight icon
 * buttons in a stack ~600 px tall with no scroll - so on a short viewer they were cut off and
 * unreachable. Here the coordinates sit side by side with room to be read, and the card scrolls
 * inside its own bounds rather than overflowing the canvas.
 *
 * Empty state included on purpose: the panel used to render nothing at all when no atom was
 * selected, which taught the user nothing about how to select one - and the selection modifiers
 * (Shift-click, marquee) appear in no other UI.
 */
export type DisplayUnits = "crystal" | "cartesian";
export interface SelectionInspectorProps {
    /** Selected atomic indices, per the mixin's multi-select contract. */
    selectedAtomIndices?: number[];
    /** Element symbol when exactly one atom is selected. */
    selectedElement?: string;
    /** Coordinates of the single selected atom, in the material's own units. */
    selectedCoordinates?: number[];
    /** The material's own basis units - what the coordinates above are expressed in. */
    materialUnits?: string;
    /** Units currently being displayed; may differ from the material's own. */
    displayUnits?: DisplayUnits;
    /** Coordinates converted into `displayUnits`, when that differs from `materialUnits`. */
    displayCoordinates?: number[] | null;
    /** CSS colour for the element swatch. */
    elementColor?: string;
    /** Draft strings while a coordinate field is focused; null means "show the committed value". */
    coordinateDrafts?: (string | null)[];
    /** Draft string while the element field is focused. */
    elementDraft?: string | null;
    onDisplayUnitsChange?: (units: DisplayUnits) => void;
    onCoordinateDraftChange?: (axisIndex: number, value: string) => void;
    onCoordinateCommit?: (axisIndex: number) => void;
    onElementDraftChange?: (value: string) => void;
    onElementCommit?: () => void;
}
/** Caption for a units value, matching what the edit panel used to show. */
export declare function getUnitsCaption(units?: string): string;
declare function SelectionInspector(props: SelectionInspectorProps): import("react/jsx-runtime").JSX.Element;
export default SelectionInspector;
