import { Made } from "@mat3ra/made";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";

import { ThreeDEditor } from "../../../src/components/ThreeDEditor";
import { WaveComponent } from "../../../src/components/WaveComponent";
import settings from "../../../src/settings";
import { ELEMENT_PROPERTIES, getWaveInstance, MATERIAL_CONFIG, WAVE_SETTINGS } from "../../enums";
import { SELECTORS } from "../../selectors";
import { createElement, takeSnapshotAndAssertEqualityAsync } from "../../utils";

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

    const handleSetMaterialSpy = jest.spyOn(wrapper.instance(), "handleSetMaterial");

    window.dispatchEvent(
        new MessageEvent("message", {
            data: {
                action: "handleSetMaterial",
                parameters: [MATERIAL_CONFIG],
            },
        }),
    );

    expect(handleSetMaterialSpy).not.toHaveBeenCalled();
});

test("an echoed material prop with identical content does not wipe history or selection (D16)", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });

    wrapper.instance().handleSelectionChanged(1);
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
    expect(wrapper.state("selectedAtomIndex")).toBe(1);

    // A host that stores our own emitted material and passes it straight back as a prop (the
    // common "lift state up" pattern) must not have its own echo wipe what we just built.
    wrapper.setProps({ material: wrapper.state("material") });
    wrapper.update();

    expect(wrapper.state("historyStack").length).toBe(2);
    expect(wrapper.state("selectedAtomIndex")).toBe(1);

    // A genuinely different material DOES reset.
    wrapper.setProps({ material: new Made.Material(MATERIAL_CONFIG) });
    wrapper.update();

    expect(wrapper.state("historyStack").length).toBe(1);
    expect(wrapper.state("selectedAtomIndex")).toBeNull();
});

test("coordinate field commits once on blur, not per keystroke (D18)", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });
    const instance = wrapper.instance();
    const handleStructureModifiedSpy = jest.spyOn(instance, "handleStructureModified");

    instance.handleSelectionChanged(1);
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

    instance.handleSelectionChanged(1);
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
        wrapper.instance().handleSelectionChanged(1);
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

test("selecting an atom does not trigger a full viewer reload (D3/R17)", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} editable />, {
        attachTo: container,
    });
    const waveComponentInstance = wrapper.find(WaveComponent).instance();
    const reloadViewerSpy = jest.spyOn(waveComponentInstance, "reloadViewer");

    wrapper.instance().handleSelectionChanged(1);

    expect(reloadViewerSpy).not.toHaveBeenCalled();
});
