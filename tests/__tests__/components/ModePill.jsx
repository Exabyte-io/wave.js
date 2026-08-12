import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";

import ModePill, { getEditModeBindings } from "../../../src/components/ModePill";
import { MEASUREMENT_MODES } from "../../../src/enums";
import settings from "../../../src/settings";
import {
    formatMeasurementValue,
    getMeasurementHint,
    getMeasurementLabel,
    getMeasurementProgress,
} from "../../../src/utils/measurementReadout";

Enzyme.configure({ adapter: new Adapter() });

const { mount } = Enzyme;

const distanceMode = (overrides = {}) => ({
    isActive: true,
    measurementType: MEASUREMENT_MODES.DISTANCE,
    values: [],
    selectedAtomsCount: 0,
    atomsPerMeasurement: 2,
    ...overrides,
});

const angleMode = (overrides = {}) => ({
    isActive: true,
    measurementType: MEASUREMENT_MODES.ANGLE,
    values: [],
    selectedAtomsCount: 0,
    atomsPerMeasurement: 3,
    ...overrides,
});

describe("getMeasurementProgress", () => {
    it("reports nothing outstanding before the first pick", () => {
        expect(getMeasurementProgress(distanceMode())).toEqual({
            picked: 0,
            needed: 2,
            isPartial: false,
        });
    });

    it("reports a half-specified distance", () => {
        expect(getMeasurementProgress(distanceMode({ selectedAtomsCount: 1 }))).toEqual({
            picked: 1,
            needed: 2,
            isPartial: true,
        });
    });

    it("clears once the pair completes", () => {
        expect(getMeasurementProgress(distanceMode({ selectedAtomsCount: 2 })).isPartial).toBe(
            false,
        );
    });

    it("counts the remainder, not the total - picks accumulate across measurements", () => {
        // Five picks in distance mode is two finished pairs plus one atom awaiting a partner.
        expect(getMeasurementProgress(distanceMode({ selectedAtomsCount: 5 })).picked).toBe(1);
        // Five picks in angle mode is one finished triplet plus two toward the next.
        expect(getMeasurementProgress(angleMode({ selectedAtomsCount: 5 })).picked).toBe(2);
    });

    it("never reports a partial for a single-pick mode", () => {
        const coordinate = {
            isActive: true,
            measurementType: MEASUREMENT_MODES.COORDINATE,
            values: [],
            selectedAtomsCount: 3,
            atomsPerMeasurement: 1,
        };
        expect(getMeasurementProgress(coordinate).isPartial).toBe(false);
    });

    it("falls back to one pick when arity is missing, rather than dividing by zero", () => {
        expect(getMeasurementProgress(null)).toEqual({ picked: 0, needed: 1, isPartial: false });
        expect(getMeasurementProgress({ atomsPerMeasurement: 0 }).needed).toBe(1);
    });
});

describe("formatMeasurementValue", () => {
    it("formats the latest distance in Angstrom", () => {
        expect(formatMeasurementValue(distanceMode({ values: [1.5, 2.3514] }))).toBe("d = 2.351 Å");
    });

    it("formats the latest angle in degrees", () => {
        expect(formatMeasurementValue(angleMode({ values: [109.47] }))).toBe("109.470°");
    });

    it("formats a coordinate as a tuple", () => {
        const coordinate = {
            isActive: true,
            measurementType: MEASUREMENT_MODES.COORDINATE,
            values: [[0.25, 0.25, 0.125]],
        };
        expect(formatMeasurementValue(coordinate)).toBe("(0.250, 0.250, 0.125)");
    });

    it("returns null rather than a broken string when there is nothing to show", () => {
        expect(formatMeasurementValue(null)).toBe(null);
        expect(formatMeasurementValue(distanceMode())).toBe(null);
        expect(formatMeasurementValue(distanceMode({ values: [NaN] }))).toBe(null);
        expect(formatMeasurementValue({ ...distanceMode(), values: "nope" })).toBe(null);
    });
});

