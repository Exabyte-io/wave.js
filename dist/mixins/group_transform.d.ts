import * as THREE from "three";
/**
 * Mixin providing rigid group transforms (translate/rotate about a shared centroid pivot) for
 * InteractiveStructureEditorMixin's multi-atom selection: a 2+ atom selection drags or rotates
 * together as one commit, matching the old editor's MultipleSelectionControls pivot-group
 * behavior (decision D-4). Composed alongside InteractiveStructureEditorMixin, which owns the
 * TransformControls lifecycle listeners and the direct-drag pointer handlers that call into this
 * mixin's helpers, and shares its `this` - selectedMeshes_, transformControls_,
 * commitMovedAtoms_, etc. all live on the base mixin.
 */
export declare const GroupTransformMixin: (superclass: any) => {
    new (config: any): {
        [x: string]: any;
        selectionPivot_: THREE.Object3D | null;
        groupDragStartPositions_: Map<THREE.Mesh, THREE.Vector3> | null;
        isDraggingGroup_: boolean;
        /**
         * Repositions the group-transform pivot at the current selection's centroid and attaches
         * the gizmo to it.
         */
        attachPivotToSelection_(): void;
        /**
         * Shared by attachPivotToSelection_ and the group direct-drag move handler, which must
         * keep the pivot (and therefore the visible gizmo) tracking the group's centroid as it
         * moves - without this, the gizmo would stay frozen at the pre-drag centroid for the
         * whole gesture and only jump to the correct spot once the post-commit rebuild reattaches
         * it.
         */
        computeCentroid_(meshes: THREE.Mesh[]): THREE.Vector3;
        /**
         * Snapshots every selected atom's current position, keyed by mesh, so a group gizmo or
         * direct drag can compute each frame's delta against a fixed start rather than the
         * previous frame (which would accumulate rounding error) and so Esc can revert cleanly.
         */
        captureGroupDragStartPositions_(): void;
        /**
         * Called on every TransformControls "change" event while the group pivot is the object
         * being dragged: propagates the pivot's live translate/rotate delta to every selected
         * atom so the group moves rigidly together during the gesture, not just once on commit.
         * Translate mode applies the pivot's position delta to each atom; rotate mode leaves the
         * pivot's position fixed at the centroid and instead rotates each atom's offset from it
         * by the pivot's quaternion, so the group rotates rigidly about its shared centroid.
         */
        handleGroupPivotChange_(): void;
        /**
         * Commits a completed group gizmo drag (translate or rotate) as a single delta/commit -
         * called from the TransformControls "mouseUp" listener once it's determined the pivot
         * (not a lone atom) was the dragged object and it actually moved/rotated.
         */
        commitGroupGizmoDrag_(wasRotate: boolean): void;
        /**
         * If a group direct-drag (not the gizmo) is in progress, moves every selected atom by
         * the same delta as the pressed atom and keeps the pivot tracking the live centroid.
         * Returns whether it applied - the caller falls back to moving just the pending atom
         * when this returns false, matching a lone-atom (or gizmo) drag.
         */
        applyGroupDragDelta_(newPosition: THREE.Vector3): boolean;
    };
    [x: string]: any;
};
