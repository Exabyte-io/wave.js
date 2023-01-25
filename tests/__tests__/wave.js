import { getWaveInstance } from "../enums";
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
