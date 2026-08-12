import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";

import ParametersMenu, {
    getDrawnAtomCount,
    getParameterDefaults,
    PARAMETER_RANGES,
} from "../../../src/components/ParametersMenu";
import settings from "../../../src/settings";

Enzyme.configure({ adapter: new Adapter() });

const { mount } = Enzyme;

const viewerSettings = (overrides = {}) => ({
    isViewAdjustable: true,
    atomRadiiScale: 0.2,
    repetitionsAlongLatticeVectorA: 1,
    repetitionsAlongLatticeVectorB: 1,
    repetitionsAlongLatticeVectorC: 1,
    chemicalConnectivityFactor: 1.05,
    ...overrides,
});

/** Mounts the menu and records every settings patch it emits. */
const mountMenu = (overrides = {}, extraProps = {}) => {
    const changes = [];
    const wrapper = mount(
        <ParametersMenu
            viewerSettings={viewerSettings(overrides)}
            onSettingChange={(patch) => changes.push(patch)}
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...extraProps}
        />,
    );
    return { wrapper, changes };
};

describe("getParameterDefaults", () => {
    it("takes defaults from settings, so reset cannot drift from the viewer's own start state", () => {
        const defaults = getParameterDefaults();
        expect(defaults.atomRadiiScale).toBe(settings.atomRadiiScale);
        expect(defaults.chemicalConnectivityFactor).toBe(settings.chemicalConnectivityFactor);
        expect(defaults.repetitionsAlongLatticeVectorA).toBe(settings.repetitions);
    });
});

describe("getDrawnAtomCount", () => {
    it("multiplies the repetitions by the atoms in the cell", () => {
        expect(
            getDrawnAtomCount(
                {
                    repetitionsAlongLatticeVectorA: 4,
                    repetitionsAlongLatticeVectorB: 4,
                    repetitionsAlongLatticeVectorC: 4,
                },
                24,
            ),
        ).toBe(1536);
    });

    it("treats a missing repetition as one rather than collapsing the count to zero", () => {
        expect(getDrawnAtomCount({ repetitionsAlongLatticeVectorA: 2 }, 10)).toBe(20);
    });

    it("is zero when the cell's atom count is unknown", () => {
        expect(getDrawnAtomCount({ repetitionsAlongLatticeVectorA: 3 })).toBe(0);
    });
});

describe("ParametersMenu", () => {
    it("gives radius and bond cutoff a slider, with its range stated somewhere visible", () => {
        const { wrapper } = mountMenu();
        const slider = wrapper.find('[data-name="ParameterSlider-atomRadiiScale"]').first();
        expect(slider.prop("min")).toBe(PARAMETER_RANGES.atomRadiiScale.min);
        expect(slider.prop("max")).toBe(PARAMETER_RANGES.atomRadiiScale.max);
        // The range has to be visible somewhere, since inputProps is invisible.
        expect(wrapper.find('[data-name="Parameter-atomRadiiScale"]').first().text()).toContain(
            "0.1–10",
        );
        expect(
            wrapper.find('[data-name="ParameterSlider-chemicalConnectivityFactor"]').exists(),
        ).toBe(true);
    });

    it("reports a slider move as a settings patch", () => {
        const { wrapper, changes } = mountMenu();
        wrapper.find('[data-name="ParameterSlider-atomRadiiScale"]').first().prop("onChange")(
            {},
            0.6,
        );
        expect(changes).toEqual([{ atomRadiiScale: 0.6 }]);
    });

    it("clamps a typed value into range instead of accepting nonsense", () => {
        const { wrapper, changes } = mountMenu();
        const field = wrapper
            .findWhere((n) => n.prop("id") === "atomRadiiScale" && n.prop("onChange"))
            .first();
        field.prop("onChange")({ target: { value: "999" } });
        field.prop("onChange")({ target: { value: "-5" } });
        field.prop("onChange")({ target: { value: "abc" } });
        expect(changes).toEqual([
            { atomRadiiScale: 10 },
            { atomRadiiScale: 0.1 },
            { atomRadiiScale: 0.1 },
        ]);
    });

    it("changes all three repetitions together while linked", () => {
        const { wrapper, changes } = mountMenu();
        const fieldA = wrapper
            .findWhere(
                (n) => n.prop("id") === "repetitionsAlongLatticeVectorA" && n.prop("onChange"),
            )
            .first();
        fieldA.prop("onChange")({ target: { value: "3" } });
        expect(changes).toEqual([
            {
                repetitionsAlongLatticeVectorA: 3,
                repetitionsAlongLatticeVectorB: 3,
                repetitionsAlongLatticeVectorC: 3,
            },
        ]);
    });

    it("changes one repetition at a time once unlinked", () => {
        const { wrapper, changes } = mountMenu();
        wrapper.find('button[data-name="RepetitionLink"]').simulate("click");
        wrapper.update();
        expect(wrapper.find('button[data-name="RepetitionLink"]').prop("data-active")).toBe(
            "false",
        );
        wrapper
            .findWhere(
                (n) => n.prop("id") === "repetitionsAlongLatticeVectorB" && n.prop("onChange"),
            )
            .first()
            .prop("onChange")({ target: { value: "2" } });
        expect(changes).toEqual([{ repetitionsAlongLatticeVectorB: 2 }]);
    });

    it("reports the link state to assistive tech", () => {
        const { wrapper } = mountMenu();
        expect(wrapper.find('button[data-name="RepetitionLink"]').prop("aria-pressed")).toBe(true);
    });

    it("says what a repetition will cost, given the cell's atom count", () => {
        const { wrapper } = mountMenu(
            {
                repetitionsAlongLatticeVectorA: 2,
                repetitionsAlongLatticeVectorB: 2,
                repetitionsAlongLatticeVectorC: 2,
            },
            { atomCountInCell: 24 },
        );
        const cost = wrapper.find('[data-name="RepetitionCost"]');
        expect(cost.exists()).toBe(true);
        expect(cost.first().text()).toContain("192 atoms drawn");
        expect(cost.first().text()).toContain("from 24 in the cell");
    });

    it("warns rather than merely informs once the count gets large", () => {
        const big = mountMenu(
            {
                repetitionsAlongLatticeVectorA: 10,
                repetitionsAlongLatticeVectorB: 10,
                repetitionsAlongLatticeVectorC: 10,
            },
            { atomCountInCell: 24 },
        );
        expect(big.wrapper.find('[data-name="RepetitionCost"]').first().prop("color")).toBe(
            "warning.main",
        );
        const small = mountMenu({}, { atomCountInCell: 24 });
        expect(small.wrapper.find('[data-name="RepetitionCost"]').first().prop("color")).toBe(
            "text.secondary",
        );
    });

    it("says nothing about cost when the atom count is unknown, rather than claiming zero", () => {
        const { wrapper } = mountMenu();
        expect(wrapper.find('[data-name="RepetitionCost"]').exists()).toBe(false);
    });

    it("resets one parameter without touching the others", () => {
        const { wrapper, changes } = mountMenu({ atomRadiiScale: 5 });
        wrapper.find('button[aria-label="Reset atomic radius"]').simulate("click");
        expect(changes).toEqual([{ atomRadiiScale: settings.atomRadiiScale }]);
    });

    it("resets everything from one control", () => {
        const { wrapper, changes } = mountMenu({
            atomRadiiScale: 5,
            chemicalConnectivityFactor: 2,
        });
        wrapper.find('button[data-name="ResetAllParameters"]').simulate("click");
        expect(changes).toEqual([getParameterDefaults()]);
    });
});
