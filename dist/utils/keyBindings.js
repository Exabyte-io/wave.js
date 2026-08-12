import settings from "../settings";
import { hasTouchSupport } from "./inputCapabilities";
/** True when `event` matches the given editor key definition. */
export function matchesEditorKey(event, definition) {
    var _a;
    if (!((_a = definition === null || definition === void 0 ? void 0 : definition.keys) === null || _a === void 0 ? void 0 : _a.length))
        return false;
    const hasModifier = Boolean(event.metaKey || event.ctrlKey);
    if (Boolean(definition.usesModifier) !== hasModifier)
        return false;
    // Shift is only significant for combos that use a modifier; Delete-with-Shift is still Delete.
    if (definition.usesModifier && Boolean(definition.requiresShift) !== Boolean(event.shiftKey)) {
        return false;
    }
    return definition.keys.some((key) => { var _a; return key.toLowerCase() === ((_a = event.key) === null || _a === void 0 ? void 0 : _a.toLowerCase()); });
}
/**
 * Cmd on macOS, Ctrl elsewhere. Read at call time rather than at module load so a test can vary
 * the platform, and guarded because this also runs where `navigator` is absent.
 */
export function getModifierLabel() {
    const platform = typeof navigator === "undefined"
        ? ""
        : navigator.platform || navigator.userAgent || "";
    return /Mac|iPhone|iPad/i.test(platform) ? "Cmd" : "Ctrl";
}
/** "Ctrl + Shift + Z" for a definition, using the running platform's modifier name. */
export function formatEditorKey(definition) {
    const parts = [];
    if (definition.usesModifier)
        parts.push(getModifierLabel());
    if (definition.requiresShift)
        parts.push("Shift");
    const keys = definition.keys.map((key) => (key.length === 1 ? key.toUpperCase() : key));
    // Alternatives ("Delete / Backspace") rather than a combo, so they are joined differently.
    parts.push(keys.join(" / "));
    return parts.join(" + ");
}
/**
 * Pointer gestures. They are not in any config because there is nothing to rebind, but leaving
 * them out is why "Shift-click adds to the selection" was documented nowhere in the product.
 */
const POINTER_GESTURES = [
    { label: "Select atom", keys: "click", group: "edit", isGesture: true },
    { label: "Add to selection", keys: "Shift + click", group: "edit", isGesture: true },
    { label: "Toggle one atom", keys: "Cmd/Ctrl + click", group: "edit", isGesture: true },
    { label: "Marquee select", keys: "drag empty space", group: "edit", isGesture: true },
    // The remap that catches people out: a left-drag marquees, so orbit moves to the right button.
    { label: "Orbit while editing", keys: "right-drag", group: "edit", isGesture: true },
    { label: "Move atom / group", keys: "drag atom", group: "edit", isGesture: true },
];
/**
 * Touch gestures (U-13). Listed separately because they are not alternative labels for the mouse
 * gestures above - the mapping genuinely differs. In edit mode one finger is reserved for atoms, the
 * same way the left button is (decision D-4), so orbiting moves to two fingers rather than the right
 * button, which touch does not have.
 *
 * Every row here has to be true of the running build: this list existing at all is only an
 * improvement if a user who follows it gets the result it promises.
 */
const TOUCH_GESTURES = [
    {
        label: "Rotate (once Rotate/Zoom is on)",
        keys: "one-finger drag",
        group: "touch",
        isGesture: true,
    },
    { label: "Zoom", keys: "pinch", group: "touch", isGesture: true },
    { label: "Pan", keys: "two-finger drag", group: "touch", isGesture: true },
    { label: "Select atom", keys: "tap", group: "touch", isGesture: true },
    { label: "Move atom / group", keys: "drag atom", group: "touch", isGesture: true },
    { label: "Orbit while editing", keys: "two fingers", group: "touch", isGesture: true },
];
/** Which touch gestures only mean something in edit mode. */
const EDIT_ONLY_TOUCH_LABELS = new Set(["Select atom", "Move atom / group", "Orbit while editing"]);
/** Configured single-character keys, in the order they should read, with their group. */
const HOTKEY_ROWS = [
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
const EDITOR_KEY_GROUPS = [
    { setting: "cancelOrDeselect", group: "edit" },
    { setting: "removeSelected", group: "edit" },
    { setting: "undo", group: "edit" },
    { setting: "redo", group: "edit" },
];
export const BINDING_GROUP_LABELS = {
    view: "View & camera",
    edit: "Select & edit",
    measure: "Measure",
    touch: "Touch",
};
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
export function getKeyBindings({ editable = true, includeTouch, } = {}) {
    const hotKeys = settings.hotKeysConfig;
    const editorKeys = settings.editorKeysConfig;
    const fromHotKeys = HOTKEY_ROWS.filter((row) => hotKeys[row.setting] && (editable || row.group !== "edit")).map((row) => ({
        label: row.label,
        keys: hotKeys[row.setting].length === 1
            ? hotKeys[row.setting].toUpperCase()
            : hotKeys[row.setting],
        group: row.group,
    }));
    const fromEditorKeys = editable
        ? EDITOR_KEY_GROUPS.filter((row) => editorKeys[row.setting]).map((row) => {
            const definition = editorKeys[row.setting];
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
    const showTouch = includeTouch !== null && includeTouch !== void 0 ? includeTouch : hasTouchSupport();
    const touchGestures = showTouch
        ? TOUCH_GESTURES.filter((gesture) => editable || !EDIT_ONLY_TOUCH_LABELS.has(gesture.label))
        : [];
    return [...fromHotKeys, ...fromEditorKeys, ...gestures, ...touchGestures];
}
/**
 * The same bindings bucketed by group, skipping groups that came out empty.
 *
 * `touchFirst` moves the touch group to the front. On a phone the sheet reflows to a single column,
 * so a group's position is how far the user has to scroll to reach it - and putting the gestures that
 * are the only way to drive that device below three groups of keyboard shortcuts buries the one
 * section they came for.
 */
export function getGroupedKeyBindings(options = {}) {
    const all = getKeyBindings(options);
    const order = options.touchFirst
        ? ["touch", "view", "edit", "measure"]
        : ["view", "edit", "measure", "touch"];
    return order
        .map((group) => ({
        group,
        label: BINDING_GROUP_LABELS[group],
        bindings: all.filter((binding) => binding.group === group),
    }))
        .filter((section) => section.bindings.length > 0);
}
