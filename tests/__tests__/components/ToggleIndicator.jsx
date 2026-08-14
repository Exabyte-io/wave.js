import { Made } from "@mat3ra/made";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";

import { ThreeDEditor } from "../../../src/components/ThreeDEditor";
import ToggleIndicator from "../../../src/components/ToggleIndicator";
import settings from "../../../src/settings";
import { createElement } from "../../utils";
import { ELEMENT_PROPERTIES, MATERIAL_CONFIG } from "../../enums";
import { SELECTORS } from "../../selectors";

Enzyme.configure({ adapter: new Adapter() });

const { mount } = Enzyme;

describe("ToggleIndicator", () => {
    it("distinguishes on from off by state, not only by colour", () => {
        // The defect this replaces used one shape - a checkmark - for both answers, separated
        // only by how grey it was.
        const on = mount(<ToggleIndicator isActive />);
        const off = mount(<ToggleIndicator isActive={false} />);
        expect(on.find('[data-name="ToggleIndicator"]').first().prop("data-active")).toBe("true");
        expect(off.find('[data-name="ToggleIndicator"]').first().prop("data-active")).toBe("false");
    });

    it("states on/off in text, so the state is not carried by pixels alone", () => {
        expect(mount(<ToggleIndicator isActive />).text()).toContain("on");
        expect(mount(<ToggleIndicator isActive={false} />).text()).toContain("off");
    });

    it("defaults to off", () => {
        expect(mount(<ToggleIndicator />).find('[data-name="ToggleIndicator"]').first().prop("data-active")).toBe("false");
    });

    it("renders a keycap for the hotkey, upper-cased", () => {
        const wrapper = mount(<ToggleIndicator hotKey="b" />);
        const keycap = wrapper.find('[data-name="ToggleIndicatorKey"]').first();
        expect(keycap.exists()).toBe(true);
        expect(keycap.text()).toBe("B");
    });

    it("reserves the keycap slot for an item with no hotkey, rather than collapsing it", () => {
        // Omitting it let each row size itself, so the switches landed at different offsets down the
        // View menu - a column of toggles that does not line up reads as a rendering fault. The slot
        // stays, empty and hidden, so every switch is the same distance from the right edge.
        const wrapper = mount(<ToggleIndicator />);
        const slot = wrapper.find('kbd[data-name="ToggleIndicatorKey"]').first();
        expect(slot.exists()).toBe(true);
        expect(slot.text()).toBe("");
        expect(slot.prop("aria-hidden")).toBe(true);
    });

    it("gives the keycap slot the same width with and without a hotkey", () => {
        const withKey = mount(<ToggleIndicator hotKey="b" />)
            .find('kbd[data-name="ToggleIndicatorKey"]')
            .first();
        const withoutKey = mount(<ToggleIndicator />)
            .find('kbd[data-name="ToggleIndicatorKey"]')
            .first();
        // Same declared width is what keeps the switch column aligned; jsdom does no layout, so the
        // style is the assertable form of it.
        expect(window.getComputedStyle(withoutKey.getDOMNode()).width).toBe(
            window.getComputedStyle(withKey.getDOMNode()).width,
        );
        expect(window.getComputedStyle(withoutKey.getDOMNode()).visibility).toBe("hidden");
        expect(window.getComputedStyle(withKey.getDOMNode()).visibility).toBe("visible");
    });

    it("keeps the switch out of the accessibility tree - the menu row is the control", () => {
        const wrapper = mount(<ToggleIndicator isActive />);
        expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true);
    });
});

describe("View menu toggles", () => {
    const openViewMenu = () => {
        const container = createElement("div", ELEMENT_PROPERTIES);
        const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} />, {
            attachTo: container,
        });
        wrapper.find(`${SELECTORS.interactiveIconToolbar} button`).prop("onClick")();
        wrapper.update();
        wrapper.find(`${SELECTORS.viewIconToolbar} button`).simulate("click");
        wrapper.update();
        return wrapper;
    };

    it("renders a toggle indicator per view toggle rather than a checkmark", () => {
        const wrapper = openViewMenu();
        expect(wrapper.find(ToggleIndicator).length).toBeGreaterThan(0);
    });

    it("advertises the bonds hotkey in the indicator slot, not inside the label", () => {
        const wrapper = openViewMenu();
        const bondsKey = settings.hotKeysConfig.toggleBonds.toUpperCase();
        const keycaps = wrapper
            .find('[data-name="ToggleIndicatorKey"]')
            .map((node) => node.text());
        expect(keycaps).toContain(bondsKey);
        // The label itself no longer carries a bracketed key.
        expect(wrapper.text()).not.toContain(`[${bondsKey}]`);
    });
});
