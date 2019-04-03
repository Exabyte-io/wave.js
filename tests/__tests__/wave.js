import {getWaveInstance} from "../enums";
import {takeSnapshotAndAssertEqualityAsync} from "../utils";

test('wave', async () => {
    const wave = getWaveInstance();
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "wave");
});

test('atomRadiiScale', async () => {
    const wave = getWaveInstance();
    wave.updateSettings({atomRadiiScale: 0.5});
    wave.rebuildScene();
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "atomRadiiScale");
});

test('repetitions', async () => {
    const wave = getWaveInstance();
    wave.updateSettings({repetitions: 2});
    wave.rebuildScene();
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "repetitions");
});
