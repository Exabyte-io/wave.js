/**
 * Pixel distance a pointer must travel before a press-and-move gesture commits to a drag
 * (atom drag or marquee rubber-band) instead of registering as a plain click on release.
 * Shared between InteractiveStructureEditorMixin (atom drag) and MarqueeSelectionMixin
 * (marquee activation), which otherwise have no dependency on each other.
 */
export const DRAG_THRESHOLD_PX = 5;
