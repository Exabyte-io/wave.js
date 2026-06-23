import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";
import { Made } from "@mat3ra/made";
import { Wave } from "../../src/wave";
import { createElement, HEIGHT, WIDTH } from "../utils";

const ELEMENT_PROPERTIES = {
    width: { value: WIDTH },
    height: { value: HEIGHT },
    clientWidth: { value: WIDTH },
    clientHeight: { value: HEIGHT },
};

const jsonFilePath = path.resolve(__dirname, "../../AsGa_HfO2_interface.json");

test("Stress-Test Wave.js performance on AsGa_HfO2_interface.json (10x10x10)", async () => {
    // 1. Load JSON
    const t0 = performance.now();
    const config = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
    const material = new Made.Material(config);
    const t1 = performance.now();
    console.log(`[Stress-Test] Load and Parse JSON: ${(t1 - t0).toFixed(2)} ms`);

    // 2. Initialize Wave
    const t2 = performance.now();
    const wave = new Wave({
        DOMElement: createElement("div", ELEMENT_PROPERTIES),
        structure: material,
        cell: material.Lattice.unitCell,
        settings: {
            atomRadiiScale: 0.2,
            repetitions: 1,
            isDrawBondsEnabled: true,
        },
    });
    const t3 = performance.now();
    console.log(`[Stress-Test] Initialize Wave with Bonds: ${(t3 - t2).toFixed(2)} ms`);

    // 3. Adjust repetitions to 10x10x10
    const t4 = performance.now();
    wave.updateSettings({
        repetitionsAlongLatticeVectorA: 10,
        repetitionsAlongLatticeVectorB: 10,
        repetitionsAlongLatticeVectorC: 10,
    });
    wave.rebuildScene();
    const t5 = performance.now();
    console.log(`[Stress-Test] Adjust repetitions (10x10x10) with bonds and rebuildScene: ${(t5 - t4).toFixed(2)} ms`);

    // 4. Rotate the structure (Simulating Orbiting)
    const t6 = performance.now();
    const STEPS = 60;
    for (let i = 0; i < STEPS; i++) {
        wave.structureGroup.rotateY(Math.PI / 30);
        wave.render();
    }
    const t7 = performance.now();
    console.log(`[Stress-Test] Rotate structure 60 frames: ${(t7 - t6).toFixed(2)} ms (${((t7 - t6) / STEPS).toFixed(2)} ms/frame)`);
});
