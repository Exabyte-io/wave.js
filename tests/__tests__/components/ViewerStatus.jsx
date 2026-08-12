import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";

import { ViewerErrorBoundary } from "../../../src/components/ViewerErrorBoundary";
import ViewerStatus from "../../../src/components/ViewerStatus";

Enzyme.configure({ adapter: new Adapter() });

const { mount } = Enzyme;

describe("ViewerStatus", () => {
    it("renders nothing while a structure is showing", () => {
        expect(mount(<ViewerStatus />).isEmptyRender()).toBe(true);
        expect(mount(<ViewerStatus kind={null} />).isEmptyRender()).toBe(true);
    });

    it("shows a spinner while building", () => {
        const wrapper = mount(<ViewerStatus kind="loading" />);
        expect(wrapper.find('[data-name="ViewerStatus-loading"]').exists()).toBe(true);
        expect(wrapper.text()).toContain("Building the structure");
    });

    it("explains an empty structure and points at the way out", () => {
        const wrapper = mount(<ViewerStatus kind="empty" />);
        expect(wrapper.text()).toContain("no atoms");
        expect(wrapper.text()).toContain("undo");
    });

    it("shows the failure reason verbatim, not just that it failed", () => {
        const wrapper = mount(<ViewerStatus kind="error" message="vertices[17] is undefined" />);
        expect(wrapper.find('[data-name="ViewerStatusMessage"]').first().text()).toBe(
            "vertices[17] is undefined",
        );
    });

    it("reassures that the structure survived the render failure", () => {
        expect(mount(<ViewerStatus kind="error" message="x" />).text()).toContain(
            "structure itself is unchanged",
        );
    });

    it("offers a retry only for an error, and only when one is wired", () => {
        let retried = 0;
        const wrapper = mount(
            <ViewerStatus
                kind="error"
                message="x"
                onRetry={() => {
                    retried += 1;
                }}
            />,
        );
        wrapper.find('button[data-name="ViewerStatusRetry"]').first().simulate("click");
        expect(retried).toBe(1);

        expect(
            mount(<ViewerStatus kind="error" message="x" />)
                .find('button[data-name="ViewerStatusRetry"]')
                .exists(),
        ).toBe(false);
        expect(
            mount(<ViewerStatus kind="empty" onRetry={() => {}} />)
                .find('button[data-name="ViewerStatusRetry"]')
                .exists(),
        ).toBe(false);
    });

    it("leaves the toolbars reachable for empty and error, and covers the canvas while loading", () => {
        const backgroundOf = (kind) =>
            mount(<ViewerStatus kind={kind} message="x" />)
                .find(`[data-name="ViewerStatus-${kind}"]`)
                .first()
                .prop("sx").backgroundColor;
        expect(backgroundOf("loading")).not.toBe("transparent");
        expect(backgroundOf("error")).toBe("transparent");
        expect(backgroundOf("empty")).toBe("transparent");
    });
});

/** A child that throws on demand, standing in for a scene build that fails. */
function Exploder({ shouldThrow }) {
    if (shouldThrow) throw new Error("vertices[17] is undefined");
    return <div className="ok">rendered</div>;
}

describe("ViewerErrorBoundary", () => {
    // React logs caught errors through console.error; silence it so a passing run stays readable.
    let consoleError;
    beforeEach(() => {
        consoleError = console.error;
        console.error = () => {};
    });
    afterEach(() => {
        console.error = consoleError;
    });

    it("passes children through when nothing throws", () => {
        const wrapper = mount(
            <ViewerErrorBoundary>
                <Exploder shouldThrow={false} />
            </ViewerErrorBoundary>,
        );
        expect(wrapper.find(".ok").exists()).toBe(true);
    });

    it("catches a throw, reports the error, and stops rendering the broken subtree", () => {
        const caught = [];
        const wrapper = mount(
            <ViewerErrorBoundary onError={(error) => caught.push(error.message)}>
                <Exploder shouldThrow />
            </ViewerErrorBoundary>,
        );
        expect(caught).toEqual(["vertices[17] is undefined"]);
        // Rendering it again would throw again, so the boundary renders nothing and the parent
        // owns the message.
        expect(wrapper.find(".ok").exists()).toBe(false);
    });

    it("remounts children when the parent bumps resetKey", () => {
        const wrapper = mount(
            <ViewerErrorBoundary resetKey={0}>
                <Exploder shouldThrow />
            </ViewerErrorBoundary>,
        );
        expect(wrapper.find(".ok").exists()).toBe(false);

        // The retry: the failure is cleared and a working child is mounted again.
        wrapper.setProps({ resetKey: 1, children: <Exploder shouldThrow={false} /> });
        wrapper.update();
        expect(wrapper.find(".ok").exists()).toBe(true);
    });

    it("stays failed across an unrelated re-render, so a retry has to be deliberate", () => {
        const wrapper = mount(
            <ViewerErrorBoundary resetKey={7}>
                <Exploder shouldThrow />
            </ViewerErrorBoundary>,
        );
        wrapper.setProps({ children: <Exploder shouldThrow={false} /> });
        wrapper.update();
        expect(wrapper.find(".ok").exists()).toBe(false);
    });
});
