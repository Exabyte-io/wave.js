import { Made } from "@mat3ra/made";
import RotateRight from "@mui/icons-material/RotateRight";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";
import * as THREE from "three";

import { ThreeDEditor } from "../../../src/components/ThreeDEditor";
import { WaveComponent } from "../../../src/components/WaveComponent";
import settings from "../../../src/settings";
import { ELEMENT_PROPERTIES, getWaveInstance, MATERIAL_CONFIG, WAVE_SETTINGS } from "../../enums";
import {
    projectMeshToScreen,
    simulateAtomDrag,
    simulateClick,
    simulateMarqueeSelect,
    stubCanvasRect,
} from "../../helpers/editor";
import { SELECTORS } from "../../selectors";
import { createElement, HEIGHT, takeSnapshotAndAssertEqualityAsync, WIDTH } from "../../utils";

Enzyme.configure({ adapter: new Adapter() });

const { mount } = Enzyme;

test("toggleInteractive", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} />, {
        attachTo: container,
    });

    // assert view and export buttons are hidden
    expect(wrapper.find(SELECTORS.viewIconToolbar).exists()).toBe(false);
    expect(wrapper.find(SELECTORS.exportIconToolbar).exists()).toBe(false);

    const interactiveButton = wrapper.find(`${SELECTORS.interactiveIconToolbar} button`);
    interactiveButton.prop("onClick")();
    wrapper.update();

    // assert view and export buttons are visible
    expect(wrapper.find(SELECTORS.viewIconToolbar).exists()).toBe(true);
    expect(wrapper.find(SELECTORS.exportIconToolbar).exists()).toBe(true);
});

test("toggleView", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} />, {
        attachTo: container,
    });

    const interactiveButton = wrapper.find(`${SELECTORS.interactiveIconToolbar} button`);
    interactiveButton.prop("onClick")();
    wrapper.update();

    // assert toggle axes button is hidden
    expect(wrapper.find(SELECTORS.toggleAxesMenuItem).exists()).toBe(false);

    const viewButton = wrapper.find(`${SELECTORS.viewIconToolbar} button`);
    viewButton.simulate("click");
    wrapper.update();

    // assert toggle axes button is visible
    expect(wrapper.find(SELECTORS.toggleAxesMenuItem).exists()).toBe(true);
});

test("preserve three.js editor changes", async () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });

    // Click on "interactive" button
    const interactiveButton = wrapper.find(`${SELECTORS.interactiveIconToolbar} button`);
    interactiveButton.prop("onClick")();
    wrapper.update();

    expect(wrapper.find(SELECTORS.threeDEditorIconToolbar).exists()).toBe(true);

    // Click on "Editor" button
    const threeDEditorButton = wrapper.find(`${SELECTORS.threeDEditorIconToolbar} button`);
    threeDEditorButton.prop("onClick")();
    wrapper.update();

    expect(wrapper.state("isEditModeActive")).toBe(true);

    // Simulate modifying materials in the editor
    const modifiedMaterial = new Made.Material({
        ...MATERIAL_CONFIG,
        basis: {
            ...MATERIAL_CONFIG.basis,
            coordinates: MATERIAL_CONFIG.basis.coordinates.map((coordinate) => ({
                ...coordinate,
                value: coordinate.value.map((axisValue) => axisValue + 0.5),
            })),
        },
    });

    // Directly trigger structure modified handler on ThreeDEditor instance
    wrapper.instance().handleStructureModified(modifiedMaterial);
    wrapper.update();

    // Get updated instance of wave and compare it with snapshot
    const { wave } = wrapper.find(WaveComponent).instance();
    const waveInstance = getWaveInstance(WAVE_SETTINGS, wave.structure);

    return takeSnapshotAndAssertEqualityAsync(
        waveInstance.renderer.getContext(),
        "preserveThreeJsEditorChanges",
    );
});

test("edit-mode hotkey from settings toggles edit mode", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    // The document-level, capture-phase hotkey listener only fires for events whose
    // propagation path passes through `document`, so the container must be attached.
    document.body.appendChild(container);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });

    try {
        // Enable interactive mode so hotkeys are processed
        const interactiveButton = wrapper.find(`${SELECTORS.interactiveIconToolbar} button`);
        interactiveButton.prop("onClick")();
        wrapper.update();

        expect(wrapper.state("isEditModeActive")).toBe(false);

        container.dispatchEvent(
            new KeyboardEvent("keypress", {
                key: settings.hotKeysConfig.toggleEditMode,
                bubbles: true,
            }),
        );
        wrapper.update();

        expect(wrapper.state("isEditModeActive")).toBe(true);
    } finally {
        document.body.removeChild(container);
    }
});

