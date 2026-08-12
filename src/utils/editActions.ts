import settings from "../settings";
import { EditorKeyDefinition, formatEditorKey } from "./keyBindings";

/**
 * Turns `onEditCommit`'s `{source}` into something a person can read, so the viewer can say what
 * it just did and how to take it back.
 *
 * The enum already exists and is already reported per commit (spec §6.2), so this needs no new
 * plumbing - it was simply never surfaced anywhere. Undo was doubly hidden: its buttons rendered
 * only inside the edit panel and its hotkey was gated on edit mode, so leaving edit mode made a
 * surviving history unreachable (finding F6).
 */

/** `source` values `onEditCommit` reports. */
const SOURCE_PHRASES: Record<string, string> = {
    drag: "Moved atom",
    gizmo: "Moved atom",
    "coordinate-input": "Set coordinate",
    "element-input": "Changed element",
    add: "Added atom",
    remove: "Removed atom",
    clone: "Cloned atoms",
    undo: "Undone",
    redo: "Redone",
};

/**
 * A short past-tense description of a committed edit, with the undo binding appended when the edit
 * is something undo would reverse. Undo and redo themselves get no such suffix - telling someone
 * who just pressed undo that they can press undo is noise.
 */
export function describeEditCommit(source?: string | null): string | null {
    if (!source) return null;
    const phrase = SOURCE_PHRASES[source];
    if (!phrase) return null;
    if (source === "undo" || source === "redo") return phrase;
    const undoBinding = (settings.editorKeysConfig as Record<string, EditorKeyDefinition>)?.undo;
    return undoBinding ? `${phrase} · ${formatEditorKey(undoBinding)} to undo` : phrase;
}

/** How long a committed-edit hint stays on screen. */
export const EDIT_HINT_TIMEOUT_MS = 4000;
