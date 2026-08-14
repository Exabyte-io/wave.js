import expect from "expect";
import * as THREE from "three";

import { getWaveInstance } from "../enums";
import { getEventObjectBy3DPosition, takeSnapshotAndAssertEqualityAsync } from "../utils";

const POINTER_CAPTURE_HANDLER_BY_TYPE = {
    pointerdown: "handlePointerDownCapture_",
    pointermove: "handlePointerMoveCapture_",
    pointerup: "handlePointerUpCapture_",
};

/**
 * Stubs the canvas' getBoundingClientRect(), which jsdom otherwise reports as an all-zero
 * rect (it performs no layout). `left`/`top` simulate a canvas that isn't flush with the
 * viewport origin - a real layout-gap scenario (scrolled/offset container) that the spec's
 * structural test-coverage gaps call out; `scale` simulates CSS-vs-drawing-buffer mismatch
 * (devicePixelRatio, resize).
 * @param {import("../../src/wave").Wave} wave
 * @param {{left?: number, top?: number, scale?: number}} [options]
 * @returns {HTMLCanvasElement} the stubbed canvas, for convenience
 */
export function stubCanvasRect(wave, { left = 0, top = 0, scale = 1 } = {}) {
    const canvas = wave.renderer.domElement;
    canvas.getBoundingClientRect = () => ({
        left,
        top,
        width: canvas.width * scale,
        height: canvas.height * scale,
    });
    return canvas;
}

/**
 * Projects a world position through wave.camera to canvas-relative screen pixel coordinates,
 * suitable for use as clientX/clientY. Wraps getEventObjectBy3DPosition (which assumes a
 * zero-offset, 1:1 rect) and rescales/offsets its result against whatever rect is currently
 * stubbed on the canvas (see stubCanvasRect), so the output stays correct even when a test
 * simulates a non-origin or scaled canvas.
 * @param {import("../../src/wave").Wave} wave
 * @param {THREE.Vector3} position - world-space position to project
 * @returns {{x: number, y: number}}
 */
export function projectToScreen(wave, position) {
    const canvas = wave.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    const base = getEventObjectBy3DPosition(position, wave.camera, canvas);
    // Falls back to an unscaled, zero-offset projection if the rect hasn't been stubbed
    // (or was stubbed with a zero size), matching getEventObjectBy3DPosition's own assumption.
    const scaleX = rect.width ? rect.width / canvas.width : 1;
    const scaleY = rect.height ? rect.height / canvas.height : 1;
    return {
        x: Math.round((rect.left || 0) + base.layerX * scaleX),
        y: Math.round((rect.top || 0) + base.layerY * scaleY),
    };
}

/**
 * Convenience wrapper for projecting an atom mesh's current position.
 * @param {import("../../src/wave").Wave} wave
 * @param {THREE.Mesh} mesh
 * @returns {{x: number, y: number}}
 */
export function projectMeshToScreen(wave, mesh) {
    return projectToScreen(wave, mesh.position);
}

// jsdom implements no Pointer Capture API at all (no setPointerCapture/releasePointerCapture on
// any element). "dispatch" mode fires a real event at the canvas, which also reaches
// TransformControls' own native pointerdown/pointerup listeners - those call
// setPointerCapture/releasePointerCapture unconditionally and would throw without this shim.
function ensurePointerCaptureStubs(canvas) {
    if (typeof canvas.setPointerCapture !== "function") {
        canvas.setPointerCapture = () => {};
    }
    if (typeof canvas.releasePointerCapture !== "function") {
        canvas.releasePointerCapture = () => {};
    }
}

/**
 * Fires a pointer event against the wave instance. Two modes, both meant to produce
 * equivalent observable effects:
 * - "direct" (default): calls the mixin's capture-phase handler function directly. Bypasses
 *   real browser event dispatch/capture-phase ordering entirely - faster and simpler, but
 *   proves nothing about addEventListener wiring.
 * - "dispatch": dispatches a real event at wave.renderer.domElement, exercising the actual
 *   listener registration too. jsdom has no PointerEvent constructor, so a MouseEvent typed
 *   e.g. "pointerdown" is used instead; addEventListener("pointerdown", …) matches purely on
 *   the event's type string, so the mixin's handlers receive it identically (see spec §8.1).
 * @param {import("../../src/wave").Wave} wave
 * @param {"pointerdown"|"pointermove"|"pointerup"} type
 * @param {{x: number, y: number, button?: number}} coords - screen pixels, e.g. from projectToScreen
 * @param {{mode?: "direct"|"dispatch"}} [options]
 */
