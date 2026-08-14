import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";

import StatusBar, {
    getComposition,
    getLatticeSummary,
    normalizeElement,
    tokenizeFormula,
} from "../../../src/components/StatusBar";

Enzyme.configure({ adapter: new Adapter() });

const { mount } = Enzyme;

// Deliberately plain objects, not Made.Material: the status bar reads the material and never
// mutates it, so its unit tests need no GL context and no real Basis/Lattice construction. `getLattice` is a
// function because that is what Made.Material exposes since the constraints refactor (SOF-7926).
const CUBIC_SIO2 = {
    formula: "Si8O16",
    basis: {
        units: "crystal",
        elements: [
            { id: 0, value: "Si" },
            { id: 1, value: "O" },
            { id: 2, value: "O" },
            { id: 3, value: "Si" },
        ],
    },
    getLattice: () => ({
        type: "CUB",
        unitCell: { ax: 7.164, ay: 0, az: 0, bx: 0, by: 7.164, bz: 0, cx: 0, cy: 0, cz: 7.164 },
    }),
};

describe("normalizeElement", () => {
    it("accepts every element-entry shape the basis produces", () => {
        expect(normalizeElement("Si")).toBe("Si");
        expect(normalizeElement({ id: 0, value: "Ge" })).toBe("Ge");
        expect(normalizeElement({ element: "As" })).toBe("As");
        expect(normalizeElement(undefined)).toBe("");
        expect(normalizeElement({})).toBe("");
    });
});

describe("tokenizeFormula", () => {
    it("splits a formula into symbol and count pairs", () => {
        expect(tokenizeFormula("Si8O16")).toEqual([
            ["Si", "8"],
            ["O", "16"],
        ]);
    });

    it("treats an absent count as an empty string rather than 1", () => {
        expect(tokenizeFormula("SiO2")).toEqual([
            ["Si", ""],
            ["O", "2"],
        ]);
    });

    it("returns nothing for input that is not a formula", () => {
        expect(tokenizeFormula("")).toEqual([]);
        expect(tokenizeFormula("123")).toEqual([]);
    });
});

describe("getComposition", () => {
    it("counts each element once, in first-appearance order", () => {
        expect(getComposition(CUBIC_SIO2)).toEqual([
            ["Si", 2],
            ["O", 2],
        ]);
    });

    it("survives a material with no basis", () => {
        expect(getComposition(null)).toEqual([]);
        expect(getComposition({})).toEqual([]);
        expect(getComposition({ basis: {} })).toEqual([]);
    });
});

describe("getLatticeSummary", () => {
    it("collapses equal cell lengths to a single figure", () => {
        expect(getLatticeSummary(CUBIC_SIO2)).toBe("CUB · a = 7.164 Å");
    });

    it("lists all three lengths when they differ", () => {
        const tetragonal = {
            getLattice: () => ({
                type: "TET",
                unitCell: { ax: 3.9, ay: 0, az: 0, bx: 0, by: 3.9, bz: 0, cx: 0, cy: 0, cz: 4.2 },
            }),
        };
        expect(getLatticeSummary(tetragonal)).toBe("TET · a, b, c = 3.900, 3.900, 4.200 Å");
    });

    it("computes lengths from the vectors, not from the components", () => {
        // A non-orthogonal cell: |a| is the vector norm (5), never the ax component (3). This is
        // the same class of mistake defect D22 made when it took a cell centre component-wise.
        const triclinic = {
            getLattice: () => ({
                unitCell: { ax: 3, ay: 4, az: 0, bx: 0, by: 5, bz: 0, cx: 0, cy: 0, cz: 5 },
            }),
        };
        const summary = getLatticeSummary(triclinic);
        expect(summary).toBe("a = 5.000 Å");
        // The component-wise reading would have produced 3.000 here.
        expect(summary).not.toContain("3.000");
    });

    it("falls back to the lattice type when there is no cell", () => {
        expect(getLatticeSummary({ getLattice: () => ({ type: "FCC" }) })).toBe("FCC");
        expect(getLatticeSummary(null)).toBe("");
        // A material predating the accessor, or one that simply has no lattice, must not throw.
        expect(getLatticeSummary({})).toBe("");
    });
});

describe("StatusBar rendering", () => {
    it("shows formula, atom count, lattice and units", () => {
        const wrapper = mount(<StatusBar material={CUBIC_SIO2} />);
        const text = wrapper.text();
        expect(text).toContain("Si");
        expect(text).toContain("4 atoms");
        expect(text).toContain("a = 7.164 Å");
        expect(text).toContain("crystal");
    });

    it("reports the units the material actually carries", () => {
        const cartesian = { ...CUBIC_SIO2, basis: { ...CUBIC_SIO2.basis, units: "cartesian" } };
        expect(mount(<StatusBar material={cartesian} />).text()).toContain("cartesian, Å");
    });

    it("summarizes a single selection by element and index", () => {
        const wrapper = mount(
            <StatusBar material={CUBIC_SIO2} selectedAtomIndices={[3]} selectedElement="Si" />,
        );
        expect(wrapper.text()).toContain("Si #3 selected");
    });

    it("summarizes a group selection by count", () => {
        const wrapper = mount(<StatusBar material={CUBIC_SIO2} selectedAtomIndices={[0, 1, 2]} />);
        expect(wrapper.text()).toContain("3 atoms selected");
    });

    it("marks the selection region as a live region", () => {
        const wrapper = mount(<StatusBar material={CUBIC_SIO2} selectedAtomIndices={[0]} />);
        expect(wrapper.find('[data-name="StatusBarLive"]').first().prop("aria-live")).toBe(
            "polite",
        );
    });

    it("renders a chip per element and reports the clicked symbol", () => {
        const clicked = [];
        const wrapper = mount(
            <StatusBar material={CUBIC_SIO2} onSelectElement={(symbol) => clicked.push(symbol)} />,
        );
        expect(wrapper.find('[data-name="StatusBarChip-Si"]').exists()).toBe(true);
        expect(wrapper.find('[data-name="StatusBarChip-O"]').exists()).toBe(true);
        wrapper.find('[data-name="StatusBarChip-O"]').first().simulate("click");
        expect(clicked).toEqual(["O"]);
    });

    it("is inert without onSelectElement, so a legend is never a dead control", () => {
        const wrapper = mount(<StatusBar material={CUBIC_SIO2} />);
        const chip = wrapper.find('[data-name="StatusBarChip-Si"]').first();
        expect(chip.exists()).toBe(true);
        expect(chip.prop("onClick")).toBe(undefined);
    });

    it("renders with no material at all rather than throwing", () => {
        expect(
            mount(<StatusBar />)
                .find('[data-name="StatusBar"]')
                .exists(),
        ).toBe(true);
    });

    it("shows a measurement readout when one is supplied", () => {
        const wrapper = mount(<StatusBar material={CUBIC_SIO2} measurement="d = 2.351 Å" />);
        expect(wrapper.text()).toContain("d = 2.351 Å");
    });
});
