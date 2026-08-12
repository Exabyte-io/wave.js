/**
 * A short past-tense description of a committed edit, with the undo binding appended when the edit
 * is something undo would reverse. Undo and redo themselves get no such suffix - telling someone
 * who just pressed undo that they can press undo is noise.
 */
export declare function describeEditCommit(source?: string | null): string | null;
/** How long a committed-edit hint stays on screen. */
export declare const EDIT_HINT_TIMEOUT_MS = 4000;
