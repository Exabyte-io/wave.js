import { getWaveInstance, getFeOWaveInstance } from "../enums";
import { takeSnapshotAndAssertEqualityAsync } from "../utils";

test("wave", async () => {
    const wave = getWaveInstance();
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "wave");
});

test("atomRadiiScale", async () => {
    const wave = getWaveInstance();
    wave.updateSettings({ atomRadiiScale: 0.5 });
    wave.rebuildScene();
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "atomRadiiScale");
});

test("atomRepetitions", async () => {
    const wave = getWaveInstance();
    wave.updateSettings({ repetitions: 2 });
    wave.rebuildScene();
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "atomRepetitions");
});

test("colorsOfAtomsWithLabels", async () => {
    const wave = getFeOWaveInstance();
    // zoom-out to get full view of the cell
    wave.toggleOrbitControls();
    wave.renderer.domElement.dispatchEvent(new WheelEvent("wheel", { deltaY: 1 }));
    wave.renderer.domElement.dispatchEvent(new WheelEvent("wheel", { deltaY: 1 }));
    wave.renderer.domElement.dispatchEvent(new WheelEvent("wheel", { deltaY: 1 }));
    wave.renderer.domElement.dispatchEvent(new WheelEvent("wheel", { deltaY: 1 }));
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "colorsOfAtomsWithLabels");
});
