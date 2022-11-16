import * as THREE from "three";

import { ATOM_GROUP_NAME, LABELS_GROUP_NAME } from "../../../src/enums";
import { getWaveInstance } from "../../enums";

describe("Atom labels", () => {
    let wave,
        atoms,
        labels,
        labelGroup;

    beforeEach(() => {
        wave = getWaveInstance();
        const atomGroup = wave.scene.getObjectByName(ATOM_GROUP_NAME);
        labelGroup = wave.scene.getObjectByName(LABELS_GROUP_NAME);
        labels = labelGroup.children;
        atoms = atomGroup.children.filter((object) => object.type === "Mesh");
    });

    test("Labels are created for every atom and positioned in the center of atom", async () => {
        const basisAtomsNumber = wave.structure.basis.elements.length;
        const isAllAtomsHaveLabels = atoms.every((atom) => {
            const atomName = atom.name.split("-")[0];
            const labelName = `labels-for-${atomName}`;
            const labelPointsByAtomName = labels.find(
                (labelPoints) => labelPoints.name === labelName,
            );
            if (!labelPointsByAtomName) return false;
            const positions = labelPointsByAtomName.geometry.getAttribute("position")?.array;
            let hasLabel = false;
            const atomPosition = new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld);
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const y = positions[i + 1];
                const z = positions[i + 2];
                const labelPosition = new THREE.Vector3(x, y, z);
                const distance = labelPosition.distanceTo(atomPosition);
                if (distance < 0.00001) {
                    hasLabel = true;
                }
            }
            return hasLabel;
        });

        expect(atoms.length).toEqual(basisAtomsNumber);
        expect(isAllAtomsHaveLabels).toBeTruthy();
    });

    test("Initial labels visibility matches the settings", async () => {
        const { areLabelsInitiallyShown } = wave.settings;
        expect(labelGroup.visible === areLabelsInitiallyShown).toBeTruthy();
    });

    test("Labels visibility can be toggled", () => {
        const { areLabelsInitiallyShown } = wave.settings;
        wave.toggleLabels();
        expect(labels.every((label) => label.visible === !areLabelsInitiallyShown)).toBeTruthy();
    });
});