test("ignores window postMessage events", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });

    // The removed postMessage bridge (D-11) reflectively invoked whatever method a message
    // named. The canary was `handleSetMaterial`, an orphaned method with no caller, since
    // deleted; this now watches `handleStructureModified`, which is live and both mutates
    // editor state and notifies the host - a faithful stand-in for what the bridge could reach.
    const handleStructureModifiedSpy = jest.spyOn(wrapper.instance(), "handleStructureModified");

    window.dispatchEvent(
        new MessageEvent("message", {
            data: {
                action: "handleStructureModified",
                parameters: [new Made.Material(MATERIAL_CONFIG)],
            },
        }),
    );

    expect(handleStructureModifiedSpy).not.toHaveBeenCalled();
});

test("an echoed material prop with identical content does not wipe history or selection (D16)", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });

    wrapper.instance().handleSelectionChanged([1]);
    const modifiedMaterial = new Made.Material({
        ...MATERIAL_CONFIG,
        basis: {
            ...MATERIAL_CONFIG.basis,
            coordinates: MATERIAL_CONFIG.basis.coordinates.map((coordinate) => ({
                ...coordinate,
                value: coordinate.value.map((axisValue) => axisValue + 0.1),
            })),
        },
    });
    wrapper.instance().handleStructureModified(modifiedMaterial);
    wrapper.update();

    expect(wrapper.state("historyStack").length).toBe(2);
    expect(wrapper.state("selectedAtomIndices")).toEqual([1]);

    // A host that stores our own emitted material and passes it straight back as a prop (the
    // common "lift state up" pattern) must not have its own echo wipe what we just built.
    wrapper.setProps({ material: wrapper.state("material") });
    wrapper.update();

    expect(wrapper.state("historyStack").length).toBe(2);
    expect(wrapper.state("selectedAtomIndices")).toEqual([1]);

    // A genuinely different material DOES reset.
    wrapper.setProps({ material: new Made.Material(MATERIAL_CONFIG) });
    wrapper.update();

    expect(wrapper.state("historyStack").length).toBe(1);
    expect(wrapper.state("selectedAtomIndices")).toEqual([]);
});

test("coordinate field commits once on blur, not per keystroke (D18)", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });
    const instance = wrapper.instance();
    const handleStructureModifiedSpy = jest.spyOn(instance, "handleStructureModified");

    instance.handleSelectionChanged([1]);
    instance.handleCoordinateDraftChange(0, "0.");
    instance.handleCoordinateDraftChange(0, "0.4");
    instance.handleCoordinateDraftChange(0, "0.42");
    expect(handleStructureModifiedSpy).not.toHaveBeenCalled();
    wrapper.update();
    expect(wrapper.state("coordinateDrafts")[0]).toBe("0.42");

    instance.handleCoordinateCommit(0);

    expect(handleStructureModifiedSpy).toHaveBeenCalledTimes(1);
    wrapper.update();
    expect(wrapper.state("coordinateDrafts")[0]).toBeNull();
    expect(wrapper.state("material").basis.coordinates[1].value[0]).toBeCloseTo(0.42, 5);
});

test("an unparseable coordinate draft is discarded on blur without committing", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });
    const instance = wrapper.instance();
    const handleStructureModifiedSpy = jest.spyOn(instance, "handleStructureModified");

    instance.handleSelectionChanged([1]);
    instance.handleCoordinateDraftChange(0, "-");
    instance.handleCoordinateCommit(0);

    expect(handleStructureModifiedSpy).not.toHaveBeenCalled();
    wrapper.update();
    expect(wrapper.state("coordinateDrafts")[0]).toBeNull();
});

test("entering edit mode exits an active measurement mode, and vice versa (D20)", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });
    const instance = wrapper.instance();
    const resetMeasurementsSpy = jest.spyOn(instance, "handleResetMeasurements");

    // Activate a measurement mode, then enter edit mode: it must be force-reset.
    instance.handleToggleMeasurement("distance");
    instance.handleToggleEditMode();
    wrapper.update();

    expect(wrapper.state("isEditModeActive")).toBe(true);
    expect(resetMeasurementsSpy).toHaveBeenCalled();

    // With edit mode active, activating a (previously inactive) measurement mode force-exits it.
    instance.handleToggleMeasurement("angle");
    wrapper.update();
    expect(wrapper.state("isEditModeActive")).toBe(false);
});

