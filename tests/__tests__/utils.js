import { Made } from "@mat3ra/made";
import expect from "expect";

import { ThreeDSceneDataToMaterial } from "../../src/utils";
import { Wave } from "../../src/wave";
import { ELEMENT_PROPERTIES, MATERIAL_CONFIG } from "../enums";
import { createElement } from "../utils";

/**
 * Builds a real Wave instance (not the getWaveInstance() helper from enums.js, since that one
 * does not forward boundaryConditions) directly on top of the fixture material used throughout
 * the rest of the test suite.
 */
function buildWave({ settings = {}, boundaryConditions } = {}) {
    const material = new Made.Material(MATERIAL_CONFIG);
    return new Wave({
        DOMElement: createElement("div", ELEMENT_PROPERTIES),
        structure: material,
        cell: material.Lattice.unitCell,
        settings: { atomRadiiScale: 0.2, ...settings },
        boundaryConditions,
    });
}

function coordinateValue(coordinate) {
    return Array.isArray(coordinate) ? coordinate : coordinate.value;
}

describe("utils: ThreeDSceneDataToMaterial", () => {
    test("extractBasisFromScene ignores bond, boundary, and repetition meshes", () => {
        const wave = buildWave({
            settings: {
                chemicalConnectivityFactor: 1.05,
                repetitionsAlongLatticeVectorA: 2,
                repetitionsAlongLatticeVectorB: 2,
                repetitionsAlongLatticeVectorC: 1,
            },
            // Non-periodic boundary conditions so boundary planes are actually drawn.
            boundaryConditions: { type: "bc1", offset: 0 },
        });

        wave.isDrawBondsEnabled = true;
        wave.rebuildScene();

        // Sanity check on the very ambiguity the fix has to see through: in the installed
        // three.js version InstancedMesh does not override the base Object3D "type", so the
        // bonds InstancedMesh reports itself as a plain "Mesh" - indistinguishable from an atom
        // by `type` alone. If a three.js upgrade ever makes this assertion fail, the fix below
        // needs to be revisited rather than silently trusting `type` again.
        expect(wave.bondsGroup.type).toBe("Mesh");
        expect(wave.bondsGroup.isInstancedMesh).toBe(true);

        const material = ThreeDSceneDataToMaterial(wave.scene);
        const { elements, coordinates } = material.Basis;

        // The fixture material has exactly 2 real atoms; bonds, boundary planes, and the
        // repetition clones must not inflate this count.
        expect(elements.length).toBe(2);
        expect(coordinates.length).toBe(2);

        // The 2 surviving entries must be exactly the base structure's real atoms at their real
        // crystal coordinates (from tests/fixtures/material.json), not a phantom entry that
        // happens to also number 2 - a stray boundary-plane or bond-origin phantom would not
        // land on these exact fractional coordinates.
        const expectedCrystalCoordinates = [
            [0, 0, 0],
            [0.25, 0.25, 0.25],
        ];
        coordinates
            .map(coordinateValue)
            .forEach((value, index) =>
                value.forEach((component, componentIndex) =>
                    expect(component).toBeCloseTo(
                        expectedCrystalCoordinates[index][componentIndex],
                        3,
                    ),
                ),
            );
    });

    test("editing under non-periodic boundary conditions does not throw and preserves the lattice", () => {
        const referenceMaterial = new Made.Material(MATERIAL_CONFIG);
        const expectedVectorArrays = referenceMaterial.Lattice.vectorArrays;

        const wave = buildWave({
            boundaryConditions: { type: "bc1", offset: 0 },
        });

        let material;
        expect(() => {
            material = ThreeDSceneDataToMaterial(wave.scene);
        }).not.toThrow();

        const actualVectorArrays = material.Lattice.vectorArrays;
        expectedVectorArrays.forEach((expectedVector, vectorIndex) => {
            expectedVector.forEach((component, componentIndex) => {
                expect(actualVectorArrays[vectorIndex][componentIndex]).toBeCloseTo(component, 5);
            });
        });
    });
});
