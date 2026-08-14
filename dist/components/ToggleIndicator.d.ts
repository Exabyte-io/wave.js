export interface ToggleIndicatorProps {
    isActive?: boolean;
    /** Single-character hotkey from `settings.hotKeysConfig`, if the item has one. */
    hotKey?: string;
}
declare function ToggleIndicator({ isActive, hotKey }: ToggleIndicatorProps): import("react/jsx-runtime").JSX.Element;
export default ToggleIndicator;
