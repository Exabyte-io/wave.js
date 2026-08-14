import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";

import QuickToggles from "../../../src/components/QuickToggles";

Enzyme.configure({ adapter: new Adapter() });

const { mount } = Enzyme;

const item = (overrides = {}) => ({
    id: "bonds",
    title: "Bonds",
    hotKey: "b",
    isActive: false,
    icon: <span className="icon" />,
    onToggle: () => {},
    ...overrides,
});

describe("QuickToggles", () => {
    it("renders nothing when given no items", () => {
        expect(mount(<QuickToggles />).isEmptyRender()).toBe(true);
        expect(mount(<QuickToggles items={[]} />).isEmptyRender()).toBe(true);
    });

    it("renders one control per item", () => {
        const wrapper = mount(
            <QuickToggles items={[item(), item({ id: "axes", title: "Axes", hotKey: undefined })]} />,
        );
        expect(wrapper.find('[data-name="QuickToggle-bonds"]').exists()).toBe(true);
        expect(wrapper.find('[data-name="QuickToggle-axes"]').exists()).toBe(true);
    });

    it("reports on/off state to assistive tech, not only in colour", () => {
        const on = mount(<QuickToggles items={[item({ isActive: true })]} />);
        const off = mount(<QuickToggles items={[item({ isActive: false })]} />);
        expect(on.find('button[data-name="QuickToggle-bonds"]').prop("aria-pressed")).toBe(true);
        expect(off.find('button[data-name="QuickToggle-bonds"]').prop("aria-pressed")).toBe(false);
    });

    it("marks the active state on the element, so it is assertable and inspectable", () => {
        const wrapper = mount(<QuickToggles items={[item({ isActive: true })]} />);
        expect(wrapper.find('button[data-name="QuickToggle-bonds"]').prop("data-active")).toBe(
            "true",
        );
    });

    it("calls back on click", () => {
        let toggled = 0;
        const wrapper = mount(
            <QuickToggles
                items={[
                    item({
                        onToggle: () => {
                            toggled += 1;
                        },
                    }),
                ]}
            />,
        );
        wrapper.find('button[data-name="QuickToggle-bonds"]').simulate("click");
        expect(toggled).toBe(1);
    });

    it("appends the hotkey to the tooltip, and omits it when there is none", () => {
        const titles = mount(
            <QuickToggles
                items={[item(), item({ id: "axes", title: "Axes", hotKey: undefined })]}
            />,
        )
            .find("ForwardRef(Tooltip)")
            .map((node) => node.prop("title"));
        expect(titles).toContain("Bonds [B]");
        expect(titles).toContain("Axes");
    });

    it("labels each control, since the face of it is only an icon", () => {
        const wrapper = mount(<QuickToggles items={[item()]} />);
        expect(wrapper.find('button[data-name="QuickToggle-bonds"]').prop("aria-label")).toBe(
            "Bonds",
        );
    });

    it("sits clear of the status bar", () => {
        const sx = mount(<QuickToggles items={[item()]} />)
            .find('[data-name="QuickToggles"]')
            .first()
            .prop("sx");
        // The status bar is ~34px tall and pinned to bottom: 0.
        expect(sx.bottom).toBe("3em");
        // The row itself must not swallow canvas clicks; only the buttons opt back in.
        expect(sx.pointerEvents).toBe("none");
    });
});
