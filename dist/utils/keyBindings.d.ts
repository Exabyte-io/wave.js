/**
 * One source of truth for what the viewer's keys and pointer gestures do.
 *
 * Twelve configured keys plus nine hard-coded pointer and key bindings existed, and ten of the
 * twenty-one appeared in no tooltip and no menu (finding F3) - every selection modifier, the
 * right-button orbit remap, Delete, and undo itself. The fastest paths in the editor were the
 * least discoverable ones.
 *
 * Generating the sheet from here means a rebind updates the label with it. Defect D2 - a tooltip
 * that promised a hotkey which did not exist - was the same drift running the other way.
 */
export type BindingGroup = "view" | "edit" | "measure" | "touch";
export interface KeyBinding {
    /** What the binding does, in the user's terms. */
    label: string;
    /** The keys or gesture, already formatted for display. */
    keys: string;
    group: BindingGroup;
    /** A pointer gesture rather than a key - grouped the same, rendered the same. */
    isGesture?: boolean;
    /**
     * Only meaningful in edit mode. The mouse gestures express this through `group: "edit"`, but the
     * touch rows are grouped by input device instead, so they carry it explicitly - filtering them by
     * matching label text would break silently the first time a label is reworded.
     */
    editOnly?: boolean;
}
export interface EditorKeyDefinition {
    keys: string[];
    usesModifier?: boolean;
    requiresShift?: boolean;
    label?: string;
}
/** True when `event` matches the given editor key definition. */
export declare function matchesEditorKey(event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "shiftKey">, definition?: EditorKeyDefinition | null): boolean;
/**
 * Cmd on macOS, Ctrl elsewhere. Read at call time rather than at module load so a test can vary
 * the platform, and guarded because this also runs where `navigator` is absent.
 */
export declare function getModifierLabel(): string;
/** "Ctrl + Shift + Z" for a definition, using the running platform's modifier name. */
export declare function formatEditorKey(definition: EditorKeyDefinition): string;
export declare const BINDING_GROUP_LABELS: Record<BindingGroup, string>;
/**
 * Every binding, grouped. `editable` mirrors the component prop: without it there is no edit mode,
 * so advertising its keys would promise something the viewer will not do.
 *
 * `includeTouch` defaults to whether the device can produce touch input at all, rather than to
 * whether the primary pointer is coarse: a touch laptop drives the viewer with a trackpad and still
 * needs the gestures documented. Keyboard rows stay visible either way - a tablet with a keyboard is
 * an ordinary configuration, and hiding them would be the mirror image of the F3 discoverability
 * problem this file exists to fix.
 */
export declare function getKeyBindings({ editable, includeTouch, }?: {
    editable?: boolean;
    includeTouch?: boolean;
}): KeyBinding[];
/**
 * The same bindings bucketed by group, skipping groups that came out empty.
 *
 * `touchFirst` moves the touch group to the front. On a phone the sheet reflows to a single column,
 * so a group's position is how far the user has to scroll to reach it - and putting the gestures that
 * are the only way to drive that device below three groups of keyboard shortcuts buries the one
 * section they came for.
 */
export declare function getGroupedKeyBindings(options?: {
    editable?: boolean;
    includeTouch?: boolean;
    touchFirst?: boolean;
}): {
    group: BindingGroup;
    label: string;
    bindings: KeyBinding[];
}[];
