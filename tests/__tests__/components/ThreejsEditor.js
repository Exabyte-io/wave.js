import { Made } from "@exabyte-io/made.js";
import { Editor } from "three/editor/js/Editor";

import { ThreejsEditorModal } from "../../../src/components/ThreejsEditorModal";
import { getWaveInstance } from "../../enums";
import { takeSnapshotAndAssertEqualityAsync } from "../../utils";

function getMaterials(coordinates) {
    let materialsForWave;
    const material = new Made.Material(Made.defaultMaterialConfig);
    coordinates.map((item, index) => (material._json.basis.coordinates[index].value = item));
    const threejsEditor = new ThreejsEditorModal({
        materials: [material],
        onHide: (materials) => (materialsForWave = materials),
    });
    threejsEditor.editor = new Editor(threejsEditor.initializeCamera());
    threejsEditor.loadScene();
    threejsEditor.onHide();
    return materialsForWave;
}

describe("Screen tests for ThreejsEditor", () => {
    test("Moved atoms", async () => {
        const wave = getWaveInstance(false, getMaterials([[1, 1, 1]]));
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "threejsEditor");
    });

    test("Moved atoms with repetitions", async () => {
        const wave = getWaveInstance(
            {
                atomRadiiScale: 0.2,
                repetitionsAlongLatticeVectorA: 3,
                repetitionsAlongLatticeVectorB: 3,
                repetitionsAlongLatticeVectorC: 3,
            },
            getMaterials([
                [1, 1, 1],
                [0.5, 0.5, 0.5],
            ]),
        );
        return takeSnapshotAndAssertEqualityAsync(
            wave.renderer.getContext(),
            "threejsEditorWithRepetitions",
        );
    });
});