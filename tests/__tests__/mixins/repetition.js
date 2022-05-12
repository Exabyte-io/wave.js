import { getWaveInstance } from "../../enums";
import { takeSnapshotAndAssertEqualityAsync } from "../../utils";

describe('Screen tests for axes', () => {
    const settings = {
        atomRadiiScale: 0.2,
        XRepetitions: 1,
        YRepetitions: 1,
        ZRepetitions: 1,
    }

    test('X axis', () => {
        const wave = getWaveInstance({ ...settings, XRepetitions: 3 });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "XAxis");
    })
    test('Y axis', () => {
        const wave = getWaveInstance({ ...settings, YRepetitions: 3 });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "YAxis");
    })
    test('Z axis', () => {
        const wave = getWaveInstance({ ...settings, ZRepetitions: 3 });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "ZAxis");
    })
    test('XY axis', () => {
        const wave = getWaveInstance({ ...settings, XRepetitions: 3, YRepetitions: 3 });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "XYAxis");
    })
    test('XZ axis', () => {
        const wave = getWaveInstance({ ...settings, XRepetitions: 3, ZRepetitions: 3 });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "XZAxis");
    })
    test('YZ axis', () => {
        const wave = getWaveInstance({ ...settings, YRepetitions: 3, ZRepetitions: 3 });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "YZAxis");
    })
    test('XYZ axis', () => {
        const wave = getWaveInstance({ ...settings, XRepetitions: 3, YRepetitions: 3, ZRepetitions: 3 });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "XYZAxis");
    })
})
