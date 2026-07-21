import expect from "expect";

import { getWaveInstance } from "../../enums";
import {
    dispatchPointerEvent,
    expectVisualMatch,
    getWaveWithRecordedCallbacks,
    projectMeshToScreen,
    projectToScreen,
    simulateAtomDrag,
    simulateClick,
    stubCanvasRect,
} from "../../helpers/editor";

describe("tests/helpers/editor.js", () => {
    test("stubCanvasRect defaults to a zero-offset, 1:1 rect matching the canvas", () => {
        const wave = getWaveInstance({});
        const canvas = stubCanvasRect(wave);

        const rect = canvas.getBoundingClientRect();
        expect(rect).toEqual({ left: 0, top: 0, width: canvas.width, height: canvas.height });
    });

    test("stubCanvasRect honors left/top/scale overrides", () => {
        const wave = getWaveInstance({});
        const canvas = stubCanvasRect(wave, { left: 12, top: 34, scale: 2 });

        const rect = canvas.getBoundingClientRect();
        expect(rect).toEqual({
            left: 12,
            top: 34,
            width: canvas.width * 2,
            height: canvas.height * 2,
        });
    });

    test("projectToScreen lands inside the canvas for an atom at a stubbed origin rect", () => {
        const wave = getWaveInstance({});
        stubCanvasRect(wave);

        const [firstAtom] = wave.collectAllAtoms();
        const { x, y } = projectToScreen(wave, firstAtom.position);

        const canvas = wave.renderer.domElement;
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(canvas.width);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(canvas.height);
    });

    test("projectToScreen shifts by the stubbed rect's left/top offset", () => {
        const wave = getWaveInstance({});
        const [firstAtom] = wave.collectAllAtoms();

        stubCanvasRect(wave);
        const atOrigin = projectToScreen(wave, firstAtom.position);

        stubCanvasRect(wave, { left: 50, top: 25 });
        const offset = projectToScreen(wave, firstAtom.position);

        expect(offset.x).toBe(atOrigin.x + 50);
        expect(offset.y).toBe(atOrigin.y + 25);
    });

    test("projectMeshToScreen matches projectToScreen(wave, mesh.position)", () => {
        const wave = getWaveInstance({});
        stubCanvasRect(wave);

        const [firstAtom] = wave.collectAllAtoms();
        expect(projectMeshToScreen(wave, firstAtom)).toEqual(
            projectToScreen(wave, firstAtom.position),
        );
    });

    test.each(["direct", "dispatch"])(
        "simulateClick selects the clicked atom (mode: %s)",
        (mode) => {
            const wave = getWaveInstance({});
            wave.enableEditMode(true);
            stubCanvasRect(wave);

            const [firstAtom] = wave.collectAllAtoms();
            const coords = projectMeshToScreen(wave, firstAtom);

            dispatchPointerEvent(wave, "pointerdown", coords, { mode });
            dispatchPointerEvent(wave, "pointerup", coords, { mode });

            expect(wave.selectedMesh_).toBe(firstAtom);
        },
    );

    test("simulateClick returns wave.selectedMesh_ after the click", () => {
        const wave = getWaveInstance({});
        wave.enableEditMode(true);
        stubCanvasRect(wave);

        const [firstAtom] = wave.collectAllAtoms();
        const selected = simulateClick(wave, firstAtom);

        expect(selected).toBe(firstAtom);
        expect(wave.selectedMesh_).toBe(firstAtom);
    });

    test("simulateClick accepts a plain world-position array", () => {
        const wave = getWaveInstance({});
        wave.enableEditMode(true);
        stubCanvasRect(wave);

        const [firstAtom] = wave.collectAllAtoms();
        const position = firstAtom.position.toArray();
        const selected = simulateClick(wave, position);

        expect(selected).toBe(firstAtom);
    });

    test("simulateAtomDrag moves the atom, reports one modified material, and toggles isDraggingAtom_", () => {
        const wave = getWaveInstance({});
        wave.enableEditMode(true);
        stubCanvasRect(wave);

        const [firstAtom] = wave.collectAllAtoms();
        const { startPosition, endPosition, modifiedMaterial } = simulateAtomDrag(
            wave,
            firstAtom,
            40,
            0,
        );

        expect(endPosition.equals(startPosition)).toBe(false);
        expect(firstAtom.position.equals(endPosition)).toBe(true);
        expect(modifiedMaterial).not.toBeNull();
        expect(wave.isDraggingAtom_).toBe(false);
    });

    test("simulateAtomDrag with assertIntermediateState: false does not throw on the raw sequence", () => {
        const wave = getWaveInstance({});
        wave.enableEditMode(true);
        stubCanvasRect(wave);

        const [firstAtom] = wave.collectAllAtoms();
        expect(() =>
            simulateAtomDrag(wave, firstAtom, 40, 0, { assertIntermediateState: false }),
        ).not.toThrow();
    });

    test("getWaveWithRecordedCallbacks records onStructureModified and onSelectionChanged calls", () => {
        const { wave, structureModifiedCalls, selectionChangedCalls } =
            getWaveWithRecordedCallbacks();
        wave.enableEditMode(true);
        stubCanvasRect(wave);

        const [firstAtom] = wave.collectAllAtoms();
        simulateClick(wave, firstAtom);
        simulateAtomDrag(wave, firstAtom, 40, 0);

        expect(selectionChangedCalls.length).toBeGreaterThan(0);
        // onSelectionChanged reports an array of atomicIndices (D-4: multi-select).
        expect(selectionChangedCalls[0][0]).toEqual([firstAtom.userData.atomicIndex]);
        expect(structureModifiedCalls.length).toBe(1);
    });

    test("getWaveWithRecordedCallbacks merges settingsOverrides and still records", () => {
        let sawOwnCallback = false;
        const { wave, structureModifiedCalls } = getWaveWithRecordedCallbacks({
            atomRadiiScale: 0.5,
            onStructureModified: () => {
                sawOwnCallback = true;
            },
        });

        expect(wave.settings.atomRadiiScale).toBe(0.5);

        wave.addAtom("Si", [0, 0, 0]);

        expect(sawOwnCallback).toBe(true);
        expect(structureModifiedCalls.length).toBe(1);
    });

    test("expectVisualMatch renders and matches the existing 'wave' pixel fixture for a default instance", async () => {
        const wave = getWaveInstance();
        await expectVisualMatch(wave, "wave");
    });
});