export function dispatchPointerEvent(wave, type, coords, { mode = "direct" } = {}) {
    // Per the Pointer Events spec, `button` only describes down/up transitions; a move event
    // not involved in a button transition reports -1, and the mixin's own handlers rely on
    // this (handlePointerMoveCapture_ never inspects `button`, only pointerDownPosition_).
    const button = coords.button ?? (type === "pointermove" ? -1 : 0);

    if (mode === "direct") {
        const handlerName = POINTER_CAPTURE_HANDLER_BY_TYPE[type];
        wave[handlerName]({ clientX: coords.x, clientY: coords.y, button });
        return;
    }

    ensurePointerCaptureStubs(wave.renderer.domElement);
    wave.renderer.domElement.dispatchEvent(
        new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: coords.x,
            clientY: coords.y,
            button,
        }),
    );
}

function resolveWorldPosition(target) {
    if (target && target.isMesh) return target.position;
    if (target && target.isVector3) return target;
    if (Array.isArray(target)) return new THREE.Vector3(...target);
    return target;
}

/**
 * Simulates a plain click (select) on an atom mesh or a world position: projects it to
 * screen coordinates and dispatches a pointerdown+pointerup pair at the SAME coordinates,
 * staying under the 5px click-vs-drag threshold so it registers as a selection, not a drag.
 * @param {import("../../src/wave").Wave} wave
 * @param {THREE.Mesh|THREE.Vector3|[number, number, number]} target
 * @returns {THREE.Mesh|null} wave.selectedMesh_ after the click, for convenient assertion
 */
export function simulateClick(wave, target) {
    const coords = projectToScreen(wave, resolveWorldPosition(target));
    dispatchPointerEvent(wave, "pointerdown", coords);
    dispatchPointerEvent(wave, "pointerup", coords);
    return wave.selectedMesh_;
}

/**
 * Simulates a click-and-drag directly on an atom, encoding the two-move requirement from
 * interactive_structure_editor.ts's beginAtomDrag_: the first pointermove must cross the 5px
 * click/drag threshold to commit to the drag (capturing the cursor-atom offset) WITHOUT
 * visibly moving the atom yet; only the second pointermove, at the full requested delta,
 * visibly moves it. Assumes wave.enableEditMode(true) was already called, and that dxPx/dyPx
 * are large enough (comfortably above 5px total) for the offset-establishing move to stay
 * safely between the threshold and the full delta.
 * @param {import("../../src/wave").Wave} wave
 * @param {THREE.Mesh} atomMesh
 * @param {number} dxPx
 * @param {number} dyPx
 * @param {{mode?: "direct"|"dispatch", assertIntermediateState?: boolean, onStructureModified?: Function}} [options]
 * @returns {{startPosition: THREE.Vector3, endPosition: THREE.Vector3, modifiedMaterial: any}}
 */
export function simulateAtomDrag(
    wave,
    atomMesh,
    dxPx,
    dyPx,
    { mode = "direct", assertIntermediateState = true, onStructureModified } = {},
) {
    const start = projectToScreen(wave, atomMesh.position);
    const startPosition = atomMesh.position.clone();

    // Intercept the wave-level callback for the duration of the drag so modifiedMaterial can
    // be returned regardless of how the caller wired up recording (getWaveWithRecordedCallbacks
    // or a plain settings.onStructureModified); the original callback (if any) still fires.
    let modifiedMaterial = null;
    const originalOnStructureModified = wave.settings.onStructureModified;
    wave.settings.onStructureModified = (material, ...rest) => {
        modifiedMaterial = material;
        if (onStructureModified) onStructureModified(material, ...rest);
        if (originalOnStructureModified) originalOnStructureModified(material, ...rest);
    };

    try {
        dispatchPointerEvent(wave, "pointerdown", start, { mode });
        if (assertIntermediateState) {
            expect(wave.isDraggingAtom_).toBe(false);
        }

        // A short step in the drag direction: enough to clear the 5px threshold, comfortably
        // short of the full delta, so this move only establishes the drag offset.
        const totalDistancePx = Math.hypot(dxPx, dyPx);
        const thresholdStepPx = Math.min(8, totalDistancePx / 2);
        const stepFraction = totalDistancePx > 0 ? thresholdStepPx / totalDistancePx : 0;
        const midpoint = { x: start.x + dxPx * stepFraction, y: start.y + dyPx * stepFraction };
        dispatchPointerEvent(wave, "pointermove", midpoint, { mode });
        if (assertIntermediateState) {
            expect(wave.isDraggingAtom_).toBe(true);
        }

        const end = { x: start.x + dxPx, y: start.y + dyPx };
        dispatchPointerEvent(wave, "pointermove", end, { mode });
        dispatchPointerEvent(wave, "pointerup", end, { mode });
        if (assertIntermediateState) {
            expect(wave.isDraggingAtom_).toBe(false);
        }
    } finally {
        wave.settings.onStructureModified = originalOnStructureModified;
    }

    return { startPosition, endPosition: atomMesh.position.clone(), modifiedMaterial };
}

