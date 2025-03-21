import expect from "expect";
import * as THREE from "three";

import { ATOM_GROUP_NAME } from "../../../src/enums";
import { getAtomWorldPosition, getObjectCoordinate } from "../../../src/mixins/utils_three";
import { getWaveInstance } from "../../enums";

describe("Atom labels", () => {
    let wave, atoms, labels, labelGroup, elementLabelManager;

    beforeEach(() => {
        wave = getWaveInstance();
        if (!wave.labelManagers || !wave.labelManagers.length) {
            wave.initializeLabelManagers();
        }
        elementLabelManager = wave.getLabelManagerByType("element");

        wave.createAllLabels();
        const atomGroup = wave.scene.getObjectByName(ATOM_GROUP_NAME);
        labelGroup = elementLabelManager.THREEGroup;

        labels = labelGroup.children;
        atoms = atomGroup.children.filter((object) => object.type === "Mesh");
    });

    test("Labels are created for every atom and positioned in the center of atom with the offset towards camera", async () => {
        const basisAtomsNumber = wave.structure.basis.elements.length;

        expect(labelGroup.children.length).toEqual(atoms.length);
        atoms.forEach((atom, index) => {
            const atomName = atom.userData.symbolWithLabel;
            const atomPosition = getObjectCoordinate(atom);

            const expectedLabelPosition = elementLabelManager.getLabelPositionWithOffset(
                atomPosition,
                atomName,
            );

            const label = labelGroup.children[index];
            const positionDistance = label.position.distanceTo(expectedLabelPosition);

            expect(positionDistance).toBeLessThan(0.0001);
        });

        expect(atoms.length).toEqual(basisAtomsNumber);
    });

    test.skip("Labels are created for every atom and positioned in the center of atom", async () => {
        // Right now we removed ability to create labels as points
        wave = getWaveInstance({ elementLabelsConfig: { areSpritesUsed: true } });

        if (!wave.labelManagers || !wave.labelManagers.length) {
            wave.initializeLabelManagers();
        }

        elementLabelManager = wave.getLabelManagerByType("element");
        wave.createAllLabels();

        const atomGroup = wave.scene.getObjectByName(ATOM_GROUP_NAME);
        labelGroup = elementLabelManager.THREEGroup;

        labels = labelGroup.children;
        atoms = atomGroup.children.filter((object) => object.type === "Mesh");

        const basisAtomsNumber = wave.structure.basis.elements.length;
        const doAllAtomsHaveLabels = atoms.every((atom) => {
            const atomName = atom.userData.symbolWithLabel;
            const labelName = `element-label-for-${atomName}`;
            const labelPointsByAtomName = labels.find(
                (labelPoints) => labelPoints.name === labelName,
            );
            if (!labelPointsByAtomName) return false;
            const positions = labelPointsByAtomName.geometry.getAttribute("position")?.array;
            let hasLabel = false;
            const atomPosition = getAtomWorldPosition(atom);
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
        expect(doAllAtomsHaveLabels).toBeTruthy();
    });

    test("Initial element labels visibility matches the settings", async () => {
        const { areElementLabelsInitiallyShown } = wave.settings;

        if (labelGroup.visible !== areElementLabelsInitiallyShown) {
            labelGroup.visible = areElementLabelsInitiallyShown;
        }

        expect(labelGroup.visible === areElementLabelsInitiallyShown).toBeTruthy();
    });

    test("Element labels visibility can be toggled", () => {
        const initialVisibility = labelGroup.visible;
        wave.toggleLabelsVisibilityByType("element");
        expect(labelGroup.visible).toEqual(!initialVisibility);
    });
});