test("Add Atom places the new atom at the true cell center, not the component-wise diagonal (D22)", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    // A non-orthogonal (monoclinic-like) lattice, where (a+b+c)/2 differs from (ax/2,by/2,cz/2).
    const skewedMaterial = new Made.Material({
        ...MATERIAL_CONFIG,
        lattice: {
            ...MATERIAL_CONFIG.lattice,
            a: 4,
            b: 4,
            c: 4,
            alpha: 90,
            beta: 60,
            gamma: 90,
        },
        basis: {
            ...MATERIAL_CONFIG.basis,
            elements: [{ id: 0, value: "Si" }],
            coordinates: [{ id: 0, value: [0, 0, 0] }],
        },
    });
    const wrapper = mount(<ThreeDEditor material={skewedMaterial} editable />, {
        attachTo: container,
    });
    const instance = wrapper.instance();

    instance.handleAddAtom();
    wrapper.update();

    // onStructureModified is wired to the wave instance at mount time as a bound reference, so
    // spying on the instance method after mount would miss the call - assert the resulting
    // state instead. The material stays in crystal (fractional) units, and (a+b+c)/2 - the true
    // center in Cartesian - is exactly fractional [0.5, 0.5, 0.5] for ANY lattice shape (u=v=w=0.5
    // by definition), which is a cleaner, convention-independent way to assert this than
    // re-deriving Cartesian coordinates by hand.
    const newMaterial = wrapper.state("material");
    const addedCoordinate = newMaterial.Basis.coordinatesAsArray[1];
    const { ax, ay, az, bx, by, bz, cx, cy, cz } = skewedMaterial.Lattice.unitCell;
    const trueCenterCartesian = [(ax + bx + cx) / 2, (ay + by + cy) / 2, (az + bz + cz) / 2];
    const diagonalCenterCartesian = [ax / 2, by / 2, cz / 2];

    addedCoordinate.forEach((component) => expect(component).toBeCloseTo(0.5, 5));
    expect(trueCenterCartesian).not.toEqual(diagonalCenterCartesian);
});

test("Add Atom offsets a new atom that would otherwise land on an existing one", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });
    const instance = wrapper.instance();

    instance.handleAddAtom(); // first click - lands on the true center
    wrapper.update();
    instance.handleAddAtom(); // second click - same target would collide with the first
    wrapper.update();

    const newMaterial = wrapper.state("material");
    const basis = newMaterial.Basis;
    basis.toCartesian(); // OCCUPIED_TOLERANCE/OFFSET_STEP are Cartesian (Å); compare in the same space
    const [first, second] = basis.coordinatesAsArray.slice(-2);
    const distance = Math.sqrt(
        first.reduce((sum, value, idx) => sum + (value - second[idx]) ** 2, 0),
    );
    expect(distance).toBeGreaterThan(0.4);
});

test("Download exports the current edited material, not the pre-edit snapshot (D8)", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });
    const instance = wrapper.instance();

    const modifiedMaterial = new Made.Material({
        ...MATERIAL_CONFIG,
        name: "Edited Structure",
    });
    instance.handleStructureModified(modifiedMaterial);
    wrapper.update();

    const getAsPOSCARSpy = jest.spyOn(wrapper.state("material"), "getAsPOSCAR");
    instance.handleDownloadClick("poscar");

    expect(getAsPOSCARSpy).toHaveBeenCalled();
});

test("Ctrl+Z / Ctrl+Shift+Z undo and redo while edit mode is active", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    document.body.appendChild(container);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });

    try {
        wrapper.find(`${SELECTORS.interactiveIconToolbar} button`).prop("onClick")();
        wrapper.instance().handleToggleEditMode();
        wrapper.update();

        const modifiedMaterial = new Made.Material({ ...MATERIAL_CONFIG, name: "Edited" });
        wrapper.instance().handleStructureModified(modifiedMaterial);
        wrapper.update();
        expect(wrapper.state("historyPointer")).toBe(1);

        container.dispatchEvent(
            new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true }),
        );
        wrapper.update();
        expect(wrapper.state("historyPointer")).toBe(0);

        container.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "z",
                ctrlKey: true,
                shiftKey: true,
                bubbles: true,
            }),
        );
        wrapper.update();
        expect(wrapper.state("historyPointer")).toBe(1);
    } finally {
        document.body.removeChild(container);
    }
});

test("Delete key removes the selected atom while edit mode is active", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    document.body.appendChild(container);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });

    try {
        wrapper.find(`${SELECTORS.interactiveIconToolbar} button`).prop("onClick")();
        wrapper.instance().handleToggleEditMode();
        wrapper.instance().handleSelectionChanged([1]);
        wrapper.update();

        const handleRemoveSelectedAtomSpy = jest.spyOn(
            wrapper.instance(),
            "handleRemoveSelectedAtom",
        );
        container.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete", bubbles: true }));

        expect(handleRemoveSelectedAtomSpy).toHaveBeenCalledTimes(1);
    } finally {
        document.body.removeChild(container);
    }
});

