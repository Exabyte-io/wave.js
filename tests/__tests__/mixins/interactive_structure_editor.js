import expect from "expect";
import * as THREE from "three";

import { getWaveInstance } from "../../enums";
import {
    getWaveWithRecordedCallbacks,
    projectMeshToScreen,
    simulateAtomDrag,
    simulateClick,
    simulateMarqueeSelect,
    stubCanvasRect,
} from "../../helpers/editor";
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

    test("Adding an atom preserves the material's original units and pre-existing atoms exactly", () => {
        // MATERIAL_CONFIG's basis is in crystal (fractional) units. The delta-based addAtom
        // (applyBasisDelta_) must never force the whole basis into cartesian units just because
        // the new atom's position was supplied in cartesian - it converts internally to place
        // the new atom, then converts back, so pre-existing atoms are untouched and the basis
        // keeps reporting its original units (D7).
        let callbackMaterial = null;
        const wave = getWaveInstance({
            onStructureModified: (material) => {
                callbackMaterial = material;
            },
        });

        wave.addAtom("Si", [0, 0, 0]);

        expect(callbackMaterial.basis.units).toBe("crystal");

        // MATERIAL_CONFIG has two pre-existing atoms, at crystal [0,0,0] and [0.25,0.25,0.25];
        // the new atom is appended at index 2.
        const [first, second, added] = callbackMaterial.basis.coordinates;
        const toValue = (coordinate) => (Array.isArray(coordinate) ? coordinate : coordinate.value);

        expect(toValue(first)).toEqual([0, 0, 0]);
        expect(toValue(second)).toEqual([0.25, 0.25, 0.25]);
        // Cartesian [0,0,0] is crystal [0,0,0] regardless of lattice, for any lattice.
        toValue(added).forEach((component) => expect(component).toBeCloseTo(0, 6));
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
        let selectedIndices = null;

        const wave = getWaveInstance({
            onStructureModified: (material) => {
                callbackMaterial = material;
            },
            // onSelectionChanged now reports an array of atomicIndices (D-4: multi-select) -
            // a single click/drag reports a one-element array.
            onSelectionChanged: (indices) => {
                selectedIndices = indices;
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
        expect(selectedIndices).toEqual([firstAtom.userData.atomicIndex]);
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

    test("no structure-modified event without a transform delta", () => {
        let callbackFired = false;
        const wave = getWaveInstance({
            onStructureModified: () => {
                callbackFired = true;
            },
        });
        wave.enableEditMode(true);

        const [firstAtom] = wave.collectAllAtoms();
        wave.setSelectedAtomMesh(firstAtom);

        // Simulate grabbing a gizmo handle and releasing it without any net movement.
        wave.transformControls_.dispatchEvent({ type: "dragging-changed", value: true });
        wave.transformControls_.dispatchEvent({ type: "mouseUp" });

        expect(callbackFired).toBe(false);
    });

    test("structure-modified event still fires when the gizmo actually moved the atom", () => {
        let callbackFired = false;
        const wave = getWaveInstance({
            onStructureModified: () => {
                callbackFired = true;
            },
        });
        wave.enableEditMode(true);

        const [firstAtom] = wave.collectAllAtoms();
        wave.setSelectedAtomMesh(firstAtom);

        wave.transformControls_.dispatchEvent({ type: "dragging-changed", value: true });
        firstAtom.position.x += 1;
        wave.transformControls_.dispatchEvent({ type: "mouseUp" });

        expect(callbackFired).toBe(true);
    });

    test("Escape mid-drag reverts the atom and commits nothing", () => {
        let callbackFired = false;
        const wave = getWaveInstance({
            onStructureModified: () => {
                callbackFired = true;
            },
        });
        wave.enableEditMode(true);

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

        wave.handlePointerDownCapture_({ clientX: startEvent.layerX, clientY: startEvent.layerY });
        wave.handlePointerMoveCapture_({
            clientX: startEvent.layerX + 40,
            clientY: startEvent.layerY,
        });
        expect(wave.isDraggingAtom_).toBe(true);
        wave.handlePointerMoveCapture_({
            clientX: startEvent.layerX + 80,
            clientY: startEvent.layerY,
        });
        expect(firstAtom.position.equals(startPosition)).toBe(false);

        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

        expect(firstAtom.position.equals(startPosition)).toBe(true);
        expect(wave.isDraggingAtom_).toBe(false);
        expect(wave.pendingDragAtom_).toBeNull();
        expect(callbackFired).toBe(false);
    });

    test("Escape with no drag in progress deselects the current atom", () => {
        let selectedIndices = "unset";
        const wave = getWaveInstance({
            onSelectionChanged: (indices) => {
                selectedIndices = indices;
            },
        });
        wave.enableEditMode(true);

        const [firstAtom] = wave.collectAllAtoms();
        wave.setSelectedAtomMesh(firstAtom);

        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

        expect(wave.selectedMesh_).toBeNull();
        expect(selectedIndices).toEqual([]);
    });

    test("A right-click does not start a pending drag or select an atom", () => {
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

        wave.handlePointerDownCapture_({
            clientX: clickEvent.layerX,
            clientY: clickEvent.layerY,
            button: 2,
        });
        expect(wave.pendingDragAtom_).toBeNull();

        wave.handlePointerUpCapture_({
            clientX: clickEvent.layerX,
            clientY: clickEvent.layerY,
            button: 2,
        });
        expect(wave.selectedMesh_).toBeNull();
    });

    test("Ending a drag restores orbit controls to their pre-drag state, not unconditionally true", () => {
        const wave = getWaveInstance({});
        wave.enableEditMode(true);
        wave.orbitControls.enabled = false; // already off before the drag starts, e.g. some other UI disabled it

        const canvas = wave.renderer.domElement;
        canvas.getBoundingClientRect = () => ({
            left: 0,
            top: 0,
            width: canvas.width,
            height: canvas.height,
        });

        const [firstAtom] = wave.collectAllAtoms();
        const startEvent = getEventObjectBy3DPosition(firstAtom.position, wave.camera, canvas);

        wave.handlePointerDownCapture_({ clientX: startEvent.layerX, clientY: startEvent.layerY });
        wave.handlePointerMoveCapture_({
            clientX: startEvent.layerX + 40,
            clientY: startEvent.layerY,
        });
        expect(wave.orbitControls.enabled).toBe(false); // disabled during the drag either way
        wave.handlePointerUpCapture_({
            clientX: startEvent.layerX + 40,
            clientY: startEvent.layerY,
        });

        expect(wave.orbitControls.enabled).toBe(false);
    });

    test("Selection persists across an edit-mode disable/re-enable cycle", () => {
        const wave = getWaveInstance({});
        wave.enableEditMode(true);

        const [firstAtom] = wave.collectAllAtoms();
        wave.setSelectedAtomMesh(firstAtom);

        wave.enableEditMode(false);
        expect(wave.selectedMesh_).toBeNull();

        wave.enableEditMode(true);
        expect(wave.selectedMesh_).not.toBeNull();
        expect(wave.selectedMesh_.userData.atomicIndex).toBe(firstAtom.userData.atomicIndex);
    });

    test("An explicit deselect (not a mode toggle) is not restored on re-enabling edit mode", () => {
        const wave = getWaveInstance({});
        wave.enableEditMode(true);

        const [firstAtom] = wave.collectAllAtoms();
        wave.setSelectedAtomMesh(firstAtom);
        wave.clearSelectedAtom();

        wave.enableEditMode(false);
        wave.enableEditMode(true);

        expect(wave.selectedMesh_).toBeNull();
    });

    test("Hovering an atom shows the hover highlight and a move cursor; moving off hides it", () => {
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
        const overAtom = getEventObjectBy3DPosition(firstAtom.position, wave.camera, canvas);

        wave.handlePointerMoveCapture_({ clientX: overAtom.layerX, clientY: overAtom.layerY });
        expect(wave.hoveredMesh_).toBe(firstAtom);
        expect(wave.hoverHighlightMesh_.visible).toBe(true);
        expect(canvas.style.cursor).toBe("move");

        wave.handlePointerMoveCapture_({ clientX: -9999, clientY: -9999 });
        expect(wave.hoveredMesh_).toBeNull();
        expect(wave.hoverHighlightMesh_.visible).toBe(false);
        expect(canvas.style.cursor).toBe("");
    });

    describe("Multi-select (D-4)", () => {
        test("Shift+click adds an atom to the selection", () => {
            const wave = getWaveInstance({});
            wave.enableEditMode(true);
            stubCanvasRect(wave);

            const [firstAtom, secondAtom] = wave.collectAllAtoms();
            simulateClick(wave, firstAtom);
            expect(wave.selectedMeshes_).toEqual([firstAtom]);

            const coords = projectMeshToScreen(wave, secondAtom);
            wave.handlePointerDownCapture_({
                clientX: coords.x,
                clientY: coords.y,
                shiftKey: true,
            });
            wave.handlePointerUpCapture_({ clientX: coords.x, clientY: coords.y, shiftKey: true });

            expect(wave.selectedMeshes_).toEqual([firstAtom, secondAtom]);
        });

        test("Ctrl/Cmd+click toggles an atom out of the selection", () => {
            const wave = getWaveInstance({});
            wave.enableEditMode(true);
            stubCanvasRect(wave);

            const [firstAtom, secondAtom] = wave.collectAllAtoms();
            wave.setSelectedAtomMeshes([firstAtom, secondAtom]);

            const coords = projectMeshToScreen(wave, secondAtom);
            wave.handlePointerDownCapture_({ clientX: coords.x, clientY: coords.y, ctrlKey: true });
            wave.handlePointerUpCapture_({ clientX: coords.x, clientY: coords.y, ctrlKey: true });

            expect(wave.selectedMeshes_).toEqual([firstAtom]);
        });

        test("Shift/Ctrl+click on empty space leaves the current selection alone", () => {
            const wave = getWaveInstance({});
            wave.enableEditMode(true);
            stubCanvasRect(wave);

            const [firstAtom] = wave.collectAllAtoms();
            wave.setSelectedAtomMeshes([firstAtom]);

            wave.handlePointerDownCapture_({ clientX: -9999, clientY: -9999, shiftKey: true });
            wave.handlePointerUpCapture_({ clientX: -9999, clientY: -9999, shiftKey: true });

            expect(wave.selectedMeshes_).toEqual([firstAtom]);
        });

        test("Marquee-select on empty space selects every atom within the rectangle", () => {
            const wave = getWaveInstance({});
            wave.enableEditMode(true);
            stubCanvasRect(wave);

            const atoms = wave.collectAllAtoms();
            const screenPoints = atoms.map((atom) => projectMeshToScreen(wave, atom));
            const margin = 60;
            const rectStart = {
                x: Math.min(...screenPoints.map((p) => p.x)) - margin,
                y: Math.min(...screenPoints.map((p) => p.y)) - margin,
            };
            const rectEnd = {
                x: Math.max(...screenPoints.map((p) => p.x)) + margin,
                y: Math.max(...screenPoints.map((p) => p.y)) + margin,
            };

            simulateMarqueeSelect(wave, rectStart, rectEnd);

            expect(wave.selectedMeshes_).toEqual(expect.arrayContaining(atoms));
            expect(wave.selectedMeshes_.length).toBe(atoms.length);
        });

        test("Marquee-select with Shift adds to the existing selection instead of replacing it", () => {
            const wave = getWaveInstance({});
            wave.enableEditMode(true);
            stubCanvasRect(wave);

            const [firstAtom, secondAtom] = wave.collectAllAtoms();
            // Select an atom that is NOT inside the upcoming marquee rectangle.
            wave.setSelectedAtomMeshes([firstAtom]);

            const secondScreen = projectMeshToScreen(wave, secondAtom);
            simulateMarqueeSelect(
                wave,
                { x: secondScreen.x - 40, y: secondScreen.y - 40 },
                { x: secondScreen.x + 40, y: secondScreen.y + 40 },
                { shiftKey: true },
            );

            expect(wave.selectedMeshes_).toEqual(expect.arrayContaining([firstAtom, secondAtom]));
            expect(wave.selectedMeshes_.length).toBe(2);
        });

        test("A marquee drag that never crosses the threshold behaves as a plain click on empty space", () => {
            const wave = getWaveInstance({});
            wave.enableEditMode(true);
            stubCanvasRect(wave);

            const [firstAtom] = wave.collectAllAtoms();
            wave.setSelectedAtomMeshes([firstAtom]);

            simulateMarqueeSelect(wave, { x: -9999, y: -9999 }, { x: -9998, y: -9999 });

            expect(wave.selectedMeshes_).toEqual([]);
        });

        test("Edit mode disables the left orbit button and moves rotation to the right button (D-4)", () => {
            const wave = getWaveInstance({});
            const defaultLeft = wave.orbitControls.mouseButtons.LEFT;

            wave.enableEditMode(true);
            expect(wave.orbitControls.mouseButtons.LEFT).toBeFalsy();
            expect(wave.orbitControls.mouseButtons.RIGHT).toBe(THREE.MOUSE.ROTATE);

            wave.enableEditMode(false);
            expect(wave.orbitControls.mouseButtons.LEFT).toBe(defaultLeft);
        });

        test("Dragging one atom of a multi-selection moves the whole group together, as a single commit", () => {
            const { wave, structureModifiedCalls } = getWaveWithRecordedCallbacks();
            wave.enableEditMode(true);
            stubCanvasRect(wave);

            const [firstAtom, secondAtom] = wave.collectAllAtoms();
            const secondStart = secondAtom.position.clone();
            wave.setSelectedAtomMeshes([firstAtom, secondAtom]);

            const { startPosition, endPosition } = simulateAtomDrag(wave, firstAtom, 40, 30, {
                assertIntermediateState: false,
            });
            const firstDelta = endPosition.clone().sub(startPosition);

            expect(
                secondAtom.position.clone().sub(secondStart).distanceTo(firstDelta),
            ).toBeLessThan(1e-6);
            expect(structureModifiedCalls.length).toBe(1);
        });

        test("Group drag via the gizmo pivot moves every selected atom and commits once", () => {
            const { wave, structureModifiedCalls } = getWaveWithRecordedCallbacks();
            wave.enableEditMode(true);

            const [firstAtom, secondAtom] = wave.collectAllAtoms();
            const firstStart = firstAtom.position.clone();
            const secondStart = secondAtom.position.clone();
            wave.setSelectedAtomMeshes([firstAtom, secondAtom]);

            expect(wave.transformControls_.object).toBe(wave.selectionPivot_);

            // TransformControls' own `dragging` property has a setter (see defineProperty in
            // its source) that auto-dispatches both "dragging-changed" and "change" - no need to
            // dispatch "dragging-changed" separately. Its real pointerUp() dispatches "mouseUp"
            // BEFORE setting dragging = false, so transformDragStartPosition_ (reset by this
            // mixin's "dragging-changed" listener on the false transition) is still valid when
            // the mouseUp handler reads it; this order must be preserved here too.
            wave.transformControls_.dragging = true;
            wave.selectionPivot_.position.x += 1;
            wave.transformControls_.dispatchEvent({ type: "change" });
            wave.transformControls_.dispatchEvent({ type: "mouseUp" });
            wave.transformControls_.dragging = false;

            expect(firstAtom.position.x - firstStart.x).toBeCloseTo(1, 6);
            expect(secondAtom.position.x - secondStart.x).toBeCloseTo(1, 6);
            expect(structureModifiedCalls.length).toBe(1);
            // rebuildScene() (wave.js) replaces every atom mesh - the commit must leave the
            // FULL group selected, not just the last-selected atom, so a second group action
            // (e.g. another drag) is still possible immediately after.
            expect(wave.selectedMeshes_.length).toBe(2);
            expect(wave.selectedMeshes_.map((mesh) => mesh.userData.atomicIndex).sort()).toEqual([
                0, 1,
            ]);
        });

        test("A multi-selection survives a rebuild triggered independently of the mixin's own commit (regression: host round-trip via onStructureModified must not collapse it to one atom)", () => {
            // A real host (ThreeDEditor.jsx's handleStructureModified -> _applyMaterialToViewer)
            // reacts to onStructureModified by calling setStructure()+rebuildScene() AGAIN, on
            // top of the rebuild the mixin's own commit already performed. rebuildScene() itself
            // (wave.js) must be multi-select-aware for this second, externally-triggered rebuild
            // to preserve the group too - simulate that second round-trip directly.
            const wave = getWaveInstance({});
            wave.enableEditMode(true);

            const [firstAtom, secondAtom] = wave.collectAllAtoms();
            wave.setSelectedAtomMeshes([firstAtom, secondAtom]);

            wave.setStructure(wave.structure);
            wave.rebuildScene();

            expect(wave.selectedMeshes_.length).toBe(2);
            expect(wave.selectedMeshes_.map((mesh) => mesh.userData.atomicIndex).sort()).toEqual([
                0, 1,
            ]);
            expect(wave.transformControls_.object).toBe(wave.selectionPivot_);
        });

        test("Escape during a group drag reverts every atom and commits nothing", () => {
            const { wave, structureModifiedCalls } = getWaveWithRecordedCallbacks();
            wave.enableEditMode(true);
            stubCanvasRect(wave);

            const [firstAtom, secondAtom] = wave.collectAllAtoms();
            const firstStart = firstAtom.position.clone();
            const secondStart = secondAtom.position.clone();
            wave.setSelectedAtomMeshes([firstAtom, secondAtom]);

            const start = projectMeshToScreen(wave, firstAtom);
            wave.handlePointerDownCapture_({ clientX: start.x, clientY: start.y });
            wave.handlePointerMoveCapture_({ clientX: start.x + 40, clientY: start.y });
            expect(wave.isDraggingGroup_).toBe(true);
            wave.handlePointerMoveCapture_({ clientX: start.x + 80, clientY: start.y + 20 });

            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

            expect(firstAtom.position.equals(firstStart)).toBe(true);
            expect(secondAtom.position.equals(secondStart)).toBe(true);
            expect(structureModifiedCalls.length).toBe(0);
        });

        test("Removing a multi-selection removes every selected atom as a single commit", () => {
            const { wave, structureModifiedCalls } = getWaveWithRecordedCallbacks();
            wave.enableEditMode(true);

            const atoms = wave.collectAllAtoms();
            wave.setSelectedAtomMeshes(atoms);
            const initialCount = atoms.length;

            wave.removeSelectedAtom();

            expect(wave.collectAllAtoms().length).toBe(initialCount - atoms.length);
            expect(structureModifiedCalls.length).toBe(1);
            expect(wave.selectedMeshes_).toEqual([]);
        });

        test("A multi-selection survives an edit-mode disable/re-enable cycle (R12, extended to groups)", () => {
            const wave = getWaveInstance({});
            wave.enableEditMode(true);

            const atoms = wave.collectAllAtoms();
            wave.setSelectedAtomMeshes(atoms);

            wave.enableEditMode(false);
            expect(wave.selectedMeshes_).toEqual([]);

            wave.enableEditMode(true);
            expect(wave.selectedMeshes_.length).toBe(atoms.length);
            expect(wave.selectedMeshes_.map((mesh) => mesh.userData.atomicIndex).sort()).toEqual(
                atoms.map((mesh) => mesh.userData.atomicIndex).sort(),
            );
        });
    });

    describe("Parity: group rotate, clone, camera focus (old-editor parity)", () => {
        test("Rotating the group pivot via the gizmo rotates every selected atom rigidly about the shared centroid, as a single commit", () => {
            const { wave, structureModifiedCalls } = getWaveWithRecordedCallbacks();
            wave.enableEditMode(true);

            const [firstAtom, secondAtom] = wave.collectAllAtoms();
            wave.setSelectedAtomMeshes([firstAtom, secondAtom]);
            wave.setTransformMode("rotate");

            const centroid = firstAtom.position.clone().add(secondAtom.position).divideScalar(2);
            const firstRadius = firstAtom.position.distanceTo(centroid);
            const secondRadius = secondAtom.position.distanceTo(centroid);
            const firstOffset = firstAtom.position.clone().sub(centroid);
            const quaternion = new THREE.Quaternion().setFromAxisAngle(
                new THREE.Vector3(0, 0, 1),
                Math.PI / 2,
            );

            // Same real event order as the group-translate test above: dragging=true auto-fires
            // dragging-changed+change (snapshotting transformDragStartPosition_/Quaternion_),
            // the pivot's quaternion is then set directly (as TransformControls itself would),
            // a manual "change" propagates it to the atoms, "mouseUp" commits while the start
            // snapshot is still valid, and only then dragging=false.
            wave.transformControls_.dragging = true;
            wave.selectionPivot_.quaternion.copy(quaternion);
            wave.transformControls_.dispatchEvent({ type: "change" });
            wave.transformControls_.dispatchEvent({ type: "mouseUp" });
            wave.transformControls_.dragging = false;

            const expectedFirst = centroid
                .clone()
                .add(firstOffset.clone().applyQuaternion(quaternion));
            expect(firstAtom.position.distanceTo(expectedFirst)).toBeLessThan(1e-6);
            // Rigid rotation about the shared centroid: each atom's distance from it is preserved.
            expect(firstAtom.position.distanceTo(centroid)).toBeCloseTo(firstRadius, 6);
            expect(secondAtom.position.distanceTo(centroid)).toBeCloseTo(secondRadius, 6);
            expect(structureModifiedCalls.length).toBe(1);
            // The pivot's rotation is relative to each drag, not cumulative - reset to identity
            // after commit so the next attach/drag starts clean.
            expect(wave.selectionPivot_.quaternion.angleTo(new THREE.Quaternion())).toBeLessThan(
                1e-9,
            );
            // rebuildScene() must leave the FULL group selected (not just one atom), or the
            // Rotate button would go right back to disabled and a second rotate would be
            // impossible.
            expect(wave.selectedMeshes_.length).toBe(2);
        });

        test("A second consecutive group rotate still works after a host round-trip rebuild (regression)", () => {
            const { wave, structureModifiedCalls } = getWaveWithRecordedCallbacks();
            wave.enableEditMode(true);

            const [firstAtom, secondAtom] = wave.collectAllAtoms();
            wave.setSelectedAtomMeshes([firstAtom, secondAtom]);
            wave.setTransformMode("rotate");

            const rotateOnce = () => {
                wave.transformControls_.dragging = true;
                wave.selectionPivot_.quaternion.setFromAxisAngle(
                    new THREE.Vector3(0, 0, 1),
                    Math.PI / 4,
                );
                wave.transformControls_.dispatchEvent({ type: "change" });
                wave.transformControls_.dispatchEvent({ type: "mouseUp" });
                wave.transformControls_.dragging = false;
            };

            rotateOnce();
            // Simulate the host's onStructureModified round-trip (ThreeDEditor.jsx's
            // handleStructureModified -> _applyMaterialToViewer), which independently calls
            // setStructure()+rebuildScene() again on top of the mixin's own commit.
            wave.setStructure(wave.structure);
            wave.rebuildScene();
            expect(wave.selectedMeshes_.length).toBe(2);
            expect(wave.transformControls_.object).toBe(wave.selectionPivot_);

            const beforeSecond = wave.collectAllAtoms().map((atom) => atom.position.clone());
            rotateOnce();
            const afterSecond = wave.collectAllAtoms().map((atom) => atom.position.clone());

            expect(structureModifiedCalls.length).toBe(2);
            expect(wave.selectedMeshes_.length).toBe(2);
            beforeSecond.forEach((position, index) => {
                expect(position.distanceTo(afterSecond[index])).toBeGreaterThan(1e-3);
            });
        });

        test("no structure-modified event from a zero-rotation gizmo click-release", () => {
            const { wave, structureModifiedCalls } = getWaveWithRecordedCallbacks();
            wave.enableEditMode(true);

            const atoms = wave.collectAllAtoms();
            wave.setSelectedAtomMeshes(atoms);
            wave.setTransformMode("rotate");

            wave.transformControls_.dragging = true;
            wave.transformControls_.dispatchEvent({ type: "mouseUp" });
            wave.transformControls_.dragging = false;

            expect(structureModifiedCalls.length).toBe(0);
        });

        test("Cloning a single selected atom adds one atom of the same element at an offset and selects the clone", () => {
            const { wave, structureModifiedCalls, selectionChangedCalls } =
                getWaveWithRecordedCallbacks();
            wave.enableEditMode(true);

            const [firstAtom] = wave.collectAllAtoms();
            wave.setSelectedAtomMeshes([firstAtom]);
            const initialCount = wave.collectAllAtoms().length;
            const sourcePosition = firstAtom.position.clone();

            wave.cloneSelectedAtoms();

            const atoms = wave.collectAllAtoms();
            expect(atoms.length).toBe(initialCount + 1);
            expect(structureModifiedCalls.length).toBe(1);

            const newAtom = atoms[atoms.length - 1];
            expect(newAtom.userData.atomicIndex).toBe(initialCount);
            expect(newAtom.position.distanceTo(sourcePosition)).toBeGreaterThan(0.01);
            // Selection moves to the clone, matching Add Atom's auto-select behavior.
            expect(wave.selectedMeshes_).toEqual([newAtom]);
            expect(selectionChangedCalls[selectionChangedCalls.length - 1]).toEqual([
                [initialCount],
            ]);

            const toSymbol = (element) => (typeof element === "string" ? element : element.value);
            const clonedElement = wave.structure.basis.elements[newAtom.userData.atomicIndex];
            const originalElement = wave.structure.basis.elements[firstAtom.userData.atomicIndex];
            expect(toSymbol(clonedElement)).toBe(toSymbol(originalElement));
        });

        test("Cloning a multi-atom selection adds one clone per atom, preserving relative offsets, as a single commit", () => {
            const { wave, structureModifiedCalls } = getWaveWithRecordedCallbacks();
            wave.enableEditMode(true);

            const atoms = wave.collectAllAtoms();
            wave.setSelectedAtomMeshes(atoms);
            const initialCount = atoms.length;
            const originalRelativeOffset = atoms[1].position.clone().sub(atoms[0].position);

            wave.cloneSelectedAtoms();

            const allAtoms = wave.collectAllAtoms();
            expect(allAtoms.length).toBe(initialCount * 2);
            expect(structureModifiedCalls.length).toBe(1);
            expect(wave.selectedMeshes_.length).toBe(initialCount);

            const clones = allAtoms.slice(initialCount);
            const clonedRelativeOffset = clones[1].position.clone().sub(clones[0].position);
            expect(clonedRelativeOffset.distanceTo(originalRelativeOffset)).toBeLessThan(1e-6);
        });

        test("Cloning with nothing selected is a no-op", () => {
            const { wave, structureModifiedCalls } = getWaveWithRecordedCallbacks();
            wave.enableEditMode(true);
            const initialCount = wave.collectAllAtoms().length;

            wave.cloneSelectedAtoms();

            expect(wave.collectAllAtoms().length).toBe(initialCount);
            expect(structureModifiedCalls.length).toBe(0);
        });

        test("Focusing the camera on a selection re-targets and re-distances without changing the viewing angle", () => {
            const wave = getWaveInstance({});
            wave.enableEditMode(true);
            // A distinctive, non-default position/target so a coincidental match with the
            // selection's centroid can't hide a bug.
            wave.camera.position.set(20, 5, 8);
            wave.orbitControls.target.set(1, 1, 1);
            wave.camera.lookAt(wave.orbitControls.target);
            const previousDirection = wave.camera.position
                .clone()
                .sub(wave.orbitControls.target)
                .normalize();

            const atoms = wave.collectAllAtoms();
            wave.setSelectedAtomMeshes(atoms);
            const expectedCenter = new THREE.Vector3();
            atoms.forEach((atom) => expectedCenter.add(atom.position));
            expectedCenter.divideScalar(atoms.length);

            wave.focusCameraOnSelection();

            expect(wave.orbitControls.target.distanceTo(expectedCenter)).toBeLessThan(1e-6);
            const newDirection = wave.camera.position
                .clone()
                .sub(wave.orbitControls.target)
                .normalize();
            expect(newDirection.distanceTo(previousDirection)).toBeLessThan(1e-6);
        });

        test("Focusing the camera with nothing selected is a no-op", () => {
            const wave = getWaveInstance({});
            wave.enableEditMode(true);
            const previousPosition = wave.camera.position.clone();
            const previousTarget = wave.orbitControls.target.clone();

            wave.focusCameraOnSelection();

            expect(wave.camera.position.equals(previousPosition)).toBe(true);
            expect(wave.orbitControls.target.equals(previousTarget)).toBe(true);
        });
    });
});
