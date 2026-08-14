import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";

import EditToolbar from "../../../src/components/EditToolbar";
import SelectionInspector, { getUnitsCaption } from "../../../src/components/SelectionInspector";

Enzyme.configure({ adapter: new Adapter() });

const { mount } = Enzyme;

const titlesOf = (wrapper) =>
    wrapper
        .find("SquareIconButton")
        .map((node) => node.prop("title"))
        .join(" | ");

const isDisabled = (wrapper, titleFragment) =>
    wrapper
        .find("SquareIconButton")
        .filterWhere((node) =>
            (node.prop("title") || "").toLowerCase().includes(titleFragment.toLowerCase()),
        )
        .first()
        .prop("disabled");

describe("EditToolbar", () => {
    it("renders the tools as icons, with no text fields among them", () => {
        const wrapper = mount(<EditToolbar />);
        expect(wrapper.find('[data-name="EditToolbar"]').exists()).toBe(true);
        // The whole point of the split: the tool strip carries verbs, not data entry (F1).
        expect(wrapper.find("input").length).toBe(0);
    });

    it("disables clone, delete and focus without a selection", () => {
        const wrapper = mount(<EditToolbar selectedCount={0} />);
        expect(isDisabled(wrapper, "Clone")).toBe(true);
        expect(isDisabled(wrapper, "Delete")).toBe(true);
        expect(isDisabled(wrapper, "Focus")).toBe(true);
    });

    it("keeps rotate disabled below two atoms, since spinning one sphere changes nothing (D4)", () => {
        expect(isDisabled(mount(<EditToolbar selectedCount={1} />), "Rotate")).toBe(true);
        expect(isDisabled(mount(<EditToolbar selectedCount={2} />), "Rotate")).toBe(false);
    });

    it("says how many atoms a group action will affect", () => {
        expect(titlesOf(mount(<EditToolbar selectedCount={3} />))).toContain(
            "Clone 3 Selected Atoms",
        );
        expect(titlesOf(mount(<EditToolbar selectedCount={1} />))).toContain("Clone Selected Atom");
    });

    it("names the element the Add button will insert", () => {
        expect(titlesOf(mount(<EditToolbar defaultElement="Ge" />))).toContain("Add Atom (Ge)");
    });

    it("follows canUndo/canRedo", () => {
        const wrapper = mount(<EditToolbar canUndo canRedo={false} />);
        expect(isDisabled(wrapper, "Undo")).toBe(false);
        expect(isDisabled(wrapper, "Redo")).toBe(true);
    });

    it("reports the mode it was asked to switch to", () => {
        const modes = [];
        const wrapper = mount(
            <EditToolbar selectedCount={2} onSetTransformMode={(mode) => modes.push(mode)} />,
        );
        wrapper
            .find("SquareIconButton")
            .filterWhere((node) => (node.prop("title") || "").includes("Rotate Mode"))
            .first()
            .prop("onClick")();
        expect(modes).toEqual(["rotate"]);
    });
});

describe("getUnitsCaption", () => {
    it("matches the caption the edit panel used to show", () => {
        expect(getUnitsCaption("cartesian")).toBe("cartesian, Å");
        expect(getUnitsCaption("crystal")).toBe("crystal");
        expect(getUnitsCaption(undefined)).toBe("crystal");
    });
});

