import { Made } from "@mat3ra/made";
import expect from "expect";

import { getWaveInstance, MATERIAL_CONFIG } from "../../enums";
import { getEventObjectBy3DPosition } from "../../utils";

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

    test("Adding an atom does not corrupt pre-existing atoms' units", () => {
        // MATERIAL_CONFIG's basis is in crystal (fractional) units; getModifiedMaterial()
        // normalizes to crystal internally, so building the post-add basis must convert back
        // to Cartesian rather than relabeling the still-fractional values as "cartesian".
        const referenceBasis = new Made.Material(MATERIAL_CONFIG).Basis;
        referenceBasis.toCartesian();
        const [, expectedCartesian] = referenceBasis.coordinatesAsArray;

        let callbackMaterial = null;
        const wave = getWaveInstance({
            onStructureModified: (material) => {
                callbackMaterial = material;
            },
        });

        wave.addAtom("Si", [0, 0, 0]);

        const [, updatedCoordinate] = callbackMaterial.basis.coordinates;
        const value = Array.isArray(updatedCoordinate)
            ? updatedCoordinate
            : updatedCoordinate.value;

        // The pre-existing atom (originally at crystal [0.25, 0.25, 0.25]) must match its real
        // Cartesian position, not the raw fractional value reinterpreted as Angstroms.
        value.forEach((component, idx) => {
            expect(component).toBeCloseTo(expectedCartesian[idx], 3);
        });
        expect(value).not.toEqual([0.25, 0.25, 0.25]);
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

    test("Click-and-drag directly on an atom (not the gizmo) moves it and reports the change", () => {
        let callbackMaterial = null;
        let selectedIndex = null;

        const wave = getWaveInstance({
            onStructureModified: (material) => {
                callbackMaterial = material;
            },
            onSelectionChanged: (index) => {
                selectedIndex = index;
            },
        });
        wave.enableEditMode(true);

        // jsdom performs no layout, so getBoundingClientRect() would report a zero-size rect;
        // stub it to match the canvas' real drawing-buffer size so the raycasting math behaves
        // the way it would in a real browser.
        const canvas = wave.renderer.domElement;
        canvas.getBoundingClientRect = () => ({
            left: 0,
            top: 0,
            width: canvas.width,
            height: canvas.height,
        });

        const [firstAtom] = wave.collectAllAtoms();
        const startEvent = getEventObjectBy3DPosition(firstAtom.position, wave.camera, canvas);
        const startPosition = firstAtom.position.clone();

        wave.handlePointerDownCapture_({
            clientX: startEvent.layerX,
            clientY: startEvent.layerY,
        });
        expect(wave.pendingDragAtom_).toBe(firstAtom);
        expect(wave.isDraggingAtom_).toBe(false);

        // A few pixels of movement should not yet commit to a drag (matches the click-vs-drag
        // threshold used elsewhere for plain selection clicks).
        wave.handlePointerMoveCapture_({
            clientX: startEvent.layerX + 2,
            clientY: startEvent.layerY,
        });
        expect(wave.isDraggingAtom_).toBe(false);

        // Crossing the threshold commits to the drag: the offset between the cursor and the
        // atom's position is captured on this event, so the atom doesn't jump yet - it tracks
        // the cursor smoothly from here on, same as any offset-based drag implementation.
        wave.handlePointerMoveCapture_({
            clientX: startEvent.layerX + 40,
            clientY: startEvent.layerY,
        });
        expect(wave.isDraggingAtom_).toBe(true);
        expect(selectedIndex).toBe(firstAtom.userData.atomicIndex);
        expect(wave.transformControls_.object).toBe(firstAtom);

        // Further movement should now visibly move the atom.
        wave.handlePointerMoveCapture_({
            clientX: startEvent.layerX + 80,
            clientY: startEvent.layerY,
        });
        expect(firstAtom.position.equals(startPosition)).toBe(false);

        wave.handlePointerUpCapture_({
            clientX: startEvent.layerX + 40,
            clientY: startEvent.layerY,
        });
        expect(wave.isDraggingAtom_).toBe(false);
        expect(wave.pendingDragAtom_).toBeNull();
        expect(callbackMaterial).not.toBeNull();
    });

    test("A plain click on an atom does not trigger a drag", () => {
        const wave = getWaveInstance({});
        wave.enableEditMode(true);

        const canvas = wave.renderer.domElement;
        canvas.getBoundingClientRect = () => ({
            left: 0,
            top: 0,
            width: canvas.width,
            height: canvas.height,
        });

        const [firstAtom] = wave.collectAllAtoms();
        const clickEvent = getEventObjectBy3DPosition(firstAtom.position, wave.camera, canvas);

        wave.handlePointerDownCapture_({ clientX: clickEvent.layerX, clientY: clickEvent.layerY });
        wave.handlePointerUpCapture_({ clientX: clickEvent.layerX, clientY: clickEvent.layerY });

        expect(wave.isDraggingAtom_).toBe(false);
        expect(wave.selectedMesh_).toBe(firstAtom);
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
