/**
 * The keyboard sheet. Every row is generated from settings (hotKeysConfig and editorKeysConfig)
 * plus the pointer gestures, so rebinding a key updates the sheet with it - see
 * utils/keyBindings.ts for why that matters (finding F3, defect D2).
 */
export interface KeyboardSheetProps {
    isOpen?: boolean;
    onClose?: () => void;
    /** Mirrors ThreeDEditor's prop: without it the edit bindings do not exist to advertise. */
    editable?: boolean;
    /**
     * Whether to list the touch gestures (U-13). Defaults to whether the device can produce touch
     * input at all - see getKeyBindings - and is a prop so a test can assert both shapes.
     */
    includeTouch?: boolean;
    /**
     * Whether the primary pointer is coarse. Decides the group order (touch first where touch is how
     * the viewer is driven) and suppresses the key-based close hint. A prop so a test can assert both.
     */
    isCoarsePointer?: boolean;
}
declare function KeyboardSheet(props: KeyboardSheetProps): import("react/jsx-runtime").JSX.Element;
export default KeyboardSheet;
