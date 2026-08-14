import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";

import ModePill from "../../../src/components/ModePill";
import SquareIconButton from "../../../src/components/SquareIconButton";

Enzyme.configure({ adapter: new Adapter() });

const { mount } = Enzyme;

/**
 * Focus visibility (U-11, finding F9). `disableFocusRipple` removed MUI's only focus affordance and
 * nothing replaced it, so on the running app a keyboard-focused toolbar button measured
 * `outline: none`, `box-shadow: none` and a transparent background - focus was invisible.
 *
 * jsdom applies no stylesheets, so these assert the style is *declared* on the button. The visual
 * result was measured in a real browser instead: outline goes from `none`/0px to `solid`/2px in the
 * theme's primary colour.
 */

/** The sx entry that carries the focus ring, whether sx is an object or an array. */
const focusRuleOf = (sx) => {
    const entries = Array.isArray(sx) ? sx : [sx];
    return entries.find((entry) => entry && entry["&:focus-visible"])?.["&:focus-visible"];
};

describe("SquareIconButton focus ring", () => {
    // MUI wraps its components, so their enzyme display names are not "IconButton"; find the
    // node by a prop only SquareIconButton's IconButton carries.
    const iconButtonSx = (element) =>
        mount(element)
            .findWhere((node) => node.prop("disableFocusRipple") === true)
            .first()
            .prop("sx");

    it("declares a focus-visible outline", () => {
        const rule = focusRuleOf(
            iconButtonSx(
                <SquareIconButton title="Bonds" onClick={() => {}}>
                    <span />
                </SquareIconButton>,
            ),
        );
        expect(rule).toBeDefined();
        expect(rule.outline).toBeDefined();
    });

    it("uses focus-visible, not focus, so a mouse click leaves no ring behind", () => {
        const sx = iconButtonSx(
            <SquareIconButton title="Bonds" onClick={() => {}}>
                <span />
            </SquareIconButton>,
        );
        const entries = Array.isArray(sx) ? sx : [sx];
        expect(entries.some((entry) => entry && entry["&:focus"])).toBe(false);
    });

    it("merges a caller's sx on top instead of being replaced by it", () => {
        // The spread used to come after sx, so passing sx silently dropped borderRadius - and now
        // would drop the focus ring with it.
        const sx = iconButtonSx(
            <SquareIconButton title="Bonds" onClick={() => {}} sx={{ opacity: 0.5 }}>
                <span />
            </SquareIconButton>,
        );
        const entries = Array.isArray(sx) ? sx : [sx];
        expect(focusRuleOf(sx)).toBeDefined();
        expect(entries.some((entry) => entry && entry.borderRadius === 0)).toBe(true);
        expect(entries.some((entry) => entry && entry.opacity === 0.5)).toBe(true);
    });

    it("keeps the square corners it always had", () => {
        const sx = iconButtonSx(
            <SquareIconButton title="Bonds" onClick={() => {}}>
                <span />
            </SquareIconButton>,
        );
        const entries = Array.isArray(sx) ? sx : [sx];
        expect(entries.some((entry) => entry && entry.borderRadius === 0)).toBe(true);
    });
});

describe("ModePill exit button focus ring", () => {
    it("declares its own ring, being a bare IconButton rather than a SquareIconButton", () => {
        const wrapper = mount(<ModePill isEditModeActive onExitEditMode={() => {}} />);
        const exitButton = wrapper
            .findWhere((node) => node.prop("aria-label") === "Exit edit mode" && node.prop("sx"))
            .first();
        const rule = focusRuleOf(exitButton.prop("sx"));
        expect(rule).toBeDefined();
        expect(rule.outline).toBeDefined();
    });

    it("labels the exit control for screen readers", () => {
        const wrapper = mount(<ModePill isEditModeActive onExitEditMode={() => {}} />);
        expect(
            wrapper.findWhere((node) => node.prop("aria-label") === "Exit edit mode").length,
        ).toBeGreaterThan(0);
    });
});
