/**
 * Observes an element's own width.
 *
 * The viewer is embedded in host applications, where the panel it lives in can be narrow inside a
 * perfectly wide window - so `useMediaQuery` and `theme.breakpoints` are the wrong instrument for
 * "is there room for this". They answer a question about the *window*, which is the same category of
 * mistake as the viewport-width `isMobile` that U-13 removed. A ResizeObserver on the element is a
 * real container query: it reports the space the component actually has.
 *
 * Returns null until the first measurement, so a caller can tell "not measured yet" from "zero
 * wide" and avoid deciding a layout on a number it does not have.
 *
 * `ref` is deliberately a **callback ref**, not a `useRef` object. Consumers here render nothing at
 * all much of the time - the mode pill returns null until a mode is armed - and with an object ref
 * plus a mount-time effect the observer attaches on the render where the node does not exist yet and
 * never re-attaches when it appears. A callback ref fires on every attach and detach.
 */
export declare function useObservedWidth<T extends HTMLElement = HTMLDivElement>(): {
    ref: (node: T | null) => void;
    width: number | null;
};
export default useObservedWidth;
