import React from "react";
/**
 * The handful of view toggles worth reaching in one click.
 *
 * Bonds, labels, axes and the camera projection all live inside the View dropdown, which closes on
 * every choice - so flipping bonds while comparing two structures is a four-click round trip
 * through a menu that shuts behind you. These are the items people toggle repeatedly rather than
 * set once, promoted out of the menu (U-7). The menu keeps them too; this is a shortcut, not a
 * move, so nothing a user already knows stops working.
 *
 * Active state is a filled button, which is the same correction U-4 made in the menu: the previous
 * rendering used one shape - a checkmark - for both on and off, separated only by colour.
 */
export interface QuickToggleItem {
    id: string;
    /** Tooltip text; the hotkey is appended when there is one. */
    title: string;
    hotKey?: string;
    isActive?: boolean;
    icon: React.ReactNode;
    onToggle: () => void;
}
export interface QuickTogglesProps {
    items?: QuickToggleItem[];
}
declare function QuickToggles({ items }: QuickTogglesProps): import("react/jsx-runtime").JSX.Element | null;
export default QuickToggles;
