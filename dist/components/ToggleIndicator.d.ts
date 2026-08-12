/**
 * The on/off state of a menu toggle, plus its hotkey.
 *
 * This replaces `getCheckmark`, which drew every inactive item as a *grey checkmark* (finding
 * F2). A grey ✓ reads as "checked but disabled", not "off" - the one shape that means "yes" was
 * carrying both answers, separated only by colour, which also made the state invisible to anyone
 * who cannot compare two greens.
 *
 * A switch has exactly one reading. It is drawn rather than built from MUI's `Switch` on purpose:
 * the menu row is already the control, and nesting a real form control inside it would put a
 * second focusable, separately-clickable target in the same row. This is decorative, with the
 * state exposed as text for screen readers instead.
 *
 * The hotkey moves out of the label into a fixed slot next to it (F3). Spelled inside the label,
 * some rows read "Bonds [B]" and others just "Axes", and nothing keeps that consistent.
 */
export interface ToggleIndicatorProps {
    isActive?: boolean;
    /** Single-character hotkey from `settings.hotKeysConfig`, if the item has one. */
    hotKey?: string;
}
declare function ToggleIndicator({ isActive, hotKey }: ToggleIndicatorProps): import("react/jsx-runtime").JSX.Element;
export default ToggleIndicator;
