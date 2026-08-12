import settings from "../settings";

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

export type BindingGroup = "view" | "edit" | "measure";

export interface KeyBinding {
    /** What the binding does, in the user's terms. */
    label: string;
    /** The keys or gesture, already formatted for display. */
    keys: string;
    group: BindingGroup;
    /** A pointer gesture rather than a key - grouped the same, rendered the same. */
    isGesture?: boolean;
}

export interface EditorKeyDefinition {
    keys: string[];
    usesModifier?: boolean;
    requiresShift?: boolean;
    label?: string;
}

/** True when `event` matches the given editor key definition. */
export function matchesEditorKey(
    event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "shiftKey">,
    definition?: EditorKeyDefinition | null,
): boolean {
    if (!definition?.keys?.length) return false;
    const hasModifier = Boolean(event.metaKey || event.ctrlKey);
    if (Boolean(definition.usesModifier) !== hasModifier) return false;
    // Shift is only significant for combos that use a modifier; Delete-with-Shift is still Delete.
    if (definition.usesModifier && Boolean(definition.requiresShift) !== Boolean(event.shiftKey)) {
        return false;
    }
    return definition.keys.some((key) => key.toLowerCase() === event.key?.toLowerCase());
}

/**
 * Cmd on macOS, Ctrl elsewhere. Read at call time rather than at module load so a test can vary
 * the platform, and guarded because this also runs where `navigator` is absent.
 */
export function getModifierLabel(): string {
    const platform =
        typeof navigator === "undefined"
            ? ""
            : navigator.platform || (navigator as { userAgent?: string }).userAgent || "";
    return /Mac|iPhone|iPad/i.test(platform) ? "Cmd" : "Ctrl";
}

/** "Ctrl + Shift + Z" for a definition, using the running platform's modifier name. */
export function formatEditorKey(definition: EditorKeyDefinition): string {
    const parts: string[] = [];
    if (definition.usesModifier) parts.push(getModifierLabel());
    if (definition.requiresShift) parts.push("Shift");
    const keys = definition.keys.map((key) => (key.length === 1 ? key.toUpperCase() : key));
    // Alternatives ("Delete / Backspace") rather than a combo, so they are joined differently.
    parts.push(keys.join(" / "));
    return parts.join(" + ");
}

/**
 * Pointer gestures. They are not in any config because there is nothing to rebind, but leaving
 * them out is why "Shift-click adds to the selection" was documented nowhere in the product.
 */
const POINTER_GESTURES: KeyBinding[] = [
    { label: "Select atom", keys: "click", group: "edit", isGesture: true },
    { label: "Add to selection", keys: "Shift + click", group: "edit", isGesture: true },
    { label: "Toggle one atom", keys: "Cmd/Ctrl + click", group: "edit", isGesture: true },
    { label: "Marquee select", keys: "drag empty space", group: "edit", isGesture: true },
    // The remap that catches people out: a left-drag marquees, so orbit moves to the right button.
    { label: "Orbit while editing", keys: "right-drag", group: "edit", isGesture: true },
    { label: "Move atom / group", keys: "drag atom", group: "edit", isGesture: true },
];

/** Configured single-character keys, in the order they should read, with their group. */
const HOTKEY_ROWS: { setting: string; label: string; group: BindingGroup }[] = [
    { setting: "toggleInteractive", label: "Interactive on / off", group: "view" },
    { setting: "toggleOrbitControls", label: "Rotate / zoom", group: "view" },
    { setting: "toggleBonds", label: "Bonds", group: "view" },
    { setting: "toggleElementLabels", label: "Element labels", group: "view" },
    { setting: "toggleCoordinateLabels", label: "Coordinate labels", group: "view" },
    { setting: "resetViewer", label: "Reset view", group: "view" },
    { setting: "toggleKeyboardSheet", label: "This sheet", group: "view" },
    { setting: "toggleEditMode", label: "Edit mode", group: "edit" },
    { setting: "focusCameraOnSelection", label: "Focus on selection", group: "edit" },
    { setting: "toggleDistanceShown", label: "Distances", group: "measure" },
    { setting: "toggleAnglesShown", label: "Angles", group: "measure" },
    { setting: "toggleCopyCoordinatesShown", label: "Copy coordinates", group: "measure" },
    { setting: "deleteConnection", label: "Clear last connection", group: "measure" },
];

/** Which editor keys belong in which group, in display order. */
const EDITOR_KEY_GROUPS: { setting: string; group: BindingGroup }[] = [
    { setting: "cancelOrDeselect", group: "edit" },
    { setting: "removeSelected", group: "edit" },
    { setting: "undo", group: "edit" },
    { setting: "redo", group: "edit" },
];

export const BINDING_GROUP_LABELS: Record<BindingGroup, string> = {
    view: "View & camera",
    edit: "Select & edit",
    measure: "Measure",
};

/**
 * Every binding, grouped. `editable` mirrors the component prop: without it there is no edit mode,
 * so advertising its keys would promise something the viewer will not do.
 */
export function getKeyBindings({ editable = true }: { editable?: boolean } = {}): KeyBinding[] {
    const hotKeys = settings.hotKeysConfig as Record<string, string | undefined>;
    const editorKeys = settings.editorKeysConfig as Record<string, EditorKeyDefinition | undefined>;

    const fromHotKeys: KeyBinding[] = HOTKEY_ROWS.filter(
        (row) => hotKeys[row.setting] && (editable || row.group !== "edit"),
    ).map((row) => ({
        label: row.label,
        keys:
            (hotKeys[row.setting] as string).length === 1
                ? (hotKeys[row.setting] as string).toUpperCase()
                : (hotKeys[row.setting] as string),
        group: row.group,
    }));

    const fromEditorKeys: KeyBinding[] = editable
        ? EDITOR_KEY_GROUPS.filter((row) => editorKeys[row.setting]).map((row) => {
              const definition = editorKeys[row.setting] as EditorKeyDefinition;
              return {
                  label: definition.label || row.setting,
                  keys: formatEditorKey(definition),
                  group: row.group,
              };
          })
        : [];

    const gestures = editable
        ? POINTER_GESTURES
        : POINTER_GESTURES.filter((gesture) => gesture.group !== "edit");

    return [...fromHotKeys, ...fromEditorKeys, ...gestures];
}

/** The same bindings bucketed by group, skipping groups that came out empty. */
export function getGroupedKeyBindings(
    options: { editable?: boolean } = {},
): { group: BindingGroup; label: string; bindings: KeyBinding[] }[] {
    const all = getKeyBindings(options);
    return (["view", "edit", "measure"] as BindingGroup[])
        .map((group) => ({
            group,
            label: BINDING_GROUP_LABELS[group],
            bindings: all.filter((binding) => binding.group === group),
        }))
        .filter((section) => section.bindings.length > 0);
}
