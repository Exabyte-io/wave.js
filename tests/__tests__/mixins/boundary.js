import { Made } from "@mat3ra/made";
import expect from "expect";
import { mix } from "mixwith";

import { BoundaryMixin } from "../../../src/mixins/boundary";
import { MATERIAL_CONFIG } from "../../enums";

class BoundaryMixinTestBase {
    constructor(config) {
        this.boundaryConditions = config.boundaryConditions || {};
        const material = new Made.Material(MATERIAL_CONFIG);
        this.basis = material.Basis;
    }
}

const BoundaryMixinTestClass = mix(BoundaryMixinTestBase).with(BoundaryMixin);

test("basisWithElementsInsideNonPeriodicBoundaries with bc1 does not throw", () => {
    const instance = new BoundaryMixinTestClass({
        boundaryConditions: { type: "bc1", offset: 0 },
    });

    expect(instance.basisWithElementsInsideNonPeriodicBoundaries.elements.length).toBeGreaterThan(
        0,
    );
});
