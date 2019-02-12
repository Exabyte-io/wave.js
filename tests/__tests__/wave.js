import {getWaveInstance} from "../enums";
import {takeSnapshotAndAssertEquality} from "../utils";

test('draw silicon', async () => {
    const wave = getWaveInstance();
    return takeSnapshotAndAssertEquality(wave.renderer.context, "si");
});

test('draw silicon with toggled axes', async () => {
    const wave = getWaveInstance();
    wave.toggleAxes();
    return takeSnapshotAndAssertEquality(wave.renderer.context, "siWithAxes");
});
