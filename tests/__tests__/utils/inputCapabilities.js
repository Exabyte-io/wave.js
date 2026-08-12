import expect from "expect";

import {
    COARSE_POINTER_QUERY,
    hasCoarsePointer,
    hasNoHover,
    hasTouchSupport,
    NO_HOVER_QUERY,
    TOUCH_TARGET_MIN_PX,
} from "../../../src/utils/inputCapabilities";

/**
 * Input capability queries (U-13). These decide whether a control is reachable with a finger and
 * whether the viewer is allowed to say "right button", so the interesting cases are the hostile
 * environments: no matchMedia, a matchMedia that throws, and a device that reports touch without a
 * coarse primary pointer.
 */
describe("inputCapabilities", () => {
    const originalMatchMedia = window.matchMedia;
    const originalDescriptor = Object.getOwnPropertyDescriptor(navigator, "maxTouchPoints");

    const setMatchMedia = (implementation) => {
        Object.defineProperty(window, "matchMedia", {
            value: implementation,
            configurable: true,
            writable: true,
        });
    };

    const setMaxTouchPoints = (value) => {
        Object.defineProperty(navigator, "maxTouchPoints", { value, configurable: true });
    };

    afterEach(() => {
        setMatchMedia(originalMatchMedia);
        if (originalDescriptor) {
            Object.defineProperty(navigator, "maxTouchPoints", originalDescriptor);
        } else {
            delete navigator.maxTouchPoints;
        }
    });

    it("reports the queries the media layer reports", () => {
        setMatchMedia((query) => ({ matches: query === COARSE_POINTER_QUERY }));
        expect(hasCoarsePointer()).toBe(true);
        expect(hasNoHover()).toBe(false);

        setMatchMedia((query) => ({ matches: query === NO_HOVER_QUERY }));
        expect(hasCoarsePointer()).toBe(false);
        expect(hasNoHover()).toBe(true);
    });

    it("reads the media layer at call time, not at module load", () => {
        // A window can be dragged to a touchscreen and a tablet can gain a keyboard mid-session;
        // caching the answer at import would freeze the viewer's chrome to whatever was true first.
        setMatchMedia(() => ({ matches: false }));
        expect(hasCoarsePointer()).toBe(false);
        setMatchMedia(() => ({ matches: true }));
        expect(hasCoarsePointer()).toBe(true);
    });

    it("answers 'not coarse' where matchMedia is missing", () => {
        setMatchMedia(undefined);
        expect(hasCoarsePointer()).toBe(false);
        expect(hasNoHover()).toBe(false);
    });

    it("answers 'not coarse' rather than throwing when matchMedia rejects the query", () => {
        // Some embedded webviews implement matchMedia partially; the viewer must not go down over a
        // question about hit-target sizing.
        setMatchMedia(() => {
            throw new Error("unsupported media feature");
        });
        expect(hasCoarsePointer()).toBe(false);
    });

    describe("hasTouchSupport", () => {
        it("trusts maxTouchPoints when the browser reports it", () => {
            setMatchMedia(() => ({ matches: false }));
            setMaxTouchPoints(5);
            expect(hasTouchSupport()).toBe(true);
            setMaxTouchPoints(0);
            expect(hasTouchSupport()).toBe(false);
        });

        it("is true for a touch laptop, whose primary pointer is still fine", () => {
            // The distinction the module exists to make: this device needs the touch gestures
            // documented but should keep its compact, mouse-sized chrome.
            setMatchMedia(() => ({ matches: false }));
            setMaxTouchPoints(10);
            expect(hasTouchSupport()).toBe(true);
            expect(hasCoarsePointer()).toBe(false);
        });

        it("falls back to the coarse-pointer query when touch points are unreported", () => {
            delete navigator.maxTouchPoints;
            setMatchMedia((query) => ({ matches: query === COARSE_POINTER_QUERY }));
            expect(hasTouchSupport()).toBe(true);
        });
    });

    it("sets the touch target floor at the platform guidance figure", () => {
        expect(TOUCH_TARGET_MIN_PX).toBe(44);
    });
});
