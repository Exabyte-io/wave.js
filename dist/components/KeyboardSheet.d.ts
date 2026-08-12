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
}
declare function KeyboardSheet(props: KeyboardSheetProps): import("react/jsx-runtime").JSX.Element;
export default KeyboardSheet;
