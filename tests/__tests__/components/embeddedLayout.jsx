import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";

import { INSPECTOR_WIDTH, PILL_COMPACT_WIDTH_PX } from "../../../src/components/chromeLayout";
import ModePill from "../../../src/components/ModePill";

Enzyme.configure({ adapter: new Adapter() });

const { mount } = Enzyme;

/**
 * Degrading gracefully when the viewer is embedded.
 *
 * The viewer ships inside host applications, where its panel can be a few hundred pixels wide inside a
 * wide window. Measured at 520×900 the edit-mode pill was 520 px and overlapped the icon strip, the
 * selection inspector *and* the edit toolbar at once; at 700 and 900 it still overlapped the inspector.
 * Browser measurement is what found that and what proves it fixed - these tests pin the decisions
 * underneath, which jsdom can reach.
 */
describe("embedded layout", () => {
    /**
     * jsdom performs no layout, so ResizeObserver never fires and every rect is zero. The pill treats
     * an unmeasured container as "there is room", so this stubs the measurement to drive both sides.
     */
    const withObservedWidth = (width, render) => {
        const originalRect = Element.prototype.getBoundingClientRect;
        Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
            return { width, height: 34, top: 0, left: 0, right: width, bottom: 34, x: 0, y: 0 };
        };
        try {
            return render();
        } finally {
            Element.prototype.getBoundingClientRect = originalRect;
        }
    };

    const pillText = (wrapper) => wrapper.find('[data-name="ModePill-edit"]').first().text();

    it("keeps the bindings when the container has room", () => {
        const wrapper = withObservedWidth(PILL_COMPACT_WIDTH_PX + 40, () =>
            mount(<ModePill isEditModeActive />),
        );
        expect(pillText(wrapper)).toContain("drag = move");
        expect(wrapper.find('[data-name="ModePillContainer"]').first().prop("data-compact")).toBe(
            "false",
        );
    });

    it("drops the bindings, not the mode or the exit, when the container is tight", () => {
        let exited = 0;
        const wrapper = withObservedWidth(PILL_COMPACT_WIDTH_PX - 40, () =>
            mount(
                <ModePill
                    isEditModeActive
                    onExitEditMode={() => {
                        exited += 1;
                    }}
                />,
            ),
        );
        // What survives is what a user cannot recover without: which mode they are in, and the way
        // out. The bindings are a reminder, and the shortcuts sheet still lists them.
        expect(pillText(wrapper)).toContain("EDIT");
        expect(pillText(wrapper)).not.toContain("drag = move");
        // Asserted by using it, not by finding it: the exit still has to work in the compact form.
        wrapper.find('[data-name="ModePill-edit"] button').first().simulate("click");
        expect(exited).toBe(1);
    });

    it("treats an unmeasured container as roomy rather than as its narrowest form", () => {
        // Zero-everything rects are what a no-layout environment reports; degrading to the compact
        // pill there would make every other test assert the wrong rendering.
        const wrapper = mount(<ModePill isEditModeActive />);
        expect(wrapper.find('[data-name="ModePillContainer"]').first().prop("data-compact")).toBe(
            "false",
        );
        expect(pillText(wrapper)).toContain("drag = move");
    });

    it("moves to the left edge when compact, leaving the top-right to the inspector", () => {
        const roomy = withObservedWidth(PILL_COMPACT_WIDTH_PX + 40, () =>
            mount(<ModePill isEditModeActive />),
        );
        const tight = withObservedWidth(PILL_COMPACT_WIDTH_PX - 40, () =>
            mount(<ModePill isEditModeActive />),
        );
        expect(roomy.find('[data-name="ModePillContainer"]').first().prop("alignItems")).toBe(
            "center",
        );
        expect(tight.find('[data-name="ModePillContainer"]').first().prop("alignItems")).toBe(
            "flex-start",
        );
    });

    it("reserves the inspector's width on the right only while editing", () => {
        // A measurement pill has the top-right corner to itself, so insetting for the inspector there
        // would shrink the space it is measuring for no reason.
        const editing = mount(<ModePill isEditModeActive />)
            .find('[data-name="ModePillContainer"]')
            .first()
            .prop("sx");
        const measuring = mount(
            <ModePill
                activeMeasurement={{ isActive: true, measurementType: "distance", values: [] }}
            />,
        )
            .find('[data-name="ModePillContainer"]')
            .first()
            .prop("sx");
        expect(String(editing.right)).toContain(INSPECTOR_WIDTH);
        expect(String(measuring.right)).not.toContain(INSPECTOR_WIDTH);
    });

    it("never spans the full width, so it cannot sit under the edge chrome", () => {
        const sx = mount(<ModePill isEditModeActive />)
            .find('[data-name="ModePillContainer"]')
            .first()
            .prop("sx");
        // left: 0 / right: 0 is what let the pill run under the icon strip and the edit toolbar.
        expect(sx.left).not.toBe(0);
        expect(sx.right).not.toBe(0);
    });
});
