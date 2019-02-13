import {getWaveInstance} from "../enums";
import {takeSnapshotAndAssertEquality} from "../utils";

test('wave', async () => {
    const wave = getWaveInstance();
    return takeSnapshotAndAssertEquality(wave.renderer.context, "wave");
});

test('atomRadiiScale', async () => {
    const wave = getWaveInstance();
    wave.updateSettings({atomRadiiScale: 0.5});
    wave.rebuildScene();
    return takeSnapshotAndAssertEquality(wave.renderer.context, "atomRadiiScale");
});

test('atomRepetitions', async () => {
    const wave = getWaveInstance();
    wave.updateSettings({atomRepetitions: 2});
    wave.rebuildScene();
    return takeSnapshotAndAssertEquality(wave.renderer.context, "atomRepetitions");
});