test("onEditModeChanged fires with the new state on every toggle", () => {
    const onEditModeChanged = jest.fn();
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(
        <ThreeDEditor
            material={new Made.Material(MATERIAL_CONFIG)}
            editable
            onEditModeChanged={onEditModeChanged}
        />,
        { attachTo: container },
    );

    wrapper.instance().handleToggleEditMode();
    expect(onEditModeChanged).toHaveBeenLastCalledWith(true);

    wrapper.instance().handleToggleEditMode();
    expect(onEditModeChanged).toHaveBeenLastCalledWith(false);
});

test("canUndo/canRedo reflect the history pointer", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });
    const instance = wrapper.instance();

    expect(instance.canUndo()).toBe(false);
    expect(instance.canRedo()).toBe(false);

    instance.handleStructureModified(new Made.Material({ ...MATERIAL_CONFIG, name: "Edited" }));
    wrapper.update();
    expect(instance.canUndo()).toBe(true);
    expect(instance.canRedo()).toBe(false);

    instance.handleUndo();
    wrapper.update();
    expect(instance.canUndo()).toBe(false);
    expect(instance.canRedo()).toBe(true);
});

test("undo()/redo() ref-API aliases work (spec §6.3 names these undo/redo, not handleUndo/handleRedo)", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });
    const instance = wrapper.instance();

    instance.handleStructureModified(new Made.Material({ ...MATERIAL_CONFIG, name: "Edited" }));
    wrapper.update();
    expect(wrapper.state("historyPointer")).toBe(1);

    instance.undo();
    wrapper.update();
    expect(wrapper.state("historyPointer")).toBe(0);

    instance.redo();
    wrapper.update();
    expect(wrapper.state("historyPointer")).toBe(1);
});

test("selecting an atom does not trigger a full viewer reload (D3/R17)", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });
    const waveComponentInstance = wrapper.find(WaveComponent).instance();
    const reloadViewerSpy = jest.spyOn(waveComponentInstance, "reloadViewer");

    wrapper.instance().handleSelectionChanged([1]);

    expect(reloadViewerSpy).not.toHaveBeenCalled();
});

