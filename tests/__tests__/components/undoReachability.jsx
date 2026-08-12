import { Made } from "@mat3ra/made";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";

import StatusBar from "../../../src/components/StatusBar";
import { ThreeDEditor } from "../../../src/components/ThreeDEditor";
import settings from "../../../src/settings";
import { describeEditCommit } from "../../../src/utils/editActions";
import { ELEMENT_PROPERTIES, MATERIAL_CONFIG } from "../../enums";
import { createElement } from "../../utils";

Enzyme.configure({ adapter: new Adapter() });

const { mount } = Enzyme;

describe("describeEditCommit", () => {
    it("names each kind of commit in the past tense", () => {
        expect(describeEditCommit("drag")).toContain("Moved atom");
        expect(describeEditCommit("add")).toContain("Added atom");
        expect(describeEditCommit("remove")).toContain("Removed atom");
        expect(describeEditCommit("clone")).toContain("Cloned atoms");
        expect(describeEditCommit("element-input")).toContain("Changed element");
        expect(describeEditCommit("coordinate-input")).toContain("Set coordinate");
    });

    it("tells the user how to take an edit back", () => {
        expect(describeEditCommit("drag")).toMatch(/(Ctrl|Cmd) \+ Z to undo$/);
    });

    it("does not offer undo to someone who just pressed undo", () => {
        expect(describeEditCommit("undo")).toBe("Undone");
        expect(describeEditCommit("redo")).toBe("Redone");
    });

    it("returns null for a source it does not recognise, rather than a broken string", () => {
        expect(describeEditCommit(undefined)).toBe(null);
        expect(describeEditCommit("wat")).toBe(null);
    });
});

describe("StatusBar last-action hint", () => {
    it("shows the hint in the live region", () => {
        const wrapper = mount(<StatusBar lastActionHint="Moved atom · Ctrl + Z to undo" />);
        const hint = wrapper.find('[data-name="StatusBarHint"]');
        expect(hint.exists()).toBe(true);
        expect(hint.first().text()).toContain("to undo");
        // Inside the aria-live region, so it is announced rather than only seen.
        expect(wrapper.find('[data-name="StatusBarLive"]').first().prop("aria-live")).toBe("polite");
    });

    it("renders no hint slot when there is nothing to report", () => {
        expect(mount(<StatusBar />).find('[data-name="StatusBarHint"]').exists()).toBe(false);
    });
});

describe("Undo reachability outside edit mode (F6)", () => {
    const mountEditor = () => {
        const container = createElement("div", ELEMENT_PROPERTIES);
        const wrapper = mount(
            <ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />,
            { attachTo: container },
        );
        wrapper.find('[data-name="Interactive"]').first().prop("onClick")();
        wrapper.update();
        return wrapper;
    };

    /** Pushes a real history entry through the same path an edit takes. */
    const commitAnEdit = (wrapper) => {
        const editor = wrapper.instance();
        const { material } = editor.state;
        editor.handleStructureModified(material.clone(), "drag");
        wrapper.update();
    };

    it("offers no undo/redo buttons before anything has been edited", () => {
        const wrapper = mountEditor();
        expect(wrapper.find('[data-name="Undo"]').exists()).toBe(false);
        expect(wrapper.find('[data-name="Redo"]').exists()).toBe(false);
    });

    it("surfaces undo in the main toolbar once history exists, without entering edit mode", () => {
        const wrapper = mountEditor();
        commitAnEdit(wrapper);
        expect(wrapper.instance().canUndo()).toBe(true);
        expect(wrapper.state("isEditModeActive")).toBe(false);
        expect(wrapper.find('[data-name="Undo"]').exists()).toBe(true);
    });

    it("marks redo disabled while there is nothing ahead in the stack", () => {
        const wrapper = mountEditor();
        commitAnEdit(wrapper);
        const redo = wrapper
            .find("SquareIconButton")
            .filterWhere((node) => node.prop("data-name") === "Redo")
            .first();
        expect(redo.prop("disabled")).toBe(true);
    });

    it("handles the undo hotkey outside edit mode", () => {
        const wrapper = mountEditor();
        commitAnEdit(wrapper);
        const before = wrapper.state("historyPointer");
        expect(before).toBe(1);

        const prevented = [];
        wrapper.instance().handleEditModeKeyDown({
            key: settings.editorKeysConfig.undo.keys[0],
            ctrlKey: true,
            metaKey: false,
            shiftKey: false,
            target: { nodeName: "DIV" },
            preventDefault: () => prevented.push(true),
        });
        wrapper.update();
        expect(wrapper.state("historyPointer")).toBe(0);
        expect(prevented.length).toBe(1);
    });

    it("leaves the key to the host when our own history is empty", () => {
        // Ungating undo must not mean swallowing a key an embedding host wants for its own undo.
        const wrapper = mountEditor();
        const prevented = [];
        wrapper.instance().handleEditModeKeyDown({
            key: settings.editorKeysConfig.undo.keys[0],
            ctrlKey: true,
            metaKey: false,
            shiftKey: false,
            target: { nodeName: "DIV" },
            preventDefault: () => prevented.push(true),
        });
        expect(prevented.length).toBe(0);
    });

    it("keeps Delete gated on edit mode, where a selection exists to remove", () => {
        const wrapper = mountEditor();
        const editor = wrapper.instance();
        const atomsBefore = editor.state.material.basis.elements.length;
        editor.setState({ selectedAtomIndices: [0] });
        editor.handleEditModeKeyDown({
            key: "Delete",
            ctrlKey: false,
            metaKey: false,
            shiftKey: false,
            target: { nodeName: "DIV" },
            preventDefault: () => {},
        });
        wrapper.update();
        expect(wrapper.state("material").basis.elements.length).toBe(atomsBefore);
    });

    it("records a hint describing the commit, and clears the timer on unmount", () => {
        const wrapper = mountEditor();
        commitAnEdit(wrapper);
        expect(wrapper.state("lastActionHint")).toContain("Moved atom");
        // An uncleared timeout calling setState after unmount is the S-2 defect class.
        const editor = wrapper.instance();
        expect(editor._editHintTimeout).not.toBe(null);
        wrapper.unmount();
        expect(editor._editHintTimeout).toBe(null);
    });
});
