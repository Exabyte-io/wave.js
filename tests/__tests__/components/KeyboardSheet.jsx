import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";

import KeyboardSheet from "../../../src/components/KeyboardSheet";
import settings from "../../../src/settings";
import {
    formatEditorKey,
    getGroupedKeyBindings,
    getKeyBindings,
    matchesEditorKey,
} from "../../../src/utils/keyBindings";

Enzyme.configure({ adapter: new Adapter() });

const { mount } = Enzyme;

const keyEvent = (overrides = {}) => ({
    key: "z",
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    ...overrides,
});

describe("matchesEditorKey", () => {
    const { undo, redo, removeSelected, cancelOrDeselect } = settings.editorKeysConfig;

    it("matches undo on either modifier", () => {
        expect(matchesEditorKey(keyEvent({ ctrlKey: true }), undo)).toBe(true);
        expect(matchesEditorKey(keyEvent({ metaKey: true }), undo)).toBe(true);
    });

    it("does not treat a bare keypress as undo", () => {
        expect(matchesEditorKey(keyEvent(), undo)).toBe(false);
    });

    it("keeps undo and redo distinct - Shift is what separates them", () => {
        expect(matchesEditorKey(keyEvent({ ctrlKey: true, shiftKey: true }), undo)).toBe(false);
        expect(matchesEditorKey(keyEvent({ ctrlKey: true, shiftKey: true }), redo)).toBe(true);
        expect(matchesEditorKey(keyEvent({ ctrlKey: true }), redo)).toBe(false);
    });

    it("matches every listed alternative for remove", () => {
        expect(matchesEditorKey(keyEvent({ key: "Delete" }), removeSelected)).toBe(true);
        expect(matchesEditorKey(keyEvent({ key: "Backspace" }), removeSelected)).toBe(true);
    });

    it("ignores Shift for a binding that has no modifier - Shift+Delete is still Delete", () => {
        expect(matchesEditorKey(keyEvent({ key: "Delete", shiftKey: true }), removeSelected)).toBe(
            true,
        );
    });

    it("refuses a modifier-free binding when a modifier is held", () => {
        // Ctrl+Delete is a different gesture and must not silently remove an atom.
        expect(matchesEditorKey(keyEvent({ key: "Delete", ctrlKey: true }), removeSelected)).toBe(
            false,
        );
    });

    it("is case-insensitive on the key name", () => {
        expect(matchesEditorKey(keyEvent({ key: "Z", ctrlKey: true }), undo)).toBe(true);
        expect(matchesEditorKey(keyEvent({ key: "escape" }), cancelOrDeselect)).toBe(true);
    });

    it("matches nothing for an absent or empty definition", () => {
        expect(matchesEditorKey(keyEvent(), null)).toBe(false);
        expect(matchesEditorKey(keyEvent(), { keys: [] })).toBe(false);
    });
});

describe("formatEditorKey", () => {
    it("joins a modifier combo with plus signs", () => {
        expect(formatEditorKey({ keys: ["z"], usesModifier: true, requiresShift: true })).toMatch(
            /^(Ctrl|Cmd) \+ Shift \+ Z$/,
        );
    });

    it("joins alternatives with a slash, not a plus", () => {
        expect(formatEditorKey({ keys: ["Delete", "Backspace"] })).toBe("Delete / Backspace");
    });

    it("leaves multi-character key names alone", () => {
        expect(formatEditorKey({ keys: ["Escape"] })).toBe("Escape");
    });
});

describe("getKeyBindings", () => {
    it("takes every key from settings rather than a hardcoded list", () => {
        const bindings = getKeyBindings();
        const bonds = bindings.find((binding) => binding.label === "Bonds");
        expect(bonds.keys).toBe(settings.hotKeysConfig.toggleBonds.toUpperCase());
    });

    it("covers the bindings that used to appear in no tooltip or menu", () => {
        const labels = getKeyBindings().map((binding) => binding.label);
        [
            "Interactive on / off",
            "Add to selection",
            "Marquee select",
            "Orbit while editing",
            "Remove selected",
            "Undo",
            "Redo",
            "Cancel drag · deselect",
        ].forEach((label) => expect(labels).toContain(label));
    });

    it("omits edit bindings when the viewer is not editable", () => {
        const labels = getKeyBindings({ editable: false }).map((binding) => binding.label);
        expect(labels).not.toContain("Edit mode");
        expect(labels).not.toContain("Undo");
        expect(labels).not.toContain("Marquee select");
        // View and measure bindings still apply.
        expect(labels).toContain("Bonds");
        expect(labels).toContain("Distances");
    });

    it("groups into view, edit and measure", () => {
        const groups = getGroupedKeyBindings().map((section) => section.group);
        expect(groups).toEqual(["view", "edit", "measure"]);
    });

    it("drops a group that came out empty rather than rendering a bare heading", () => {
        const groups = getGroupedKeyBindings({ editable: false }).map((section) => section.group);
        expect(groups).not.toContain("edit");
    });
});

describe("KeyboardSheet", () => {
    it("renders nothing while closed", () => {
        const wrapper = mount(<KeyboardSheet />);
        expect(wrapper.find('[data-name="KeyboardSheetGroup-view"]').exists()).toBe(false);
    });

    it("lists every group when open", () => {
        const wrapper = mount(<KeyboardSheet isOpen />);
        expect(wrapper.find('[data-name="KeyboardSheetGroup-view"]').exists()).toBe(true);
        expect(wrapper.find('[data-name="KeyboardSheetGroup-edit"]').exists()).toBe(true);
        expect(wrapper.find('[data-name="KeyboardSheetGroup-measure"]').exists()).toBe(true);
    });

    it("shows the real key for each row", () => {
        const text = mount(<KeyboardSheet isOpen />).text();
        expect(text).toContain("Bonds");
        expect(text).toContain(settings.hotKeysConfig.toggleBonds.toUpperCase());
        expect(text).toContain("right-drag");
    });

    it("hides the edit section when not editable", () => {
        const wrapper = mount(<KeyboardSheet isOpen editable={false} />);
        expect(wrapper.find('[data-name="KeyboardSheetGroup-edit"]').exists()).toBe(false);
        expect(wrapper.find('[data-name="KeyboardSheetGroup-view"]').exists()).toBe(true);
    });

    it("explains the modifier and the mode exclusivity", () => {
        const text = mount(<KeyboardSheet isOpen />).text();
        expect(text).toContain("Ctrl on Windows");
        expect(text).toContain("mutually exclusive");
    });
});
