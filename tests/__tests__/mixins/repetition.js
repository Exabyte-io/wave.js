import { getWaveInstance } from "../../enums";
import { takeSnapshotAndAssertEqualityAsync } from "../../utils";

describe('Screen tests for repeats', () => {
    const settings = {
        atomRadiiScale: 0.2,
        repetitionsAlongLatticeVectorA: 1,
        repetitionsAlongLatticeVectorB: 1,
        repetitionsAlongLatticeVectorC: 1,
    }

    test('Repeat along lattice vector A', () => {
        const wave = getWaveInstance({ ...settings, repetitionsAlongLatticeVectorA: 3 });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "vectorA");
    })
    test('Repeat along lattice vector B', () => {
        const wave = getWaveInstance({ ...settings, repetitionsAlongLatticeVectorB: 3 });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "vectorB");
    })
    test('Repeat along lattice vector С', () => {
        const wave = getWaveInstance({ ...settings, repetitionsAlongLatticeVectorC: 3 });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "vectorC");
    })
    test('Repeat along lattice vectors A and B', () => {
        const wave = getWaveInstance({ ...settings, repetitionsAlongLatticeVectorA: 3, repetitionsAlongLatticeVectorB: 3 });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "vectorAB");
    })
    test('Repeat along lattice vectors A and C', () => {
        const wave = getWaveInstance({ ...settings, repetitionsAlongLatticeVectorA: 3, repetitionsAlongLatticeVectorC: 3 });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "vectorAC");
    })
    test('Repeat along lattice vectors B and C', () => {
        const wave = getWaveInstance({ ...settings, repetitionsAlongLatticeVectorB: 3, repetitionsAlongLatticeVectorC: 3 });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "vectorBC");
    })
    test('Repeat along lattice vectors ABC', () => {
        const wave = getWaveInstance({ ...settings, repetitionsAlongLatticeVectorA: 3, repetitionsAlongLatticeVectorB: 3, repetitionsAlongLatticeVectorC: 3 });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "vectorABC");
    })
})