describe("Parity: group rotate, clone, camera focus, element rename (old-editor parity)", () => {
    test("Rotate mode button is disabled below 2 selected atoms and enabled at 2+", () => {
        const container = createElement("div", ELEMENT_PROPERTIES);
        const wrapper = mount(
            <ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />,
            { attachTo: container },
        );
        // The edit toolbar (and thus the Rotate button) only renders while both interactive and
        // edit mode are active - see renderViewerWithToolbars.
        wrapper.find(`${SELECTORS.interactiveIconToolbar} button`).prop("onClick")();
        wrapper.instance().handleToggleEditMode();
        wrapper.update();
        const findRotateButton = () => wrapper.find(RotateRight).closest("button");

        expect(findRotateButton().prop("disabled")).toBe(true);

        wrapper.instance().handleSelectionChanged([0, 1]);
        wrapper.update();

        expect(findRotateButton().prop("disabled")).toBeFalsy();

        wrapper.instance().handleSelectionChanged([0]);
        wrapper.update();

        expect(findRotateButton().prop("disabled")).toBe(true);
    });

    test("Dropping the selection below 2 atoms while rotate mode is active auto-reverts to translate", () => {
        const container = createElement("div", ELEMENT_PROPERTIES);
        const wrapper = mount(
            <ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />,
            { attachTo: container },
        );
        const instance = wrapper.instance();
        const { wave } = wrapper.find(WaveComponent).instance();
        const setTransformModeSpy = jest.spyOn(wave, "setTransformMode");

        instance.handleSelectionChanged([0, 1]);
        instance.handleSetTransformMode("rotate");
        wrapper.update();
        expect(wrapper.state("activeTransformMode")).toBe("rotate");

        instance.handleSelectionChanged([0]);
        wrapper.update();

        expect(wrapper.state("activeTransformMode")).toBe("translate");
        expect(setTransformModeSpy).toHaveBeenLastCalledWith("translate");

        // A group selection (or no selection at all) leaves an already-active translate mode
        // alone - only a rotate-mode selection drop below 2 forces a mode change.
        setTransformModeSpy.mockClear();
        instance.handleSelectionChanged([]);
        wrapper.update();
        expect(wrapper.state("activeTransformMode")).toBe("translate");
        expect(setTransformModeSpy).not.toHaveBeenCalled();
    });

    test("Clone and Focus toolbar actions delegate to the wave instance", () => {
        const container = createElement("div", ELEMENT_PROPERTIES);
        const wrapper = mount(
            <ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />,
            { attachTo: container },
        );
        const instance = wrapper.instance();
        const { wave } = wrapper.find(WaveComponent).instance();
        const cloneSpy = jest.spyOn(wave, "cloneSelectedAtoms");
        const focusSpy = jest.spyOn(wave, "focusCameraOnSelection");

        instance.handleCloneSelectedAtoms();
        instance.handleFocusCameraOnSelection();

        expect(cloneSpy).toHaveBeenCalledTimes(1);
        expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    test("Element field commits a case-insensitive valid rename as a single history entry", () => {
        const container = createElement("div", ELEMENT_PROPERTIES);
        const wrapper = mount(
            <ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />,
            { attachTo: container },
        );
        const instance = wrapper.instance();
        const handleStructureModifiedSpy = jest.spyOn(instance, "handleStructureModified");

        instance.handleSelectionChanged([0]);
        instance.handleElementDraftChange("fe");
        expect(handleStructureModifiedSpy).not.toHaveBeenCalled();
        wrapper.update();
        expect(wrapper.state("elementDraft")).toBe("fe");

        instance.handleElementCommit();

        expect(handleStructureModifiedSpy).toHaveBeenCalledTimes(1);
        wrapper.update();
        expect(wrapper.state("elementDraft")).toBeNull();
        const element = wrapper.state("material").basis.elements[0];
        const symbol = typeof element === "string" ? element : element.value;
        expect(symbol).toBe("Fe");
    });

    test("Element field reverts silently on an unrecognized element name", () => {
        const container = createElement("div", ELEMENT_PROPERTIES);
        const wrapper = mount(
            <ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />,
            { attachTo: container },
        );
        const instance = wrapper.instance();
        const handleStructureModifiedSpy = jest.spyOn(instance, "handleStructureModified");

        instance.handleSelectionChanged([0]);
        instance.handleElementDraftChange("Xx");
        instance.handleElementCommit();

        expect(handleStructureModifiedSpy).not.toHaveBeenCalled();
        wrapper.update();
        expect(wrapper.state("elementDraft")).toBeNull();
        const element = wrapper.state("material").basis.elements[0];
        const symbol = typeof element === "string" ? element : element.value;
        expect(symbol).toBe("Si");
    });

    test("Committing the element field with the same element already set is a no-op", () => {
        const container = createElement("div", ELEMENT_PROPERTIES);
        const wrapper = mount(
            <ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />,
            { attachTo: container },
        );
        const instance = wrapper.instance();
        const handleStructureModifiedSpy = jest.spyOn(instance, "handleStructureModified");

        // MATERIAL_CONFIG's atom 0 is already "Si".
        instance.handleSelectionChanged([0]);
        instance.handleElementDraftChange("Si");
        instance.handleElementCommit();

        expect(handleStructureModifiedSpy).not.toHaveBeenCalled();
    });

    test("Element rename is a no-op unless exactly one atom is selected", () => {
        const container = createElement("div", ELEMENT_PROPERTIES);
        const wrapper = mount(
            <ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />,
            { attachTo: container },
        );
        const instance = wrapper.instance();
        const handleStructureModifiedSpy = jest.spyOn(instance, "handleStructureModified");

        instance.handleSelectionChanged([0, 1]);
        instance.handleElementDraftChange("Fe");
        instance.handleElementCommit();

        expect(handleStructureModifiedSpy).not.toHaveBeenCalled();
    });
});

// Everything above drives ThreeDEditor's own handler methods directly (instance.handleX()) or
// clicks real toolbar buttons - it proves the React-level wiring, but never exercises a real
// pointer gesture against the mounted wave's canvas, nor the full host round-trip a gizmo commit
// triggers (wave commit -> onStructureModified -> React setState -> _applyMaterialToViewer's own
// second setStructure()+rebuildScene()). That full loop is exactly where a real regression hid
// (rebuildScene() silently collapsing a multi-selection - see interactive_structure_editor.js's
// own "host round-trip" tests) and no test at either layer alone would have caught it: the mixin
// tests never go through React's callback, and the tests above never dispatch a real pointer
// gesture. These tests close that gap by mounting the real component and driving its real,
// running wave instance with the same helpers the mixin suite uses.
describe("Full-stack regression: pre-existing interactions survive through the real, mounted component", () => {
    function mountEditableEditor() {
        const container = createElement("div", ELEMENT_PROPERTIES);
        const wrapper = mount(
            <ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />,
            { attachTo: container },
        );
        wrapper.instance().handleToggleEditMode();
        const { wave } = wrapper.find(WaveComponent).instance();
        // WaveComponent renders its own inner <div ref> as the Wave's actual canvas container -
        // a real React-created node, not the outer `container` above - so it never picks up
        // ELEMENT_PROPERTIES' clientWidth/clientHeight overrides, and the renderer sizes itself
        // to 0x0 in jsdom (no real layout engine). Force the drawing-buffer size directly so
        // raycasting-based pointer tests (real pixel<->NDC math) behave like a real browser,
        // matching what the bare getWaveInstance() harness gets "for free" via ELEMENT_PROPERTIES.
        wave.renderer.setSize(WIDTH, HEIGHT);
        stubCanvasRect(wave);
        return { wrapper, wave };
    }

    test("A real click on an atom selects it end-to-end (mixin -> onSelectionChanged -> React state)", () => {
        const { wrapper, wave } = mountEditableEditor();

        const [firstAtom] = wave.collectSelectableAtoms();
        simulateClick(wave, firstAtom);
        wrapper.update();

        expect(wrapper.state("selectedAtomIndices")).toEqual([firstAtom.userData.atomicIndex]);
    });

    test("A real click-and-drag move commits through the full host round-trip and updates the material", () => {
        const { wrapper, wave } = mountEditableEditor();

        const [firstAtom] = wave.collectSelectableAtoms();
        const { startPosition, endPosition } = simulateAtomDrag(wave, firstAtom, 40, 30);
        wrapper.update();

        expect(startPosition.equals(endPosition)).toBe(false);
        expect(wrapper.state("historyPointer")).toBe(1);

        const basis = wrapper.state("material").Basis;
        basis.toCartesian();
        const committed = basis.coordinatesAsArray[firstAtom.userData.atomicIndex];
        expect(committed[0]).toBeCloseTo(endPosition.x, 5);
        expect(committed[1]).toBeCloseTo(endPosition.y, 5);
        expect(committed[2]).toBeCloseTo(endPosition.z, 5);
    });

    test("Shift+click multi-select works end-to-end through the mounted component", () => {
        const { wrapper, wave } = mountEditableEditor();

        const [firstAtom, secondAtom] = wave.collectSelectableAtoms();
        simulateClick(wave, firstAtom);
        const coords = projectMeshToScreen(wave, secondAtom);
        wave.handlePointerDownCapture_({ clientX: coords.x, clientY: coords.y, shiftKey: true });
        wave.handlePointerUpCapture_({ clientX: coords.x, clientY: coords.y, shiftKey: true });
        wrapper.update();

        expect(wrapper.state("selectedAtomIndices").slice().sort()).toEqual(
            [firstAtom, secondAtom].map((atom) => atom.userData.atomicIndex).sort(),
        );
    });

    test("Marquee (click-and-drag on empty space) multi-select works end-to-end through the mounted component", () => {
        const { wrapper, wave } = mountEditableEditor();

        const atoms = wave.collectSelectableAtoms();
        const screenPoints = atoms.map((atom) => projectMeshToScreen(wave, atom));
        const margin = 60;
        const rectStart = {
            x: Math.min(...screenPoints.map((p) => p.x)) - margin,
            y: Math.min(...screenPoints.map((p) => p.y)) - margin,
        };
        const rectEnd = {
            x: Math.max(...screenPoints.map((p) => p.x)) + margin,
            y: Math.max(...screenPoints.map((p) => p.y)) + margin,
        };
        simulateMarqueeSelect(wave, rectStart, rectEnd);
        wrapper.update();

        expect(wrapper.state("selectedAtomIndices").slice().sort()).toEqual(
            atoms.map((atom) => atom.userData.atomicIndex).sort(),
        );
    });

    test("Group translate via the gizmo survives the REAL host round-trip - a second group translate still works", () => {
        const { wrapper, wave } = mountEditableEditor();

        const atoms = wave.collectSelectableAtoms();
        wave.setSelectedAtomMeshes(atoms);
        const starts = atoms.map((atom) => atom.position.clone());

        const translateOnce = () => {
            wave.transformControls_.dragging = true;
            wave.selectionPivot_.position.x += 1;
            wave.transformControls_.dispatchEvent({ type: "change" });
            wave.transformControls_.dispatchEvent({ type: "mouseUp" });
            wave.transformControls_.dragging = false;
        };

        translateOnce();
        wrapper.update();
        // handleStructureModified's setState callback synchronously calls
        // _applyMaterialToViewer, which independently calls setStructure()+rebuildScene() AGAIN
        // on top of the mixin's own commit - this is the real host round-trip, not a simulation
        // of it.
        expect(wrapper.state("historyPointer")).toBe(1);
        expect(wave.selectedMeshes_.length).toBe(atoms.length);
        expect(wave.transformControls_.object).toBe(wave.selectionPivot_);

        translateOnce();
        wrapper.update();

        expect(wrapper.state("historyPointer")).toBe(2);
        expect(wave.selectedMeshes_.length).toBe(atoms.length);
        const finalAtoms = wave.collectSelectableAtoms();
        starts.forEach((start, index) => {
            expect(finalAtoms[index].position.x - start.x).toBeCloseTo(2, 5);
        });
    });

    test("Group rotate via the gizmo survives the REAL host round-trip - a second group rotate still works (regression)", () => {
        const { wrapper, wave } = mountEditableEditor();

        const atoms = wave.collectSelectableAtoms();
        wave.setSelectedAtomMeshes(atoms);
        wave.setTransformMode("rotate");

        const rotateOnce = () => {
            wave.transformControls_.dragging = true;
            wave.selectionPivot_.quaternion.setFromAxisAngle(
                new THREE.Vector3(0, 0, 1),
                Math.PI / 4,
            );
            wave.transformControls_.dispatchEvent({ type: "change" });
            wave.transformControls_.dispatchEvent({ type: "mouseUp" });
            wave.transformControls_.dragging = false;
        };

        rotateOnce();
        wrapper.update();
        expect(wrapper.state("historyPointer")).toBe(1);
        // This is exactly what rebuildScene()'s pre-fix bug broke: the host's own
        // onStructureModified round-trip (triggered above via real React state, not simulated)
        // used to collapse the selection to one atom, silently detaching the gizmo from the
        // pivot and making a second group rotate impossible.
        expect(wave.selectedMeshes_.length).toBe(atoms.length);
        expect(wave.transformControls_.object).toBe(wave.selectionPivot_);

        const beforeSecond = wave.collectSelectableAtoms().map((atom) => atom.position.clone());
        rotateOnce();
        wrapper.update();
        const afterSecond = wave.collectSelectableAtoms().map((atom) => atom.position.clone());

        expect(wrapper.state("historyPointer")).toBe(2);
        expect(wave.selectedMeshes_.length).toBe(atoms.length);
        beforeSecond.forEach((position, index) => {
            expect(position.distanceTo(afterSecond[index])).toBeGreaterThan(1e-3);
        });
    });

    test("Undo after a group move restores original positions and keeps the group selected", () => {
        const { wrapper, wave } = mountEditableEditor();

        const atoms = wave.collectSelectableAtoms();
        wave.setSelectedAtomMeshes(atoms);
        const starts = atoms.map((atom) => atom.position.clone());

        wave.transformControls_.dragging = true;
        wave.selectionPivot_.position.x += 1;
        wave.transformControls_.dispatchEvent({ type: "change" });
        wave.transformControls_.dispatchEvent({ type: "mouseUp" });
        wave.transformControls_.dragging = false;
        wrapper.update();
        expect(wrapper.state("historyPointer")).toBe(1);

        wrapper.instance().handleUndo();
        wrapper.update();

        expect(wrapper.state("historyPointer")).toBe(0);
        const restoredAtoms = wave.collectSelectableAtoms();
        starts.forEach((start, index) => {
            expect(restoredAtoms[index].position.distanceTo(start)).toBeLessThan(1e-6);
        });
    });

    test("Clone via the real toolbar handler, then a real click-drag on the clone, both commit correctly", () => {
        const { wrapper, wave } = mountEditableEditor();

        const initialCount = wave.collectSelectableAtoms().length;
        const [firstAtom] = wave.collectSelectableAtoms();
        wave.setSelectedAtomMeshes([firstAtom]);

        wrapper.instance().handleCloneSelectedAtoms();
        wrapper.update();
        expect(wrapper.state("historyPointer")).toBe(1);

        const atomsAfterClone = wave.collectSelectableAtoms();
        expect(atomsAfterClone.length).toBe(initialCount + 1);
        const clone = atomsAfterClone[atomsAfterClone.length - 1];
        expect(wave.selectedMeshes_).toEqual([clone]);

        const { startPosition, endPosition } = simulateAtomDrag(wave, clone, 30, 20);
        wrapper.update();

        expect(startPosition.equals(endPosition)).toBe(false);
        expect(wrapper.state("historyPointer")).toBe(2);
    });
});

describe("TB-persona review fixes (PR #204 round 1-2)", () => {
    test("onSelectionChanged prop fires with the current indices whenever the selection changes (spec §6.2)", () => {
        const onSelectionChanged = jest.fn();
        const container = createElement("div", ELEMENT_PROPERTIES);
        const wrapper = mount(
            <ThreeDEditor
                material={new Made.Material(MATERIAL_CONFIG)}
                editable
                onSelectionChanged={onSelectionChanged}
            />,
            { attachTo: container },
        );

        wrapper.instance().handleSelectionChanged([1]);
        expect(onSelectionChanged).toHaveBeenLastCalledWith([1]);

        wrapper.instance().handleSelectionChanged([0, 1]);
        expect(onSelectionChanged).toHaveBeenLastCalledWith([0, 1]);

        wrapper.instance().handleSelectionChanged([]);
        expect(onSelectionChanged).toHaveBeenLastCalledWith([]);
    });

    test("Undo across an atom-count change (Add Atom, then undo) clears the stale selection instead of leaving it pointing at a deleted atom", () => {
        // Full-stack regression for the same underlying bug the mixin-level test drives directly
        // against wave.rebuildScene(): this proves it end to end through the real
        // handleUndo -> _applyMaterialToViewer -> wave.setStructure()+rebuildScene() path.
        const onSelectionChanged = jest.fn();
        const container = createElement("div", ELEMENT_PROPERTIES);
        const wrapper = mount(
            <ThreeDEditor
                material={new Made.Material(MATERIAL_CONFIG)}
                editable
                onSelectionChanged={onSelectionChanged}
            />,
            { attachTo: container },
        );
        const instance = wrapper.instance();
        instance.handleToggleEditMode();

        instance.handleAddAtom();
        wrapper.update();
        const addedIndex = wrapper.state("selectedAtomIndices")[0];
        expect(addedIndex).toBeGreaterThanOrEqual(0);

        instance.handleUndo();
        wrapper.update();

        expect(wrapper.state("selectedAtomIndices")).toEqual([]);
        expect(onSelectionChanged).toHaveBeenLastCalledWith([]);
    });
});

describe("onEditCommit host callback (spec §6.2)", () => {
    function mountWithOnEditCommit() {
        const onEditCommit = jest.fn();
        const container = createElement("div", ELEMENT_PROPERTIES);
        const wrapper = mount(
            <ThreeDEditor
                material={new Made.Material(MATERIAL_CONFIG)}
                editable
                onEditCommit={onEditCommit}
            />,
            { attachTo: container },
        );
        return { wrapper, onEditCommit };
    }

    test("Fires alongside onUpdate, with {source: 'coordinate-input'}, for a typed coordinate edit", () => {
        const { wrapper, onEditCommit } = mountWithOnEditCommit();
        const instance = wrapper.instance();

        instance.handleSelectionChanged([1]);
        instance.handleCoordinateDraftChange(0, "0.42");
        instance.handleCoordinateCommit(0);

        expect(onEditCommit).toHaveBeenCalledTimes(1);
        const [material, meta] = onEditCommit.mock.calls[0];
        expect(material).toBe(wrapper.state("material"));
        expect(meta).toEqual({ source: "coordinate-input" });
    });

    test("Fires with {source: 'element-input'} for a typed element rename", () => {
        const { wrapper, onEditCommit } = mountWithOnEditCommit();
        const instance = wrapper.instance();

        instance.handleSelectionChanged([0]);
        instance.handleElementDraftChange("fe");
        instance.handleElementCommit();

        expect(onEditCommit).toHaveBeenCalledTimes(1);
        const [, meta] = onEditCommit.mock.calls[0];
        expect(meta).toEqual({ source: "element-input" });
    });

    test("Fires with {source: 'add'} for Add Atom, forwarded from the mixin's own source tag", () => {
        const { wrapper, onEditCommit } = mountWithOnEditCommit();
        wrapper.instance().handleAddAtom();

        expect(onEditCommit).toHaveBeenCalledTimes(1);
        const [, meta] = onEditCommit.mock.calls[0];
        expect(meta).toEqual({ source: "add" });
    });

    test("Fires with {source: 'undo'} / {source: 'redo'} for undo/redo, distinct from the edit's own source", () => {
        const { wrapper, onEditCommit } = mountWithOnEditCommit();
        const instance = wrapper.instance();

        instance.handleAddAtom();
        expect(onEditCommit).toHaveBeenLastCalledWith(expect.anything(), { source: "add" });

        instance.handleUndo();
        expect(onEditCommit).toHaveBeenLastCalledWith(expect.anything(), { source: "undo" });

        instance.handleRedo();
        expect(onEditCommit).toHaveBeenLastCalledWith(expect.anything(), { source: "redo" });

        expect(onEditCommit).toHaveBeenCalledTimes(3);
    });

    test("Is not required - omitting the prop does not throw on commit", () => {
        const container = createElement("div", ELEMENT_PROPERTIES);
        const wrapper = mount(
            <ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />,
            { attachTo: container },
        );

        expect(() => wrapper.instance().handleAddAtom()).not.toThrow();
    });
});
