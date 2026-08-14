import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";

import FigureExportDialog from "../../../src/components/FigureExportDialog";

Enzyme.configure({ adapter: new Adapter() });

const { mount } = Enzyme;

/**
 * Figure export dialog (U-12). The assertions worth having are about what the dialog *promises*: the
 * numbers it reports are the numbers it exports, the caveats appear when they apply, and nothing is
 * committed until Export is pressed.
 */
describe("FigureExportDialog", () => {
    const render = (props = {}) =>
        mount(
            <FigureExportDialog
                isOpen
                viewportWidth={800}
                viewportHeight={600}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />,
        );

    const summaryText = (wrapper) =>
        wrapper.find('[data-name="FigureResolutionSummary"]').at(0).text();

    const click = (wrapper, selector) => {
        wrapper.find(selector).at(0).simulate("click");
        wrapper.update();
    };

    it("renders nothing until opened", () => {
        // Asserted against the DOM: the Dialog *element* is in the React tree either way, so a
        // data-name selector alone would match a component that renders nothing.
        const wrapper = mount(<FigureExportDialog isOpen={false} />);
        expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
        expect(wrapper.find('button[data-name="FigureSize-custom"]').exists()).toBe(false);
    });

    it("offers every size preset and background", () => {
        const wrapper = render();
        ["viewport", "single-column", "double-column", "slide", "custom"].forEach((id) => {
            expect(wrapper.find(`button[data-name="FigureSize-${id}"]`).exists()).toBe(true);
        });
        ["viewer", "white", "transparent"].forEach((id) => {
            expect(wrapper.find(`input[data-name="FigureBackground-${id}"]`).exists()).toBe(true);
        });
    });

    it("defaults to a publication-ready choice rather than the current canvas", () => {
        // The dialog exists for the case a canvas screenshot cannot serve, so its defaults are that
        // case: a column width, a white page, a scale bar.
        const wrapper = render();
        expect(summaryText(wrapper)).toContain("180 × 135 mm");
        expect(wrapper.find('input[data-name="FigureBackground-white"]').prop("checked")).toBe(
            true,
        );
        expect(wrapper.find('input[data-name="FigureScaleBarToggle"]').prop("checked")).toBe(true);
    });

    it("states the size in pixels and millimetres, and updates when the preset changes", () => {
        const wrapper = render();
        click(wrapper, 'button[data-name="FigureSize-viewport"]');
        expect(summaryText(wrapper)).toContain("800 × 600 px");
        click(wrapper, 'button[data-name="FigureSize-single-column"]');
        expect(summaryText(wrapper)).toContain("1004 ×");
        expect(summaryText(wrapper)).toContain("85 × 64 mm at 300 dpi");
    });

    it("shows the pixel fields only for the custom preset", () => {
        const wrapper = render();
        expect(wrapper.find('input[data-name="FigureCustomWidth"]').exists()).toBe(false);
        click(wrapper, 'button[data-name="FigureSize-custom"]');
        expect(wrapper.find('input[data-name="FigureCustomWidth"]').exists()).toBe(true);
        expect(wrapper.find('input[data-name="FigureCustomHeight"]').exists()).toBe(true);
    });

    it("follows the typed custom size", () => {
        const wrapper = render();
        click(wrapper, 'button[data-name="FigureSize-custom"]');
        wrapper
            .find('input[data-name="FigureCustomWidth"]')
            .simulate("change", { target: { value: "2400" } });
        wrapper.update();
        expect(summaryText(wrapper)).toContain("2400 ×");
    });

    it("exports exactly the numbers it displayed", () => {
        const onExport = jest.fn();
        const wrapper = render({ onExport });
        click(wrapper, 'button[data-name="FigureSize-viewport"]');
        click(wrapper, 'button[data-name="FigureExportConfirm"]');
        expect(onExport).toHaveBeenCalledWith({
            width: 800,
            height: 600,
            background: "white",
            includeScaleBar: true,
        });
    });

    it("passes the chosen background through", () => {
        const onExport = jest.fn();
        const wrapper = render({ onExport });
        wrapper
            .find('input[data-name="FigureBackground-transparent"]')
            .simulate("change", { target: { value: "transparent" } });
        wrapper.update();
        click(wrapper, 'button[data-name="FigureExportConfirm"]');
        expect(onExport.mock.calls[0][0].background).toBe("transparent");
    });

    it("passes the scale bar choice through", () => {
        const onExport = jest.fn();
        const wrapper = render({ onExport });
        wrapper
            .find('input[data-name="FigureScaleBarToggle"]')
            .simulate("change", { target: { checked: false } });
        wrapper.update();
        click(wrapper, 'button[data-name="FigureExportConfirm"]');
        expect(onExport.mock.calls[0][0].includeScaleBar).toBe(false);
    });

    it("exports nothing on cancel", () => {
        const onExport = jest.fn();
        const onClose = jest.fn();
        const wrapper = render({ onExport, onClose });
        click(wrapper, 'button[data-name="FigureExportCancel"]');
        expect(onExport).not.toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it("closes itself after exporting, so the figure is visible immediately", () => {
        const onClose = jest.fn();
        const wrapper = render({ onExport: () => {}, onClose });
        click(wrapper, 'button[data-name="FigureExportConfirm"]');
        expect(onClose).toHaveBeenCalled();
    });

    it("warns that a perspective scale bar is not a single scale", () => {
        // The bar is exact only in the plane through the pivot, and a figure carrying a scale bar
        // that is quietly wrong elsewhere is worse than one with no bar at all.
        const perspective = render({ isCameraOrthographic: false });
        expect(
            perspective.find('[data-name="FigureScaleBarPerspectiveNotice"]').exists(),
        ).toBe(true);

        const orthographic = render({ isCameraOrthographic: true });
        expect(
            orthographic.find('[data-name="FigureScaleBarPerspectiveNotice"]').exists(),
        ).toBe(false);
    });

    it("drops the perspective caveat when no bar is requested", () => {
        const wrapper = render({ isCameraOrthographic: false });
        wrapper
            .find('input[data-name="FigureScaleBarToggle"]')
            .simulate("change", { target: { checked: false } });
        wrapper.update();
        expect(wrapper.find('[data-name="FigureScaleBarPerspectiveNotice"]').exists()).toBe(false);
    });

    it("says so when the request had to be scaled down to fit the GL limit", () => {
        const wrapper = render({ maxDimension: 1024 });
        expect(wrapper.find('[data-name="FigureClampedNotice"]').exists()).toBe(true);
        expect(summaryText(wrapper)).toContain("1024 ×");
    });

    it("keeps a size selected when the active preset is clicked again", () => {
        // ToggleButtonGroup reports null in that case; a null would leave no size at all.
        const wrapper = render();
        click(wrapper, 'button[data-name="FigureSize-double-column"]');
        click(wrapper, 'button[data-name="FigureSize-double-column"]');
        expect(summaryText(wrapper)).toContain("2126 ×");
    });

    it("survives an unmeasured canvas instead of reporting NaN", () => {
        const wrapper = render({ viewportWidth: 0, viewportHeight: 0 });
        expect(summaryText(wrapper)).not.toContain("NaN");
    });
});
