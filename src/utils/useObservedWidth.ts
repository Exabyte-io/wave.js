import { useCallback, useEffect, useRef, useState } from "react";

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
export function useObservedWidth<T extends HTMLElement = HTMLDivElement>() {
    const [width, setWidth] = useState<number | null>(null);
    const observerRef = useRef<ResizeObserver | null>(null);

    /**
     * Zero is reported as "not measured", not as a width. An environment that does no layout at all -
     * jsdom, where every rect is zeroes - would otherwise look identical to the narrowest possible
     * container, and every consumer would silently render its most degraded form under test. A truly
     * zero-width container displays nothing either way, so nothing is lost by not distinguishing them.
     */
    const record = (value: number) => setWidth(value > 0 ? value : null);

    const ref = useCallback((node: T | null) => {
        observerRef.current?.disconnect();
        observerRef.current = null;
        if (!node) return;

        // Measure immediately as well as on change, so the first paint already has a real number
        // rather than one frame of the wrong layout.
        record(node.getBoundingClientRect().width);

        // Older embedded webviews have no ResizeObserver; the measurement above is better than none,
        // and better than throwing.
        if (typeof ResizeObserver !== "function") return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[entries.length - 1];
            // contentRect rather than borderBox: every consumer is deciding what fits *inside*.
            record(entry.contentRect.width);
        });
        observer.observe(node);
        observerRef.current = observer;
    }, []);

    useEffect(
        () => () => {
            observerRef.current?.disconnect();
            observerRef.current = null;
        },
        [],
    );

    return { ref, width };
}

export default useObservedWidth;
