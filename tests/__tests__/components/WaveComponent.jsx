import { Made } from "@mat3ra/made";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import expect from "expect";
import React from "react";

import { WaveComponent } from "../../../src/components/WaveComponent";
import { ELEMENT_PROPERTIES, MATERIAL_CONFIG, WAVE_SETTINGS } from "../../enums";
import { createElement } from "../../utils";

Enzyme.configure({ adapter: new Adapter() });
const { mount } = Enzyme;

const material = new Made.Material(MATERIAL_CONFIG);
const baseCell = material.Lattice.unitCell;

function mountWaveComponent() {
    const container = createElement("div", ELEMENT_PROPERTIES);
    return mount(
        <WaveComponent
            cell={baseCell}
            structure={material}
            settings={WAVE_SETTINGS}
            boundaryConditions={{}}
            isConventionalCellShown={false}
            isDrawBondsEnabled={false}
            isViewAdjustable
            triggerHandleResize={false}
        />,
        { attachTo: container },
    );
}

function createWaveComponentInstance(cell) {
    return new WaveComponent({
        cell,
        structure: material,
        settings: WAVE_SETTINGS,
        boundaryConditions: {},
        isConventionalCellShown: false,
        isDrawBondsEnabled: false,
        isViewAdjustable: true,
        triggerHandleResize: false,
    });
}

test("does not re-adjust the camera for sub-tolerance cell noise", () => {
    // Real-world reconstruction-noise values (~1e-7) observed after a scene-vertex round trip.
    const cellA = { ...baseCell, ax: 3.348920236434424 };
    const cellB = { ...baseCell, ax: 3.348920345306396 };

    const instance = createWaveComponentInstance(cellA);

    expect(instance.shouldViewerAdjust({ cell: cellB })).toBe(false);
});

test("re-adjusts on a genuine cell change", () => {
    const cellA = baseCell;
    // A genuinely different lattice: differences on the order of 0.1 Angstrom or more.
    const cellB = { ...baseCell, ax: baseCell.ax + 0.5 };

    const instance = createWaveComponentInstance(cellA);

    expect(instance.shouldViewerAdjust({ cell: cellB })).toBe(true);
});

test("re-adjusts on a units mismatch even when numeric fields are identical", () => {
    const cellA = { ...baseCell, units: "crystal" };
    const cellB = { ...baseCell, units: "cartesian" };

    const instance = createWaveComponentInstance(cellA);

    expect(instance.shouldViewerAdjust({ cell: cellB })).toBe(true);
});

test("unmounting disposes the wave instance (D15)", () => {
    const wrapper = mountWaveComponent();
    const { wave } = wrapper.instance();
    const disposeSpy = jest.spyOn(wave, "dispose");

    wrapper.unmount();

    expect(disposeSpy).toHaveBeenCalledTimes(1);
});

test("re-initializing the viewer disposes the previous wave instance first (D15)", () => {
    const wrapper = mountWaveComponent();
    const instance = wrapper.instance();
    const originalWave = instance.wave;
    const disposeSpy = jest.spyOn(originalWave, "dispose");

    instance.initViewer();

    expect(disposeSpy).toHaveBeenCalledTimes(1);
    expect(instance.wave).not.toBe(originalWave);
});
