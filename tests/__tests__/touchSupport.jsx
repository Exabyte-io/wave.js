import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";
import * as THREE from "three";

import KeyboardSheet from "../../src/components/KeyboardSheet";
import { getEditModeBindings } from "../../src/components/ModePill";
import { getGroupedKeyBindings, getKeyBindings } from "../../src/utils/keyBindings";
import { getWaveInstance } from "../enums";

Enzyme.configure({ adapter: new Adapter() });

const { mount } = Enzyme;

/**
 * Touch and small-screen support (U-13).
 *
 * The proposal's position was that half-support is the worst of the three options, and the viewer was
 * squarely in it: `isMobile` was computed from the viewport width and forwarded to one dropdown, the
 * canvas let the browser eat every touch drag, and the only place documenting how to drive the viewer
 * needed a keyboard to open. These are the assertions that the half is closed.
 */
describe("touch support", () => {
    describe("canvas gesture ownership", () => {
        it("claims touch gestures from the browser", () => {
            // Without touch-action: none the browser treats a drag as page scroll or pinch-zoom and
            // sends pointercancel to the viewer - so no touch drag ever reached orbit, atom dragging
            // or marquee select, whatever the handlers did.
            const wave = getWaveInstance();
            expect(wave.renderer.domElement.style.touchAction).toBe("none");
        });
    });

    describe("edit mode reserves the first finger", () => {
        let wave;

        beforeEach(() => {
            wave = getWaveInstance();
            if (!wave.orbitControls) wave.initOrbitControls(true);
        });

        it("moves the camera to two fingers while editing, as it moves it to the right button", () => {
            const defaults = { ...wave.orbitControls.touches };
            expect(defaults.ONE).toBe(THREE.TOUCH.ROTATE);

            wave.enableEditMode(true);

            // One finger belongs to select / drag-atom / marquee; anything OrbitControls does not
            // recognise leaves it in STATE.NONE, which is how "no camera on this input" is said.
            expect([THREE.TOUCH.ROTATE, THREE.TOUCH.PAN]).not.toContain(
                wave.orbitControls.touches.ONE,
            );
            expect(wave.orbitControls.touches.TWO).toBe(THREE.TOUCH.DOLLY_ROTATE);
        });

        it("restores the touch mapping on leaving edit mode", () => {
            const defaults = { ...wave.orbitControls.touches };
            wave.enableEditMode(true);
            wave.enableEditMode(false);
            expect(wave.orbitControls.touches).toEqual(defaults);
        });

        it("restores it after repeated entry and exit, not just the first round trip", () => {
            const touchDefaults = { ...wave.orbitControls.touches };
            const buttonDefaults = { ...wave.orbitControls.mouseButtons };
            for (let i = 0; i < 3; i += 1) {
                wave.enableEditMode(true);
                wave.enableEditMode(false);
            }
            expect(wave.orbitControls.touches).toEqual(touchDefaults);
            expect(wave.orbitControls.mouseButtons).toEqual(buttonDefaults);
        });

        it("keeps the mouse remap it already had", () => {
            wave.enableEditMode(true);
            expect(wave.orbitControls.mouseButtons.LEFT).toBeNull();
            expect(wave.orbitControls.mouseButtons.RIGHT).toBe(THREE.MOUSE.ROTATE);
        });
    });

    describe("the shortcut sheet documents gestures that exist", () => {
        it("lists touch gestures only where touch input is possible", () => {
            const withTouch = getKeyBindings({ includeTouch: true });
            const withoutTouch = getKeyBindings({ includeTouch: false });
            expect(withTouch.some((binding) => binding.group === "touch")).toBe(true);
            expect(withoutTouch.some((binding) => binding.group === "touch")).toBe(false);
        });

        it("names two fingers for orbiting, matching what edit mode actually does", () => {
            const touch = getKeyBindings({ includeTouch: true }).filter((b) => b.group === "touch");
            const orbit = touch.find((binding) => binding.label === "Orbit while editing");
            expect(orbit.keys).toBe("two fingers");
            // The mouse row for the same action still says right-drag: the mappings differ, which is
            // why these are separate rows rather than one row with two labels.
            const mouseOrbit = getKeyBindings()
                .filter((b) => b.group === "edit")
                .find((binding) => binding.label === "Orbit while editing");
            expect(mouseOrbit.keys).toBe("right-drag");
        });

        it("drops the edit-only gestures when the viewer is not editable", () => {
            const readOnly = getKeyBindings({ includeTouch: true, editable: false }).filter(
                (b) => b.group === "touch",
            );
            expect(readOnly.map((binding) => binding.label)).toEqual(["Rotate (once Rotate/Zoom is on)", "Zoom", "Pan"]);
        });

        it("groups touch last on a mouse, where it is a supplement", () => {
            const groups = getGroupedKeyBindings({ includeTouch: true }).map((s) => s.group);
            expect(groups[groups.length - 1]).toBe("touch");
        });

        it("groups touch first on a coarse pointer, where it is the only way in", () => {
            // On a phone the sheet is one column, so group order is scroll distance: three groups of
            // keyboard shortcuts above the gestures buries the section the device actually needs.
            const groups = getGroupedKeyBindings({ includeTouch: true, touchFirst: true }).map(
                (s) => s.group,
            );
            expect(groups[0]).toBe("touch");
        });

        it("omits the touch group entirely rather than showing an empty column", () => {
            const groups = getGroupedKeyBindings({ includeTouch: false }).map((s) => s.group);
            expect(groups).not.toContain("touch");
        });

        it("renders the touch section in the sheet", () => {
            const wrapper = mount(<KeyboardSheet isOpen includeTouch />);
            expect(wrapper.find('[data-name="KeyboardSheetGroup-touch"]').exists()).toBe(true);
            expect(wrapper.text()).toContain("pinch");
        });

        it("keeps the keyboard sections on a touch device", () => {
            // A tablet with a keyboard is ordinary; hiding the key rows would be the same
            // discoverability failure this sheet exists to fix, running the other way.
            const wrapper = mount(<KeyboardSheet isOpen includeTouch />);
            expect(wrapper.find('[data-name="KeyboardSheetGroup-view"]').exists()).toBe(true);
            expect(wrapper.find('[data-name="KeyboardSheetGroup-edit"]').exists()).toBe(true);
        });

        it("offers a Close button, the only exit that needs no keyboard", () => {
            const onClose = jest.fn();
            const wrapper = mount(<KeyboardSheet isOpen onClose={onClose} isCoarsePointer />);
            wrapper.find('button[data-name="KeyboardSheetClose"]').at(0).simulate("click");
            expect(onClose).toHaveBeenCalled();
        });

        it("stops promising `?` and Escape on a device with neither", () => {
            const coarse = mount(<KeyboardSheet isOpen includeTouch isCoarsePointer />);
            expect(coarse.text()).not.toContain("Esc to close");
            const fine = mount(<KeyboardSheet isOpen isCoarsePointer={false} />);
            expect(fine.text()).toContain("Esc to close");
        });

        it("is titled for what it lists, not for the keyboard alone", () => {
            const wrapper = mount(<KeyboardSheet isOpen includeTouch />);
            expect(wrapper.text()).toContain("Shortcuts & gestures");
        });

        it("puts the touch section first when the pointer is coarse", () => {
            const wrapper = mount(<KeyboardSheet isOpen includeTouch isCoarsePointer />);
            const groups = wrapper
                .find('[data-name^="KeyboardSheetGroup-"]')
                .map((node) => node.prop("data-name"));
            expect(groups[0]).toBe("KeyboardSheetGroup-touch");
        });
    });

    describe("the mode pill names gestures the device has", () => {
        it("names two fingers, not the right button, on a coarse pointer", () => {
            const coarse = getEditModeBindings({ isOrbitEnabled: true, isCoarsePointer: true });
            expect(coarse.join(" ")).toContain("2 fingers = orbit");
            expect(coarse.join(" ")).not.toContain("RMB");
        });

        it("still names the right button for a mouse", () => {
            const fine = getEditModeBindings({ isOrbitEnabled: true, isCoarsePointer: false });
            expect(fine.join(" ")).toContain("RMB = orbit");
            expect(fine.join(" ")).not.toContain("finger");
        });

        it("drops key names a phone cannot produce", () => {
            const coarse = getEditModeBindings({ isOrbitEnabled: true, isCoarsePointer: true });
            expect(coarse.join(" ")).not.toMatch(/Del|Esc/);
            const fine = getEditModeBindings({ isOrbitEnabled: true, isCoarsePointer: false });
            expect(fine.join(" ")).toContain("Del = remove");
        });

        it("says orbit is off rather than pointing at a key, on a coarse pointer", () => {
            // The keyboard route to enabling orbit is useless without a keyboard; the View menu and
            // the quick-toggle row are the reachable ones, and both are on screen.
            const coarse = getEditModeBindings({ isOrbitEnabled: false, isCoarsePointer: true });
            expect(coarse.join(" ")).toContain("Rotate/Zoom off");
            expect(coarse.join(" ")).not.toMatch(/= enable orbit/);
        });

        it("defaults its answer from the device rather than requiring the caller to know", () => {
            // jsdom reports a fine pointer, so the default must be the mouse wording.
            expect(getEditModeBindings({ isOrbitEnabled: true }).join(" ")).toContain("RMB");
        });
    });
});
