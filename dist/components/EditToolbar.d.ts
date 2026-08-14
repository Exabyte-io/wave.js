/**
 * The edit tools, as icons only.
 *
 * Extracted from `ThreeDEditor.renderEditToolbar`, which packed eight icon buttons *and* four
 * text fields into a single 84 px column - roughly 600 px tall, with no scroll, so in any viewer
 * shorter than that the coordinate fields were simply cut off (finding F1). Splitting the tools
 * from the data also stops the two reading as one undifferentiated stack: these are verbs, and
 * they now share the visual language of the left menu strip. The data lives in
 * `SelectionInspector`.
 */
export type TransformMode = "translate" | "rotate";
export interface EditToolbarProps {
    activeTransformMode?: TransformMode;
    /** Number of selected atoms; drives the disabled states and the plural tooltips. */
    selectedCount?: number;
    /** Element the Add button will insert. */
    defaultElement?: string;
    canUndo?: boolean;
    canRedo?: boolean;
    onSetTransformMode?: (mode: TransformMode) => void;
    onAddAtom?: () => void;
    onCloneSelected?: () => void;
    onRemoveSelected?: () => void;
    onFocusCamera?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
}
declare function EditToolbar(props: EditToolbarProps): import("react/jsx-runtime").JSX.Element;
export default EditToolbar;
