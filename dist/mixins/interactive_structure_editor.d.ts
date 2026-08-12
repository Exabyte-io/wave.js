import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
type Coordinate3D = [number, number, number];
/**
 * Mixin providing interactive structure editing capabilities inside the Wave visualizer.
 * Enforces strict object-oriented design and follows the "6 months x 3 beers" rule for comments.
 */
export declare const InteractiveStructureEditorMixin: (superclass: any) => {
    new (config: any): {
        [x: string]: any;
        transformControls_: TransformControls | null;
        transformDragStartPosition_: THREE.Vector3 | null;
        transformDragStartQuaternion_: THREE.Quaternion | null;
        raycaster_: THREE.Raycaster | null;
        pointer_: THREE.Vector2 | null;
        selectedMesh_: THREE.Mesh | null;
        selectedMeshes_: THREE.Mesh[];
        hoveredMesh_: THREE.Mesh | null;
        selectionHighlightPool_: THREE.Mesh[];
        hoverHighlightMesh_: THREE.Mesh | null;
        isEditModeEnabled_: boolean;
        pointerDownPosition_: {
            x: number;
            y: number;
        } | null;
        pendingDragAtom_: THREE.Mesh | null;
        isDraggingAtom_: boolean;
        dragPlane_: THREE.Plane | null;
        dragOffset_: THREE.Vector3 | null;
        dragStartPosition_: THREE.Vector3 | null;
        activePointerId_: number | null;
        orbitControlsEnabledBeforeDrag_: boolean;
        orbitControlsDefaultMouseButtons_: any | null;
        lastSelectedAtomicIndices_: number[] | null;
        handlePointerDownCapture_: ((event: PointerEvent) => void) | null;
        handlePointerMoveCapture_: ((event: PointerEvent) => void) | null;
        handlePointerUpCapture_: ((event: PointerEvent) => void) | null;
        handlePointerCancelCapture_: ((event: PointerEvent) => void) | null;
        handleEditModeKeyDown_: ((event: KeyboardEvent) => void) | null;
        /**
         * Initializes the Three.js TransformControls, adds them to the scene, and binds drag lifecycle listeners.
         * Dragging updates temporary camera locks to avoid rotation conflicts.
         */
        initializeEditor(): void;
        /**
         * Creates a camera-agnostic highlight halo: a slightly larger wireframe sphere layered
         * around an atom. Kept as a dedicated object with its own material rather than mutating
         * the atom mesh's own material.emissive, which spin-glow and measurement-hover already
         * write to - sharing that channel means selecting/deselecting an atom would erase
         * whichever of those effects got there first.
         */
        createHighlightMesh_(color: number, opacity: number): THREE.Mesh;
        /**
         * Positions and shows/hides a halo mesh around the given atom (or hides it if null).
         */
        updateHighlightMesh_(haloMesh: THREE.Mesh | null, atomMesh: THREE.Mesh | null): void;
        /**
         * Keeps exactly one visible halo per selected atom, reusing a pool rather than
         * creating/disposing geometry on every selection change or drag-frame update.
         */
        syncHighlightPoolTo_(meshes: THREE.Mesh[]): void;
        /**
         * Initializes the pointer vector and Raycaster used both for click-to-select and for
         * direct click-and-drag: pressing down on an atom and moving the pointer drags that atom
         * in the camera-facing plane immediately, without needing to separately grab a gizmo
         * handle first. A plain click (press+release with negligible movement) still only
         * selects, via handlePointerDown() below, matching the original click-to-select behavior;
         * the gizmo remains available afterwards for precise axis-constrained edits.
         *
         * Pressing down on empty space starts a marquee-select instead (see
         * updateMarqueeState_/finishMarqueeSelection_): orbiting the camera moves to a
         * right-mouse-drag while in edit mode (see enableEditMode) so the two gestures don't
         * collide on the same button (decision D-4).
         */
        initializeSelectionRaycaster(): void;
        /**
         * Updates the hover halo/cursor to whatever atom (if any) is under the pointer. Only
         * called while not already dragging/pending, so hover tracking never adds raycasts to
         * the hot path of an in-progress drag.
         */
        updateHoverFromPointer_(event: PointerEvent): void;
        /**
         * Selects the pending atom and sets up the camera-facing drag plane through its current
         * position, offset so the atom doesn't jump to snap its center to the cursor. If the
         * pressed atom is already part of a multi-selection, the whole selection drags together
         * rigidly (matching standard multi-select conventions) instead of collapsing to just the
         * pressed atom.
         */
        beginAtomDrag_(event: PointerEvent): void;
        /**
         * Finalizes a direct atom (or group) drag: restores camera orbiting and commits the
         * moved atom(s) as a single delta applied to the current material (see
         * commitMovedAtom_/commitMovedAtoms_) - one history entry regardless of how many atoms
         * moved.
         */
        endAtomDrag_(): void;
        /**
         * Abandons an in-progress direct atom (or group) drag (Esc / pointercancel): snaps every
         * dragged atom back to its pre-drag position and reports nothing - no history entry, no
         * callback.
         */
        cancelAtomDrag_(): void;
        releaseActiveDragPointer_(): void;
        /**
         * Points this.raycaster_ from the camera through the given pointer event's position,
         * converted to Normalized Device Coordinates (NDC).
         */
        updateRaycasterFromPointer_(event: PointerEvent): void;
        /**
         * Raycasts from the given pointer event through the atoms in the scene.
         * @returns the frontmost hit atom mesh, or null if none was hit.
         */
        getAtomAtPointer(event: PointerEvent): THREE.Mesh | null;
        /**
         * Raycasts from the given pointer event and intersects it with the given plane.
         * @returns the intersection point, or null if the ray is parallel to the plane.
         */
        getPointerPlaneIntersection(event: PointerEvent, plane: THREE.Plane): THREE.Vector3 | null;
        /**
         * Handles a plain click (no drag) on the canvas to select an atom mesh and attach the
         * transform gizmo, or to deselect when clicking empty space. Shift+click adds to the
         * current selection, Ctrl/Cmd+click toggles a single atom in/out of it; Shift/Ctrl+click
         * on empty space is a no-op (the current selection is left alone rather than being
         * surprisingly cleared mid-multi-select).
         * @param {PointerEvent} event - Native browser pointer event.
         */
        handlePointerDown(event: PointerEvent): void;
        /**
         * Highlights the given atom mesh and attaches the transform gizmo to it. Thin
         * single-atom wrapper over setSelectedAtomMeshes, kept for callers/tests that only ever
         * deal with one atom at a time.
         */
        setSelectedAtomMesh(atomMesh: THREE.Mesh): void;
        /**
         * Sets the full multi-atom selection: highlights every selected atom via the halo pool,
         * and attaches the gizmo directly to the sole atom (single selection) or to a pivot at
         * the selection's centroid (2+ atoms), so a group drag moves every selected atom rigidly
         * (see beginAtomDrag_/the TransformControls "change"/"mouseUp" listeners).
         */
        setSelectedAtomMeshes(meshes: THREE.Mesh[]): void;
        /**
         * Clears the current atom selection, removes its highlight(s), and detaches the gizmo.
         * @param {boolean} forgetLastSelection - Also forget the remembered indices used to
         * restore selection when edit mode is re-enabled (see enableEditMode). Defaults to true
         * for an explicit user deselect; enableEditMode(false) passes false so toggling edit
         * mode off and back on preserves the selection (R12).
         */
        clearSelection(forgetLastSelection?: boolean): void;
        /**
         * Single-atom-named alias for clearSelection, kept for existing callers/tests.
         */
        clearSelectedAtom(forgetLastSelection?: boolean): void;
        /**
         * Re-attaches the selection/gizmo to the atom meshes with the given atomicIndices.
         * Used after a scene rebuild, since rebuilding replaces every atom mesh instance and
         * would otherwise leave the gizmo attached to mesh(es) that no longer exist in the scene.
         * Clears the selection if none of the given indices match any atom any more (e.g. it was
         * deleted). Indices with no match are silently dropped rather than clearing everything,
         * so removing one atom out of a multi-selection keeps the rest selected.
         *
         * The sole place that notifies onSelectionChanged for a reselect, and only when the
         * result actually differs from what was selected going in - critically, this covers
         * rebuildScene() (wave.js), which calls this on every rebuild (including one triggered by
         * undo/redo, which can shift or remove indices out from under an unrelated rebuild) but
         * has no way to notify the host itself. Without this, undo/redo across an add/remove
         * boundary left the host's selection state pointing at an atomicIndex that had silently
         * stopped existing on the wave side. Callers that already know their own new selection
         * (addAtom, cloneSelectedAtoms, enableEditMode's restore) used to fire this explicitly
         * too; that's now redundant and has been removed to keep this the single source of truth.
         */
        reselectAtomsByIndices(atomicIndices: Array<number | null | undefined> | null | undefined): void;
        /**
         * Single-index-named alias for reselectAtomsByIndices, kept for existing callers/tests.
         */
        reselectAtomByIndex(atomicIndex: number | null | undefined): void;
        /**
         * Enables or disables edit mode interactions and controls visibility. Disabling
         * preserves the selection's indices (see clearSelection) so re-enabling edit mode
         * restores it (R12) rather than always starting deselected. While enabled, remaps the
         * OrbitControls left mouse button off (freeing it for marquee-select on empty space) and
         * moves camera rotation onto the right mouse button (decision D-4); the defaults are
         * restored on disable.
         * @param {boolean} enabled - True to enable, false to disable.
         */
        enableEditMode(enabled: boolean): void;
        /**
         * Shorthand for disabling edit mode.
         */
        disableEditMode(): void;
        /**
         * Updates the TransformControls mode (translate, rotate).
         * @param {string} mode - Mode name ("translate" or "rotate").
         */
        setTransformMode(mode: "translate" | "rotate"): void;
        /**
         * Re-points the edit gizmo at the newly active camera so dragging keeps working
         * after the user switches between perspective and orthographic projection.
         */
        toggleOrthographicCamera(): void;
        /**
         * Applies a basis mutation to a clone of the wave's own current structure, preserving
         * its lattice, units, metadata, labels, and constraints exactly - only the fields the
         * callback actually touches change. This replaces the old approach of re-deriving the
         * whole material from the live Three.js scene on every edit (ThreeDSceneDataToMaterial),
         * which was a lossy round trip: it reintroduced the lattice to only ~1e-7 precision
         * (causing spurious camera resets, D1) and could pick up bond/boundary/repetition meshes
         * as phantom atoms (D5) - a class of bug that a delta applied to the known material
         * cannot reintroduce, because the lattice and every untouched atom are never recomputed.
         */
        applyBasisDelta_(mutateBasis: (basis: any) => void): any;
        /**
         * Adds an atom to the structure and triggers scene reconstruction. The new atom is
         * auto-selected once the scene has rebuilt around the updated material.
         * @param {string} elementName - Chemical element symbol (e.g. "Si").
         * @param {Array<number>} cartesianCoordinates - [x, y, z] position in Cartesian space.
         */
        addAtom(elementName: string, cartesianCoordinates: Coordinate3D): void;
        /**
         * Removes the currently selected atom(s) from the structure - the whole multi-selection
         * if 2+ atoms are selected (as one commit, one history entry), or the single selected
         * atom otherwise.
         */
        removeSelectedAtom(): void;
        /**
         * Removes every currently multi-selected atom as a single delta/commit.
         */
        removeSelectedAtoms_(): void;
        /**
         * Duplicates every selected atom at a small offset from its source, preserving element
         * and (for the group case) relative positions, as a single commit. The clones become the
         * new selection, matching Add Atom's auto-select behavior. Old-editor parity: its "clone
         * existing" was one of only two ways to add an atom of a specific element, the other
         * being a plain add-then-rename (see changeAtomElement / D-9).
         *
         * Shares Add Atom's occupied-site guard (D22): the offset nudges further along the same
         * diagonal until clear of every existing atom (and of any sibling clone already placed
         * earlier in this same call, so cloning several selected atoms at once can't collide with
         * each other either), so cloning the same atom repeatedly doesn't silently stack
         * coincident duplicates.
         */
        cloneSelectedAtoms(): void;
        /**
         * Frames the camera on the current selection's bounding sphere, preserving the current
         * viewing angle (only re-targeting and re-distancing, not resetting to a canonical
         * axis-aligned view like adjustCamerasAndOrbitControlsToCell does for the whole cell).
         * The one camera move an edit-mode interaction is allowed to make, since it's a direct,
         * explicit user action (F key) rather than a side effect of an edit (US-12).
         */
        focusCameraOnSelection(): void;
        /**
         * Commits a single moved atom (from either a direct drag or a gizmo drag) as one delta
         * applied to the current material, then rebuilds the scene around it. rebuildScene()
         * itself preserves the selection/gizmo across the rebuild when in edit mode (see
         * wave.js), so no explicit reselect is needed here for the move case.
         */
        commitMovedAtom_(atomicIndex: number, cartesianPosition: THREE.Vector3, source: string): void;
        /**
         * Commits any number of moved atoms as a single delta/commit (one history entry) applied
         * to the current material, then rebuilds the scene around it. `source` (spec Sec6.2's
         * onEditCommit contract - "drag" for a direct body-drag, "gizmo" for a TransformControls
         * drag) is forwarded to onStructureModified so ThreeDEditor.jsx can pass it on to a host's
         * onEditCommit without having to re-infer which gesture produced this commit.
         */
        commitMovedAtoms_(moves: Array<{
            atomicIndex: number;
            position: THREE.Vector3;
        }>, source: string): void;
        /**
         * Lifecycle hook to dispose event listeners and objects on visualizer destruction.
         */
        dispose(): void;
    };
    [x: string]: any;
};
export {};
