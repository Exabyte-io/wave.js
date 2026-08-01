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
export const GroupTransformMixin = (superclass: any) =>
    class extends superclass {
        selectionPivot_: THREE.Object3D | null;

        groupDragStartPositions_: Map<THREE.Mesh, THREE.Vector3> | null;

        isDraggingGroup_: boolean;

        constructor(config: any) {
            super(config);

            this.selectionPivot_ = null;
            this.groupDragStartPositions_ = null;
            this.isDraggingGroup_ = false;
        }

        /**
         * Repositions the group-transform pivot at the current selection's centroid and attaches
         * the gizmo to it.
         */
        attachPivotToSelection_(): void {
            if (!this.selectionPivot_ || this.selectedMeshes_.length === 0) return;
            this.selectionPivot_.position.copy(this.computeCentroid_(this.selectedMeshes_));
            // A fresh attach always starts unrotated, even if a previous group drag left the
            // pivot's quaternion non-identity for any reason (the mouseUp handler already resets
            // it after every rotate commit - this is a defensive backstop, not the primary path).
            this.selectionPivot_.quaternion.identity();
            if (this.transformControls_) this.transformControls_.attach(this.selectionPivot_);
        }

        /**
         * Shared by attachPivotToSelection_ and the group direct-drag move handler, which must
         * keep the pivot (and therefore the visible gizmo) tracking the group's centroid as it
         * moves - without this, the gizmo would stay frozen at the pre-drag centroid for the
         * whole gesture and only jump to the correct spot once the post-commit rebuild reattaches
         * it.
         */
        // eslint-disable-next-line class-methods-use-this
        computeCentroid_(meshes: THREE.Mesh[]): THREE.Vector3 {
            const centroid = new THREE.Vector3();
            meshes.forEach((mesh: THREE.Mesh) => centroid.add(mesh.position));
            return centroid.divideScalar(meshes.length);
        }

        /**
         * Snapshots every selected atom's current position, keyed by mesh, so a group gizmo or
         * direct drag can compute each frame's delta against a fixed start rather than the
         * previous frame (which would accumulate rounding error) and so Esc can revert cleanly.
         */
        captureGroupDragStartPositions_(): void {
            this.groupDragStartPositions_ = new Map(
                this.selectedMeshes_.map((mesh: THREE.Mesh) => [mesh, mesh.position.clone()]),
            );
        }

        /**
         * Called on every TransformControls "change" event while the group pivot is the object
         * being dragged: propagates the pivot's live translate/rotate delta to every selected
         * atom so the group moves rigidly together during the gesture, not just once on commit.
         * Translate mode applies the pivot's position delta to each atom; rotate mode leaves the
         * pivot's position fixed at the centroid and instead rotates each atom's offset from it
         * by the pivot's quaternion, so the group rotates rigidly about its shared centroid.
         */
        handleGroupPivotChange_(): void {
            // Captured as a local so its non-null-ness (checked right below) narrows reliably -
            // transformControls_/transformDragStartPosition_ are declared on a sibling mixin
            // class (InteractiveStructureEditorMixin), not this one, so TS sees them as `any`
            // here and won't propagate narrowing from a compound guard into selectionPivot_.
            const pivot = this.selectionPivot_;
            if (
                !pivot ||
                !this.transformControls_?.dragging ||
                this.transformControls_.object !== pivot ||
                !this.groupDragStartPositions_ ||
                !this.transformDragStartPosition_
            ) {
                return;
            }
            if (this.transformControls_.mode === "rotate") {
                const pivotCenter = this.transformDragStartPosition_;
                const rotation = pivot.quaternion;
                this.selectedMeshes_.forEach((mesh: THREE.Mesh) => {
                    const start = this.groupDragStartPositions_?.get(mesh);
                    if (!start) return;
                    const offset = start.clone().sub(pivotCenter).applyQuaternion(rotation);
                    mesh.position.copy(pivotCenter.clone().add(offset));
                });
            } else {
                const delta = pivot.position.clone().sub(this.transformDragStartPosition_);
                this.selectedMeshes_.forEach((mesh: THREE.Mesh) => {
                    const start = this.groupDragStartPositions_?.get(mesh);
                    if (start) mesh.position.copy(start.clone().add(delta));
                });
            }
            this.syncHighlightPoolTo_(this.selectedMeshes_);
        }

        /**
         * Commits a completed group gizmo drag (translate or rotate) as a single delta/commit -
         * called from the TransformControls "mouseUp" listener once it's determined the pivot
         * (not a lone atom) was the dragged object and it actually moved/rotated.
         */
        commitGroupGizmoDrag_(wasRotate: boolean): void {
            this.commitMovedAtoms_(
                this.selectedMeshes_.map((mesh: THREE.Mesh) => ({
                    atomicIndex: mesh.userData.atomicIndex,
                    position: mesh.position.clone(),
                })),
                "gizmo",
            );
            if (wasRotate) {
                // The pivot's rotation is relative to each drag, not cumulative across drags -
                // the atoms' new positions already encode the rotation, so reset it to identity
                // for the next attach/drag. Optional-chained defensively: this is only ever
                // called once the caller has confirmed selectionPivot_ was the dragged object,
                // but that guard lives in the caller, not in this method's own type narrowing.
                this.selectionPivot_?.quaternion.identity();
            }
        }

        /**
         * If a group direct-drag (not the gizmo) is in progress, moves every selected atom by
         * the same delta as the pressed atom and keeps the pivot tracking the live centroid.
         * Returns whether it applied - the caller falls back to moving just the pending atom
         * when this returns false, matching a lone-atom (or gizmo) drag.
         */
        applyGroupDragDelta_(newPosition: THREE.Vector3): boolean {
            if (
                !this.isDraggingGroup_ ||
                !this.groupDragStartPositions_ ||
                !this.pendingDragAtom_
            ) {
                return false;
            }
            const draggedStart = this.groupDragStartPositions_.get(this.pendingDragAtom_);
            if (draggedStart) {
                const delta = newPosition.clone().sub(draggedStart);
                this.selectedMeshes_.forEach((mesh: THREE.Mesh) => {
                    const start = this.groupDragStartPositions_?.get(mesh);
                    if (start) mesh.position.copy(start.clone().add(delta));
                });
                if (this.selectionPivot_) {
                    this.selectionPivot_.position.copy(this.computeCentroid_(this.selectedMeshes_));
                }
            }
            return true;
        }
    };
