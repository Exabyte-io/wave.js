/**
 * Nothing in the viewer used to say what structure was on screen: no formula, no atom count,
 * no lattice, and no units except one caption inside the edit panel that only appeared while
 * exactly one atom was selected (finding F10). Measurement results were equally invisible -
 * a 3D sprite plus a silent clipboard write (F5) - and the element colours that encode
 * identity had no key at all (F11).
 *
 * This bar is a read-only view of state `ThreeDEditor` already holds. It never mutates the
 * material, so it cannot perturb the edit path, and its right-hand region doubles as the
 * component's only `aria-live` region.
 */
/** A basis element entry is a bare symbol in some fixtures and a `{ value }` cell in others. */
type ElementEntry = string | {
    value?: string;
    element?: string;
};
interface LatticeLike {
    type?: string;
    unitCell?: Record<string, number>;
}
interface BasisLike {
    elements?: ElementEntry[];
    units?: string;
}
export interface MaterialLike {
    formula?: string;
    unitCellFormula?: string;
    name?: string;
    basis?: BasisLike;
    getLattice?: () => LatticeLike | undefined;
}
export interface StatusBarProps {
    material?: MaterialLike | null;
    /** Selected atomic indices, per the mixin's multi-select contract. */
    selectedAtomIndices?: number[];
    /** Symbol of the single selected atom, when there is exactly one. */
    selectedElement?: string;
    /** Latest measurement readout, e.g. `"d = 2.351 Å"`. Null hides the slot. */
    measurement?: string | null;
    /** Transient description of the edit that just committed, e.g. "Moved atom · Ctrl + Z to undo". */
    lastActionHint?: string | null;
    /** Click a composition chip. Omit to render the chips as a plain legend. */
    onSelectElement?: (elementSymbol: string) => void;
}
export declare function normalizeElement(entry: ElementEntry | undefined): string;
/** Element symbols in first-appearance order with their counts - the composition legend. */
export declare function getComposition(material?: MaterialLike | null): [string, number][];
/**
 * Lattice constants from the cell vectors rather than from a `Lattice` getter: the vectors are
 * the one representation every code path here already relies on (`Lattice.unitCell` drives
 * add-atom placement and the viewer's own cell object), so this cannot disagree with what is
 * drawn.
 */
export declare function getLatticeSummary(material?: MaterialLike | null): string;
/** Splits "Si8O16" into symbol/count pairs so the counts can render as subscripts. */
export declare function tokenizeFormula(formula: string): [string, string][];
declare function StatusBar(props: StatusBarProps): import("react/jsx-runtime").JSX.Element;
export default StatusBar;
