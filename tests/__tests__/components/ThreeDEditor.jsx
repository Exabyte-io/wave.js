import { Made } from "@exabyte-io/made.js";
import { mount } from "enzyme";
import React from "react";

import { ThreeDEditor } from "../../../src/components/ThreeDEditor";
import { ThreejsEditorModal } from "../../../src/components/ThreejsEditorModal";
import { ELEMENT_PROPERTIES, getWaveInstance, MATERIAL_CONFIG, WAVE_SETTINGS } from "../../enums";
import { SELECTORS } from "../../selectors";
import { createElement, takeSnapshotAndAssertEqualityAsync } from "../../utils";
import { WaveComponent } from "../../../src/components/WaveComponent";

jest.mock("../../../src/components/ThreejsEditorModal", () => ({
    __esModule: true,
    ThreejsEditorModal: () => {
        return <div data-name="threejs-editor-modal-content" />;
    },
}));

test("toggleInteractive", () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)} />, {
        attachTo: container,
    });

    // assert view and export buttons are hidden
    expect(wrapper.find(SELECTORS.viewIconToolbar).hasClass("hidden")).toBe(true);
    expect(wrapper.find(SELECTORS.exportIconToolbar).hasClass("hidden")).toBe(true);

    const interactiveButton = wrapper.find(`${SELECTORS.interactiveIconToolbar} button`);
    interactiveButton.prop("onClick")();
    wrapper.update();

    // assert view and export buttons are visible
    expect(wrapper.find(SELECTORS.viewIconToolbar).hasClass("hidden")).toBe(false);
    expect(wrapper.find(SELECTORS.exportIconToolbar).hasClass("hidden")).toBe(false);
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
    expect(wrapper.find(SELECTORS.toggleAxesRoundIconButton).exists()).toBe(false);

    const viewButton = wrapper.find(`${SELECTORS.viewIconToolbar} button`);
    viewButton.prop("onClick")();
    wrapper.update();

    // assert toggle axes button is visible
    expect(wrapper.find(SELECTORS.toggleAxesRoundIconButton).exists()).toBe(true);
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
    const threeJsEditorModal = wrapper.find(ThreejsEditorModal);
    threeJsEditorModal.prop("onHide")(modifiedMaterial);
    wrapper.update();

    // Get updated instance of wave and compare it with snapshot
    const { wave } = wrapper.find(WaveComponent).instance();
    const waveInstance = getWaveInstance(WAVE_SETTINGS, wave.structure);

    return takeSnapshotAndAssertEqualityAsync(
        waveInstance.renderer.context,
        "preserveThreeJsEditorChanges",
    );
});
