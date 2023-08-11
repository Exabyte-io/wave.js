import expect from "expect";
import * as THREE from "three";

import { ATOM_GROUP_NAME, LABELS_GROUP_NAME } from "../../../src/enums";
import { getWaveInstance } from "../../enums";

describe("Atom labels", () => {
    let wave, atoms, labels, labelGroup;

    beforeEach(() => {
        wave = getWaveInstance();
        const atomGroup = wave.scene.getObjectByName(ATOM_GROUP_NAME);
        labelGroup = wave.scene.getObjectByName(LABELS_GROUP_NAME);
        labels = labelGroup.children;
        atoms = atomGroup.children.filter((object) => object.type === "Mesh");
    });

    test("Labels are created for every atom and positioned in the center of atom with the offset towards camera", async () => {
        const basisAtomsNumber = wave.structure.basis.elements.length;

        atoms.forEach((atom) => {
            const atomName = atom.name.split("-")[0];
            const atomPosition = new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld);

            const offsetVector = wave.getLabelOffsetVector(atomPosition, atomName);
            const expectedLabelPosition = atomPosition.clone().add(offsetVector);

            const labelSprite = labelGroup.children.find((label) => {
                return (
                    label.userData.atomName === atomName &&
                    label.userData.atomPosition.distanceTo(atomPosition) < 0.00001 &&
                    label.position.distanceTo(expectedLabelPosition) < 0.00001
                );
            });

            expect(labelSprite).toBeTruthy();
        });

        expect(atoms.length).toEqual(basisAtomsNumber);
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
