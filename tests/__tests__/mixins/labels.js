import { ATOM_GROUP_NAME } from "../../../src/enums";
import { getWaveInstance } from "../../enums";

describe("Atom labels", () => {
    let wave, atoms, labels;

    beforeEach(() => {
        wave = getWaveInstance();
        const atomGroup = wave.scene.getObjectByName(ATOM_GROUP_NAME);
        atoms = atomGroup.children.filter((object) => object.type === "Mesh");
        labels = atomGroup.children.filter((object) => object.type === "Sprite");
    });

    test("Labels are created for every atom", async () => {
        const basisAtomsNumber = wave.structure.basis.elements.length;
        expect(atoms.length).toEqual(basisAtomsNumber);
        expect(labels.length).toEqual(basisAtomsNumber);
        expect(
            atoms.every((atom) =>
                labels.find((label) => atom.uuid === label.name.replace("label-for-", "")),
            ),
        );
    });

    test("Initial labels visibility matches the settings", async () => {
        const { areLabelsInitiallyShown } = wave.settings;
        expect(labels.every((label) => label.visible === areLabelsInitiallyShown)).toBeTruthy();
    });

    test("Labels visibility can be toggled", () => {
        const { areLabelsInitiallyShown } = wave.settings;
        wave.toggleLabels();
        expect(labels.every((label) => label.visible === !areLabelsInitiallyShown)).toBeTruthy();
    });

    test("Label center is positioned on the atom surface", () => {
        wave.toggleLabels();
        expect(
            labels.every((label) => {
                const atom = atoms.find((a) => a.uuid === label.name.replace("label-for-", ""));
                const distanceToCenter = label.position.distanceTo(atom.position);
                return Math.abs(distanceToCenter - atom.geometry.parameters.radius) < 0.00001;
            }),
        ).toBeTruthy();
    });
});
