import expect from "expect";

import { getWaveInstance } from "../../enums";
import { takeSnapshotAndAssertEqualityAsync } from "../../utils";

describe("Bonds functionality tests", () => {
    test("Default state - bonds disabled", () => {
        const wave = getWaveInstance({});
        expect(wave.isDrawBondsEnabled).toBe(false);
        // No bonds should be drawn in the default state
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "wave");
    });

    test("Toggling bonds on", () => {
        const wave = getWaveInstance();
        wave.updateSettings({ atomRadiiScale: 0.2, chemicalConnectivityFactor: 1.05 });

        expect(wave.isDrawBondsEnabled).toBe(false);

        wave.isDrawBondsEnabled = true;
        wave.rebuildScene();

        expect(wave.isDrawBondsEnabled).toBe(true);

        return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "bonds_enabled");
    });

    test("Bonds with unit cell repetition", () => {
        const wave = getWaveInstance();
        wave.updateSettings({
            atomRadiiScale: 0.2,
            chemicalConnectivityFactor: 1.05,
            repetitionsAlongLatticeVectorA: 2,
            repetitionsAlongLatticeVectorB: 2,
            repetitionsAlongLatticeVectorC: 1,
        });
        wave.isDrawBondsEnabled = true;
        wave.rebuildScene();

        return takeSnapshotAndAssertEqualityAsync(
            wave.renderer.getContext(),
            "bonds_with_repetition",
        );
    });
});