/**
 * Simulates a rubber-band marquee selection (D-4): pointerdown on empty space, drag past the
 * click/drag threshold, pointerup - selecting every atom whose projected screen position
 * falls within the rectangle between the two points. shiftKey/ctrlKey/metaKey mirror the
 * modifiers handlePointerDownCapture_ reads (captured at marquee start) to decide how the
 * marquee's hits combine with the existing selection on release - see finishMarqueeSelection_
 * (replace/add/toggle).
 * @param {import("../../src/wave").Wave} wave
 * @param {{x: number, y: number}} startCoords - screen pixels of one corner (over empty space)
 * @param {{x: number, y: number}} endCoords - screen pixels of the opposite corner
 * @param {{shiftKey?: boolean, ctrlKey?: boolean, metaKey?: boolean, mode?: "direct"|"dispatch"}} [options]
 */
export function simulateMarqueeSelect(
    wave,
    startCoords,
    endCoords,
    { shiftKey = false, ctrlKey = false, metaKey = false, mode = "direct" } = {},
) {
    if (mode === "direct") {
        wave.handlePointerDownCapture_({
            clientX: startCoords.x,
            clientY: startCoords.y,
            button: 0,
            shiftKey,
            ctrlKey,
            metaKey,
        });
        wave.handlePointerMoveCapture_({ clientX: endCoords.x, clientY: endCoords.y, button: -1 });
        wave.handlePointerUpCapture_({ clientX: endCoords.x, clientY: endCoords.y, button: 0 });
        return;
    }

    ensurePointerCaptureStubs(wave.renderer.domElement);
    const canvas = wave.renderer.domElement;
    const fire = (type, coords, button) =>
        canvas.dispatchEvent(
            new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                clientX: coords.x,
                clientY: coords.y,
                button,
                shiftKey,
                ctrlKey,
                metaKey,
            }),
        );
    fire("pointerdown", startCoords, 0);
    fire("pointermove", endCoords, -1);
    fire("pointerup", endCoords, 0);
}

/**
 * Wraps getWaveInstance, recording every settings.* callback call the mixin makes
 * (onStructureModified, onSelectionChanged) into plain arrays instead of requiring each test
 * to hand-roll a closure. settingsOverrides is merged in on top, so a caller can still supply
 * its own material/settings; an optional settingsOverrides.material is passed through as
 * getWaveInstance's second argument rather than merged into settings (it isn't a wave setting).
 * If settingsOverrides itself defines onStructureModified/onSelectionChanged, both the override
 * and the recorder are invoked.
 * @param {object} [settingsOverrides]
 * @returns {{wave: import("../../src/wave").Wave, structureModifiedCalls: any[][], selectionChangedCalls: any[][]}}
 */
export function getWaveWithRecordedCallbacks(settingsOverrides = {}) {
    const { material, onStructureModified, onSelectionChanged, ...restOverrides } =
        settingsOverrides;

    const structureModifiedCalls = [];
    const selectionChangedCalls = [];

    const settings = {
        ...restOverrides,
        onStructureModified: (...args) => {
            structureModifiedCalls.push(args);
            if (onStructureModified) onStructureModified(...args);
        },
        onSelectionChanged: (...args) => {
            selectionChangedCalls.push(args);
            if (onSelectionChanged) onSelectionChanged(...args);
        },
    };

    const wave = material ? getWaveInstance(settings, material) : getWaveInstance(settings);

    return { wave, structureModifiedCalls, selectionChangedCalls };
}

/**
 * Sugar over takeSnapshotAndAssertEqualityAsync: renders the current scene state first (so
 * callers don't need to know that pixel comparison depends on an up-to-date framebuffer) and
 * reads the WebGL context off the wave instance.
 * @param {import("../../src/wave").Wave} wave
 * @param {string} imagePrefix
 * @returns {Promise<void>}
 */
export function expectVisualMatch(wave, imagePrefix) {
    wave.render();
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), imagePrefix);
}
