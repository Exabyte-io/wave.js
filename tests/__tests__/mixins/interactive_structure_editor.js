import expect from "expect";

import { getWaveInstance } from "../../enums";

describe("Interactive structure editor functionality tests", () => {
    test("Default state - edit mode disabled", () => {
        const wave = getWaveInstance({});
        expect(wave.isEditModeEnabled_).toBe(false);
    });

    test("Enabling and disabling edit mode", () => {
        const wave = getWaveInstance({});
        expect(wave.isEditModeEnabled_).toBe(false);

        wave.enableEditMode(true);
        expect(wave.isEditModeEnabled_).toBe(true);

        wave.disableEditMode();
        expect(wave.isEditModeEnabled_).toBe(false);
    });

    test("Toggling transform mode on TransformControls", () => {
        const wave = getWaveInstance({});
        wave.enableEditMode(true);

        // Check default translation mode
        expect(wave.transformControls_.mode).toBe("translate");

        // Switch to rotation mode
        wave.setTransformMode("rotate");
        expect(wave.transformControls_.mode).toBe("rotate");
    });

    test("Adding an atom mesh to structure group", () => {
        let callbackFired = false;
        let callbackMaterial = null;

        const wave = getWaveInstance({
            onStructureModified: (material) => {
                callbackFired = true;
                callbackMaterial = material;
            },
        });

        const initialAtomCount = wave.collectAllAtoms().length;

        // Add atom at the cell center coordinate
        wave.addAtom("Si", [0.0, 0.0, 0.0]);

        const updatedAtomCount = wave.collectAllAtoms().length;
        expect(updatedAtomCount).toBe(initialAtomCount + 1);
        expect(callbackFired).toBe(true);

        const lastElement = callbackMaterial.basis.elements[updatedAtomCount - 1];
        const elementSymbol = typeof lastElement === "string" ? lastElement : lastElement.value;
        expect(elementSymbol).toBe("Si");

        // Every element (including the pre-existing ones) must round-trip to a plain string,
        // not a doubly-wrapped {id, value: {id, value}} ESSE object - that shape isn't a valid
        // React child and crashes any UI that renders it directly (e.g. the coordinate panel).
        callbackMaterial.basis.elements.forEach((element) => {
            const symbol = typeof element === "string" ? element : element.value;
            expect(typeof symbol).toBe("string");
        });
    });

    test("Removing a selected atom mesh from structure group", () => {
        let callbackFired = false;
        let callbackMaterial = null;

        const wave = getWaveInstance({
            onStructureModified: (material) => {
                callbackFired = true;
                callbackMaterial = material;
            },
        });

        // Select the first atom mesh, the way handlePointerDown would on a real click.
        const [firstAtom] = wave.collectAllAtoms();
        expect(firstAtom.userData.atomicIndex).toBe(0);
        wave.selectedMesh_ = firstAtom;

        const initialAtomCount = wave.collectAllAtoms().length;

        wave.removeSelectedAtom();

        const updatedAtomCount = wave.collectAllAtoms().length;
        expect(updatedAtomCount).toBe(initialAtomCount - 1);
        expect(callbackMaterial.basis.elements.length).toBe(updatedAtomCount);
        expect(callbackFired).toBe(true);
        expect(wave.selectedMesh_).toBeNull();
    });

    test("Selection survives a scene rebuild while in edit mode", () => {
        const wave = getWaveInstance({});
        wave.enableEditMode(true);

        const [firstAtom] = wave.collectAllAtoms();
        wave.setSelectedAtomMesh(firstAtom);
        expect(wave.transformControls_.object).toBe(firstAtom);

        // rebuildScene() destroys and recreates every atom mesh (e.g. on a coordinate
        // edit, a drag, or an unrelated viewer setting change); the gizmo must follow
        // the same atom to its new mesh instance rather than staying attached to the
        // now-removed one.
        wave.rebuildScene();

        expect(wave.selectedMesh_).not.toBe(firstAtom);
        expect(wave.selectedMesh_.userData.atomicIndex).toBe(0);
        expect(wave.transformControls_.object).toBe(wave.selectedMesh_);
    });

    test("Selection is dropped on rebuild once the atom no longer exists", () => {
        const wave = getWaveInstance({});
        wave.enableEditMode(true);

        const [firstAtom] = wave.collectAllAtoms();
        wave.setSelectedAtomMesh(firstAtom);

        wave.reselectAtomByIndex(999);

        expect(wave.selectedMesh_).toBeNull();
        expect(wave.transformControls_.object).toBeUndefined();
    });
});
