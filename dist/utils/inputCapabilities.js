/**
 * What kind of pointer is driving the viewer (U-13).
 *
 * `IconsToolbar` computed `isMobile` from `theme.breakpoints.down("sm")` and forwarded it to exactly
 * one dropdown; nothing else in the viewer adapted. That is the half-support the proposal called the
 * worst of the three options, and it asked the wrong question twice over: a narrow browser window on
 * a desktop is not touch input, and a 13-inch touch laptop is, at any width. What actually decides
 * whether a 32 px control is reachable, whether a hover tooltip can ever be seen, and whether "right
 * button" names anything real is the *pointer*, not the viewport.
 *
 * So capability queries, read at call time rather than at module load, because a window can move to
 * another display and a tablet can gain a keyboard mid-session.
 */
/** Devices whose primary pointer has coarse accuracy: fingers, and styluses without hover. */
export const COARSE_POINTER_QUERY = "(pointer: coarse)";
/** Devices that cannot hover, so anything living only in a tooltip is unreachable. */
export const NO_HOVER_QUERY = "(hover: none)";
/**
 * Minimum comfortable touch target. 44 px is the long-standing platform guidance (WCAG 2.2's
 * Target Size (Minimum) sets 24 px as the floor; 44 is what a finger actually wants).
 */
export const TOUCH_TARGET_MIN_PX = 44;
function matches(query) {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function")
        return false;
    try {
        return window.matchMedia(query).matches;
    }
    catch (error) {
        // jsdom and some embedded webviews implement matchMedia partially; an unsupported query
        // should read as "not coarse" rather than take the viewer down.
        return false;
    }
}
export function hasCoarsePointer() {
    return matches(COARSE_POINTER_QUERY);
}
export function hasNoHover() {
    return matches(NO_HOVER_QUERY);
}
/**
 * Whether the device can produce touch input at all - which is not the same question as whether the
 * *primary* pointer is coarse. A touch laptop reports a fine primary pointer and still needs the
 * touch gestures documented, so this is what gates the gesture list while `hasCoarsePointer` gates
 * sizing.
 */
export function hasTouchSupport() {
    if (typeof navigator !== "undefined" && typeof navigator.maxTouchPoints === "number") {
        return navigator.maxTouchPoints > 0;
    }
    if (typeof window !== "undefined" && "ontouchstart" in window)
        return true;
    return hasCoarsePointer();
}
/**
 * `sx` fragment enlarging a control to the touch minimum on coarse pointers only, so a mouse-driven
 * viewer keeps its compact chrome. Applied as a media query rather than a breakpoint for the reason
 * in the module comment.
 */
export const coarsePointerTargetSx = {
    [`@media ${COARSE_POINTER_QUERY}`]: {
        minWidth: `${TOUCH_TARGET_MIN_PX}px`,
        minHeight: `${TOUCH_TARGET_MIN_PX}px`,
    },
};