describe("getMeasurementLabel and getMeasurementHint", () => {
    it("names each mode", () => {
        expect(getMeasurementLabel(MEASUREMENT_MODES.DISTANCE)).toBe("Distance");
        expect(getMeasurementLabel(MEASUREMENT_MODES.ANGLE)).toBe("Angle");
        expect(getMeasurementLabel(MEASUREMENT_MODES.COORDINATE)).toBe("Coordinates");
        expect(getMeasurementLabel(MEASUREMENT_MODES.NONE)).toBe("");
        expect(getMeasurementLabel(undefined)).toBe("");
    });

    it("states the pick count and the clipboard side effect", () => {
        expect(getMeasurementHint(distanceMode())).toBe(
            "click two atoms · result copied to the clipboard",
        );
        expect(getMeasurementHint(angleMode())).toContain("three atoms");
        expect(getMeasurementHint(null)).toBe("");
    });

    it("warns about the clipboard for coordinate mode, which copies on every click", () => {
        const coordinate = {
            isActive: true,
            measurementType: MEASUREMENT_MODES.COORDINATE,
            values: [],
            atomsPerMeasurement: 1,
        };
        expect(getMeasurementHint(coordinate)).toContain("clipboard");
    });
});

describe("getEditModeBindings", () => {
    it("states the right-button orbit remap once orbit is on - it appears in no tooltip or menu", () => {
        expect(getEditModeBindings({ isOrbitEnabled: true }).join(" ")).toContain("RMB = orbit");
    });

    it("points at the enabling key instead while orbit is off", () => {
        // Orbit controls start disabled (initOrbitControls(enabled = false)), so naming the right
        // button then would advertise a gesture that does nothing.
        const text = getEditModeBindings({ isOrbitEnabled: false }).join(" ");
        expect(text).not.toContain("RMB = orbit");
        expect(text).toContain(
            `${settings.hotKeysConfig.toggleOrbitControls.toUpperCase()} = enable orbit`,
        );
    });

    it("defaults to treating orbit as off", () => {
        expect(getEditModeBindings().join(" ")).not.toContain("RMB = orbit");
    });

    it("takes the focus key from settings rather than hardcoding it", () => {
        const expected = settings.hotKeysConfig.focusCameraOnSelection.toUpperCase();
        expect(getEditModeBindings().join(" ")).toContain(`${expected} = focus`);
    });
});

describe("ModePill", () => {
    it("renders nothing when no mode is active - absence is the signal for view mode", () => {
        expect(mount(<ModePill />).isEmptyRender()).toBe(true);
        expect(
            mount(<ModePill activeMeasurement={distanceMode({ isActive: false })} />).html(),
        ).toBe(null);
    });

    it("names edit mode and its bindings", () => {
        const wrapper = mount(<ModePill isEditModeActive isOrbitEnabled />);
        expect(wrapper.find('[data-name="ModePill-edit"]').exists()).toBe(true);
        expect(wrapper.text()).toContain("EDIT");
        expect(wrapper.text()).toContain("RMB = orbit");
    });

    it("exits edit mode from the pill", () => {
        let exited = 0;
        const wrapper = mount(
            <ModePill
                isEditModeActive
                onExitEditMode={() => {
                    exited += 1;
                }}
            />,
        );
        wrapper.find('[data-name="ModePill-edit"] button').first().simulate("click");
        expect(exited).toBe(1);
    });

    it("names the armed measurement mode", () => {
        const wrapper = mount(<ModePill activeMeasurement={distanceMode()} />);
        expect(wrapper.find('[data-name="ModePill-distance"]').exists()).toBe(true);
        expect(wrapper.text()).toContain("DISTANCE");
        expect(wrapper.text()).toContain("click two atoms");
    });

    it("shows pick progress only while a measurement is half-specified", () => {
        const partial = mount(
            <ModePill activeMeasurement={distanceMode({ selectedAtomsCount: 1 })} />,
        );
        expect(partial.find('[data-name="ModePillProgress"]').exists()).toBe(true);
        expect(partial.text()).toContain("1 of 2 picked");

        const complete = mount(
            <ModePill activeMeasurement={distanceMode({ selectedAtomsCount: 2 })} />,
        );
        expect(complete.find('[data-name="ModePillProgress"]').exists()).toBe(false);
    });

    it("shows the latest measured value", () => {
        const wrapper = mount(
            <ModePill
                activeMeasurement={distanceMode({ values: [2.3514], selectedAtomsCount: 2 })}
            />,
        );
        expect(wrapper.text()).toContain("d = 2.351 Å");
    });

    it("exits a measurement mode by its own type", () => {
        const exited = [];
        const wrapper = mount(
            <ModePill
                activeMeasurement={angleMode()}
                onExitMeasurement={(type) => exited.push(type)}
            />,
        );
        wrapper.find('[data-name="ModePill-angle"] button').first().simulate("click");
        expect(exited).toEqual([MEASUREMENT_MODES.ANGLE]);
    });
});