describe("SelectionInspector", () => {
    it("teaches how to select when nothing is selected, instead of rendering nothing", () => {
        const wrapper = mount(<SelectionInspector selectedAtomIndices={[]} />);
        expect(wrapper.find('[data-name="SelectionInspectorEmpty"]').exists()).toBe(true);
        // The selection modifiers appear in no other UI.
        expect(wrapper.text()).toContain("Shift-click");
        expect(wrapper.text()).toContain("marquee");
    });

    it("summarizes a group rather than showing one atom's coordinates", () => {
        const wrapper = mount(<SelectionInspector selectedAtomIndices={[1, 2, 4]} />);
        expect(wrapper.find('[data-name="SelectionInspectorGroup"]').exists()).toBe(true);
        expect(wrapper.text()).toContain("3 atoms selected");
        expect(wrapper.find("input").length).toBe(0);
    });

    it("shows element, site index and coordinates for a single atom", () => {
        const wrapper = mount(
            <SelectionInspector
                selectedAtomIndices={[12]}
                selectedElement="Si"
                selectedCoordinates={[-0.083, 0.25, 0.125]}
            />,
        );
        expect(wrapper.text()).toContain("site 12");
        const values = wrapper.find("input").map((node) => node.prop("value"));
        expect(values).toContain("Si");
        expect(values).toContain("-0.083");
        expect(values).toContain("0.250");
    });

    it("always says what the material actually stores", () => {
        expect(
            mount(
                <SelectionInspector selectedAtomIndices={[0]} materialUnits="cartesian" />,
            ).text(),
        ).toContain("Stored as cartesian, Å");
    });

    it("edits in the material's own units", () => {
        const wrapper = mount(
            <SelectionInspector
                selectedAtomIndices={[0]}
                materialUnits="crystal"
                displayUnits="crystal"
                selectedCoordinates={[0.25, 0.25, 0.25]}
            />,
        );
        const coordinateFields = wrapper
            .find("input")
            .filterWhere((n) => n.prop("value") === "0.250");
        expect(coordinateFields.length).toBe(3);
        expect(coordinateFields.map((n) => n.prop("disabled"))).toEqual([false, false, false]);
        expect(wrapper.find('[data-name="SelectionInspectorReadOnlyNote"]').exists()).toBe(false);
    });

    it("shows converted values read-only when displaying a non-native unit, and says why", () => {
        const wrapper = mount(
            <SelectionInspector
                selectedAtomIndices={[0]}
                materialUnits="crystal"
                displayUnits="cartesian"
                selectedCoordinates={[0.25, 0.25, 0.25]}
                displayCoordinates={[1.357, 1.357, 1.357]}
            />,
        );
        const values = wrapper.find("input").map((node) => node.prop("value"));
        expect(values).toContain("1.357");
        expect(values).not.toContain("0.250");
        const note = wrapper.find('[data-name="SelectionInspectorReadOnlyNote"]');
        expect(note.exists()).toBe(true);
        expect(note.first().text()).toContain("Switch to crystal to edit");
    });

    it("reports a units change", () => {
        const chosen = [];
        const wrapper = mount(
            <SelectionInspector
                selectedAtomIndices={[0]}
                materialUnits="crystal"
                onDisplayUnitsChange={(units) => chosen.push(units)}
            />,
        );
        wrapper.find('[data-name="SelectionInspectorUnits"]').first().prop("onChange")(
            {},
            "cartesian",
        );
        expect(chosen).toEqual(["cartesian"]);
    });

    it("ignores a units change that would deselect both options", () => {
        const chosen = [];
        const wrapper = mount(
            <SelectionInspector
                selectedAtomIndices={[0]}
                onDisplayUnitsChange={(units) => chosen.push(units)}
            />,
        );
        // ToggleButtonGroup reports null when the active button is clicked again.
        wrapper.find('[data-name="SelectionInspectorUnits"]').first().prop("onChange")({}, null);
        expect(chosen).toEqual([]);
    });

    it("prefers a focused draft over the committed value", () => {
        const wrapper = mount(
            <SelectionInspector
                selectedAtomIndices={[0]}
                selectedCoordinates={[0.25, 0.25, 0.25]}
                coordinateDrafts={["-", null, null]}
                elementDraft="G"
            />,
        );
        const values = wrapper.find("input").map((node) => node.prop("value"));
        expect(values).toContain("-");
        expect(values).toContain("G");
    });

    it("lays the three coordinates out as sharing columns, not fixed widths", () => {
        // Fixed-width fields pushed the third one past the card's right edge; equal columns that
        // are allowed to shrink is what keeps Z on screen.
        const sx = mount(
            <SelectionInspector selectedAtomIndices={[0]} selectedCoordinates={[0, 0, 0]} />,
        )
            .find('[data-name="SelectionInspectorCoordinates"]')
            .first()
            .prop("sx");
        expect(sx.display).toBe("grid");
        expect(sx.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
    });

    it("releases the InputBase min-width that would overflow the card", () => {
        // MUI's InputBase root sets min-width: 75px, wider than the column it sits in. Matched by
        // class substring because MuiClassNameSetup renames MUI classes to "wave-Mui*".
        const sx = mount(
            <SelectionInspector selectedAtomIndices={[0]} selectedCoordinates={[0, 0, 0]} />,
        )
            .findWhere((node) => node.prop("label") === "Z" && typeof node.prop("sx") === "object")
            .first()
            .prop("sx");
        expect(sx['& [class*="InputBase-root"]'].minWidth).toBe(0);
    });

    it("scrolls inside its own bounds rather than overflowing the canvas (F1)", () => {
        const sx = mount(<SelectionInspector selectedAtomIndices={[]} />)
            .find('[data-name="SelectionInspector"]')
            .first()
            .prop("sx");
        expect(sx.maxHeight).toBe("100%");
        expect(sx.overflowY).toBe("auto");
    });
});
