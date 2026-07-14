import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
const HOVER_HIGHLIGHT_COLOR = 0x54aeff;
const SELECTION_HIGHLIGHT_COLOR = 0x0969da;
const HIGHLIGHT_SCALE_FACTOR = 1.25;
const DRAG_THRESHOLD_PX = 5;
const DRAG_COMMIT_EPSILON = 1e-6;
/**
 * Mixin providing interactive structure editing capabilities inside the Wave visualizer.
 * Enforces strict object-oriented design and follows the "6 months x 3 beers" rule for comments.
 */
export const InteractiveStructureEditorMixin = (superclass) => class extends superclass {
    constructor(config) {
        super(config);
        this.transformControls_ = null;
        this.transformDragStartPosition_ = null;
        this.raycaster_ = null;
        this.pointer_ = null;
        this.selectedMesh_ = null;
        this.hoveredMesh_ = null;
        this.selectionHighlightMesh_ = null;
        this.hoverHighlightMesh_ = null;
        this.isEditModeEnabled_ = false;
        this.pointerDownPosition_ = null;
        this.pendingDragAtom_ = null;
        this.isDraggingAtom_ = false;
        this.dragPlane_ = null;
        this.dragOffset_ = null;
        this.dragStartPosition_ = null;
        this.activePointerId_ = null;
        this.orbitControlsEnabledBeforeDrag_ = true;
        this.lastSelectedAtomicIndex_ = null;
        this.handlePointerDownCapture_ = null;
        this.handlePointerMoveCapture_ = null;
        this.handlePointerUpCapture_ = null;
        this.handlePointerCancelCapture_ = null;
        this.handleEditModeKeyDown_ = null;
        this.initializeEditor = this.initializeEditor.bind(this);
        this.initializeSelectionRaycaster = this.initializeSelectionRaycaster.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.setTransformMode = this.setTransformMode.bind(this);
        this.addAtom = this.addAtom.bind(this);
        this.removeSelectedAtom = this.removeSelectedAtom.bind(this);
        this.enableEditMode = this.enableEditMode.bind(this);
        this.disableEditMode = this.disableEditMode.bind(this);
        this.toggleOrthographicCamera = this.toggleOrthographicCamera.bind(this);
        // Setup editor components after parent class setup is complete
        this.initializeEditor();
        this.initializeSelectionRaycaster();
    }
    /**
     * Initializes the Three.js TransformControls, adds them to the scene, and binds drag lifecycle listeners.
     * Dragging updates temporary camera locks to avoid rotation conflicts.
     */
    initializeEditor() {
        this.transformControls_ = new TransformControls(this.camera, this.renderer.domElement);
        this.scene.add(this.transformControls_);
        this.selectionHighlightMesh_ = this.createHighlightMesh_(SELECTION_HIGHLIGHT_COLOR, 0.9);
        this.hoverHighlightMesh_ = this.createHighlightMesh_(HOVER_HIGHLIGHT_COLOR, 0.5);
        this.scene.add(this.selectionHighlightMesh_);
        this.scene.add(this.hoverHighlightMesh_);
        // Rerender the viewport on every translation/rotation frame update
        this.transformControls_.addEventListener("change", () => {
            this.render();
        });
        // Disables the OrbitControls while dragging an atom to avoid camera movement conflicts
        this.transformControls_.addEventListener("dragging-changed", (event) => {
            var _a, _b, _c, _d, _e;
            if (event.value) {
                this.orbitControlsEnabledBeforeDrag_ = (_b = (_a = this.orbitControls) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : true;
                if (this.orbitControls)
                    this.orbitControls.enabled = false;
                // Snapshot the object's position when a drag starts so mouseUp can tell
                // whether the gizmo actually moved anything (a zero-movement click-release
                // must not commit), and Esc can revert to it.
                this.transformDragStartPosition_ =
                    (_e = (_d = (_c = this.transformControls_) === null || _c === void 0 ? void 0 : _c.object) === null || _d === void 0 ? void 0 : _d.position.clone()) !== null && _e !== void 0 ? _e : null;
            }
            else {
                if (this.orbitControls) {
                    this.orbitControls.enabled = this.orbitControlsEnabledBeforeDrag_;
                }
                this.transformDragStartPosition_ = null;
            }
        });
        // Rerender scene and trigger callbacks when the drag operation completes
        this.transformControls_.addEventListener("mouseUp", () => {
            var _a;
            const draggedObject = (_a = this.transformControls_) === null || _a === void 0 ? void 0 : _a.object;
            const startPosition = this.transformDragStartPosition_;
            const hasMoved = !!draggedObject &&
                !!startPosition &&
                draggedObject.position.distanceTo(startPosition) > DRAG_COMMIT_EPSILON;
            if (!hasMoved || !draggedObject)
                return;
            this.commitMovedAtom_(draggedObject.userData.atomicIndex, draggedObject.position);
        });
    }
    /**
     * Creates a camera-agnostic highlight halo: a slightly larger wireframe sphere layered
     * around an atom. Kept as a dedicated object with its own material rather than mutating
     * the atom mesh's own material.emissive, which spin-glow and measurement-hover already
     * write to - sharing that channel means selecting/deselecting an atom would erase
     * whichever of those effects got there first.
     */
    // eslint-disable-next-line class-methods-use-this
    createHighlightMesh_(color, opacity) {
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            wireframe: true,
            depthWrite: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.visible = false;
        // Never itself a raycast/pick target.
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        mesh.raycast = () => { };
        return mesh;
    }
    /**
     * Positions and shows/hides a halo mesh around the given atom (or hides it if null).
     */
    // eslint-disable-next-line class-methods-use-this
    updateHighlightMesh_(haloMesh, atomMesh) {
        if (!haloMesh)
            return;
        if (!atomMesh) {
            haloMesh.visible = false;
            return;
        }
        haloMesh.position.copy(atomMesh.position);
        const radius = atomMesh.scale.x * HIGHLIGHT_SCALE_FACTOR;
        haloMesh.scale.set(radius, radius, radius);
        haloMesh.visible = true;
    }
    /**
     * Initializes the pointer vector and Raycaster used both for click-to-select and for
     * direct click-and-drag: pressing down on an atom and moving the pointer drags that atom
     * in the camera-facing plane immediately, without needing to separately grab a gizmo
     * handle first. A plain click (press+release with negligible movement) still only
     * selects, via handlePointerDown() below, matching the original click-to-select behavior;
     * the gizmo remains available afterwards for precise axis-constrained edits.
     */
    initializeSelectionRaycaster() {
        this.raycaster_ = new THREE.Raycaster();
        this.pointer_ = new THREE.Vector2();
        this.handlePointerDownCapture_ = (event) => {
            var _a;
            // Only the primary (left) button starts a selection or drag; a PointerEvent
            // constructed without an explicit button (as synthetic test events often are)
            // defaults to 0 per spec, so only reject an EXPLICIT non-zero button.
            if (event.button !== undefined && event.button !== 0)
                return;
            this.pointerDownPosition_ = { x: event.clientX, y: event.clientY };
            this.pendingDragAtom_ = null;
            this.isDraggingAtom_ = false;
            this.activePointerId_ = (_a = event.pointerId) !== null && _a !== void 0 ? _a : null;
            if (!this.isEditModeEnabled_)
                return;
            // Let TransformControls handle its own gizmo-handle drags exclusively
            if (this.transformControls_ && this.transformControls_.dragging)
                return;
            this.pendingDragAtom_ = this.getAtomAtPointer(event);
        };
        this.handlePointerMoveCapture_ = (event) => {
            if (this.isEditModeEnabled_ && !this.pendingDragAtom_ && !this.isDraggingAtom_) {
                this.updateHoverFromPointer_(event);
            }
            if (!this.pendingDragAtom_)
                return;
            if (!this.isDraggingAtom_) {
                if (!this.pointerDownPosition_)
                    return;
                const distance = Math.sqrt((event.clientX - this.pointerDownPosition_.x) ** 2 +
                    (event.clientY - this.pointerDownPosition_.y) ** 2);
                // Only commit to a drag once the pointer has moved a few pixels, so a plain
                // click still falls through to handlePointerUpCapture_'s select-only path.
                if (distance < DRAG_THRESHOLD_PX)
                    return;
                this.beginAtomDrag_(event);
            }
            if (!this.dragPlane_ || !this.dragOffset_)
                return;
            const point = this.getPointerPlaneIntersection(event, this.dragPlane_);
            if (!point)
                return;
            this.pendingDragAtom_.position.copy(point.add(this.dragOffset_));
            this.updateHighlightMesh_(this.selectionHighlightMesh_, this.pendingDragAtom_);
            this.render();
        };
        this.handlePointerUpCapture_ = (event) => {
            if (this.isDraggingAtom_ && this.pendingDragAtom_) {
                this.endAtomDrag_();
                return;
            }
            this.pendingDragAtom_ = null;
            if (!this.pointerDownPosition_)
                return;
            const distance = Math.sqrt((event.clientX - this.pointerDownPosition_.x) ** 2 +
                (event.clientY - this.pointerDownPosition_.y) ** 2);
            // Perform raycasting selection only if pointer movement is negligible (less than
            // DRAG_THRESHOLD_PX)
            if (distance < DRAG_THRESHOLD_PX) {
                this.handlePointerDown(event);
            }
            this.pointerDownPosition_ = null;
        };
        // A pointercancel (browser/OS interrupts the gesture - e.g. a tab switch mid-drag)
        // must abandon the drag exactly like Esc: revert position, commit nothing.
        this.handlePointerCancelCapture_ = () => {
            if (this.isDraggingAtom_) {
                this.cancelAtomDrag_();
            }
            else {
                this.pendingDragAtom_ = null;
                this.pointerDownPosition_ = null;
            }
        };
        this.renderer.domElement.addEventListener("pointerdown", this.handlePointerDownCapture_);
        this.renderer.domElement.addEventListener("pointermove", this.handlePointerMoveCapture_);
        this.renderer.domElement.addEventListener("pointerup", this.handlePointerUpCapture_);
        this.renderer.domElement.addEventListener("pointercancel", this.handlePointerCancelCapture_);
        this.handleEditModeKeyDown_ = (event) => {
            var _a;
            if (!this.isEditModeEnabled_)
                return;
            if (event.key !== "Escape")
                return;
            if (this.isDraggingAtom_ || ((_a = this.transformControls_) === null || _a === void 0 ? void 0 : _a.dragging)) {
                this.cancelAtomDrag_();
            }
            else if (this.selectedMesh_) {
                this.clearSelectedAtom();
                if (this.settings.onSelectionChanged) {
                    this.settings.onSelectionChanged(null);
                }
                this.render();
            }
        };
        document.addEventListener("keydown", this.handleEditModeKeyDown_);
    }
    /**
     * Updates the hover halo/cursor to whatever atom (if any) is under the pointer. Only
     * called while not already dragging/pending, so hover tracking never adds raycasts to
     * the hot path of an in-progress drag.
     */
    updateHoverFromPointer_(event) {
        const atomUnderPointer = this.getAtomAtPointer(event);
        if (atomUnderPointer === this.hoveredMesh_)
            return;
        this.hoveredMesh_ = atomUnderPointer;
        this.updateHighlightMesh_(this.hoverHighlightMesh_, atomUnderPointer);
        this.renderer.domElement.style.cursor = atomUnderPointer ? "move" : "";
        this.render();
    }
    /**
     * Selects the pending atom and sets up the camera-facing drag plane through its current
     * position, offset so the atom doesn't jump to snap its center to the cursor.
     */
    beginAtomDrag_(event) {
        var _a, _b;
        if (!this.pendingDragAtom_)
            return;
        this.isDraggingAtom_ = true;
        this.dragStartPosition_ = this.pendingDragAtom_.position.clone();
        this.setSelectedAtomMesh(this.pendingDragAtom_);
        if (this.settings.onSelectionChanged) {
            this.settings.onSelectionChanged(this.pendingDragAtom_.userData.atomicIndex);
        }
        this.orbitControlsEnabledBeforeDrag_ = (_b = (_a = this.orbitControls) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : true;
        if (this.orbitControls)
            this.orbitControls.enabled = false;
        if (this.activePointerId_ !== null &&
            typeof this.renderer.domElement.setPointerCapture === "function") {
            this.renderer.domElement.setPointerCapture(this.activePointerId_);
        }
        this.hoveredMesh_ = null;
        this.updateHighlightMesh_(this.hoverHighlightMesh_, null);
        this.renderer.domElement.style.cursor = "grabbing";
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        this.dragPlane_ = new THREE.Plane().setFromNormalAndCoplanarPoint(cameraDirection, this.pendingDragAtom_.position);
        const startPoint = this.getPointerPlaneIntersection(event, this.dragPlane_);
        this.dragOffset_ = startPoint
            ? this.pendingDragAtom_.position.clone().sub(startPoint)
            : new THREE.Vector3();
    }
    /**
     * Finalizes a direct atom drag: restores camera orbiting and commits the moved atom as
     * a single delta applied to the current material (see commitMovedAtom_).
     */
    endAtomDrag_() {
        const atom = this.pendingDragAtom_;
        this.releaseActiveDragPointer_();
        this.isDraggingAtom_ = false;
        this.pendingDragAtom_ = null;
        this.pointerDownPosition_ = null;
        this.dragStartPosition_ = null;
        if (this.orbitControls)
            this.orbitControls.enabled = this.orbitControlsEnabledBeforeDrag_;
        this.renderer.domElement.style.cursor = "";
        if (atom) {
            this.commitMovedAtom_(atom.userData.atomicIndex, atom.position);
        }
    }
    /**
     * Abandons an in-progress direct atom drag (Esc / pointercancel): snaps the atom back to
     * its pre-drag position and reports nothing - no history entry, no callback.
     */
    cancelAtomDrag_() {
        if (this.pendingDragAtom_ && this.dragStartPosition_) {
            this.pendingDragAtom_.position.copy(this.dragStartPosition_);
            this.updateHighlightMesh_(this.selectionHighlightMesh_, this.pendingDragAtom_);
            this.render();
        }
        this.releaseActiveDragPointer_();
        this.isDraggingAtom_ = false;
        this.pendingDragAtom_ = null;
        this.pointerDownPosition_ = null;
        this.dragStartPosition_ = null;
        if (this.orbitControls)
            this.orbitControls.enabled = this.orbitControlsEnabledBeforeDrag_;
        this.renderer.domElement.style.cursor = "";
    }
    releaseActiveDragPointer_() {
        if (this.activePointerId_ !== null &&
            typeof this.renderer.domElement.releasePointerCapture === "function" &&
            typeof this.renderer.domElement.hasPointerCapture === "function" &&
            this.renderer.domElement.hasPointerCapture(this.activePointerId_)) {
            this.renderer.domElement.releasePointerCapture(this.activePointerId_);
        }
        this.activePointerId_ = null;
    }
    /**
     * Points this.raycaster_ from the camera through the given pointer event's position,
     * converted to Normalized Device Coordinates (NDC).
     */
    updateRaycasterFromPointer_(event) {
        if (!this.pointer_ || !this.raycaster_)
            return;
        const boundingRectangle = this.renderer.domElement.getBoundingClientRect();
        this.pointer_.x =
            ((event.clientX - boundingRectangle.left) / boundingRectangle.width) * 2 - 1;
        this.pointer_.y =
            -((event.clientY - boundingRectangle.top) / boundingRectangle.height) * 2 + 1;
        this.raycaster_.setFromCamera(this.pointer_, this.camera);
    }
    /**
     * Raycasts from the given pointer event through the atoms in the scene.
     * @returns the frontmost hit atom mesh, or null if none was hit.
     */
    getAtomAtPointer(event) {
        if (!this.pointer_ || !this.raycaster_)
            return null;
        this.updateRaycasterFromPointer_(event);
        const intersections = this.raycaster_.intersectObjects(this.collectAllAtoms());
        return intersections.length > 0 ? intersections[0].object : null;
    }
    /**
     * Raycasts from the given pointer event and intersects it with the given plane.
     * @returns the intersection point, or null if the ray is parallel to the plane.
     */
    getPointerPlaneIntersection(event, plane) {
        if (!this.pointer_ || !this.raycaster_)
            return null;
        this.updateRaycasterFromPointer_(event);
        const target = new THREE.Vector3();
        return this.raycaster_.ray.intersectPlane(plane, target) ? target : null;
    }
    /**
     * Handles a plain click (no drag) on the canvas to select an atom mesh and attach the
     * transform gizmo, or to deselect when clicking empty space.
     * @param {PointerEvent} event - Native browser pointer event.
     */
    handlePointerDown(event) {
        if (!this.isEditModeEnabled_)
            return;
        // Block new selection raycasts if the user is already interacting with the TransformControls handles
        if (this.transformControls_ && this.transformControls_.dragging)
            return;
        const selectedAtomMesh = this.getAtomAtPointer(event);
        if (selectedAtomMesh) {
            this.setSelectedAtomMesh(selectedAtomMesh);
            if (this.settings.onSelectionChanged) {
                this.settings.onSelectionChanged(selectedAtomMesh.userData.atomicIndex);
            }
            this.render();
        }
        else {
            // Clicking on empty space detaches the transform controls gizmo
            this.clearSelectedAtom();
            if (this.settings.onSelectionChanged) {
                this.settings.onSelectionChanged(null);
            }
            this.render();
        }
    }
    /**
     * Highlights the given atom mesh and attaches the transform gizmo to it.
     */
    setSelectedAtomMesh(atomMesh) {
        var _a;
        this.selectedMesh_ = atomMesh;
        this.lastSelectedAtomicIndex_ = (_a = atomMesh.userData.atomicIndex) !== null && _a !== void 0 ? _a : null;
        this.updateHighlightMesh_(this.selectionHighlightMesh_, atomMesh);
        if (this.transformControls_)
            this.transformControls_.attach(atomMesh);
    }
    /**
     * Clears the current atom selection, removes its highlight, and detaches the gizmo.
     * @param {boolean} forgetLastSelection - Also forget the remembered index used to
     * restore selection when edit mode is re-enabled (see enableEditMode). Defaults to true
     * for an explicit user deselect; enableEditMode(false) passes false so toggling edit
     * mode off and back on preserves the selection (R12).
     */
    clearSelectedAtom(forgetLastSelection = true) {
        this.selectedMesh_ = null;
        this.updateHighlightMesh_(this.selectionHighlightMesh_, null);
        if (forgetLastSelection)
            this.lastSelectedAtomicIndex_ = null;
        if (this.transformControls_)
            this.transformControls_.detach();
    }
    /**
     * Re-attaches the selection/gizmo to the atom mesh with the given atomicIndex.
     * Used after a scene rebuild, since rebuilding replaces every atom mesh instance and
     * would otherwise leave the gizmo attached to a mesh that no longer exists in the scene.
     * Clears the selection if no atom with a matching index exists any more (e.g. it was deleted).
     */
    reselectAtomByIndex(atomicIndex) {
        if (atomicIndex === null || atomicIndex === undefined)
            return;
        const match = this.collectAllAtoms().find((atom) => atom.userData.atomicIndex === atomicIndex);
        if (match) {
            this.setSelectedAtomMesh(match);
        }
        else {
            this.clearSelectedAtom();
        }
    }
    /**
     * Enables or disables edit mode interactions and controls visibility. Disabling
     * preserves the selected atom's index (see clearSelectedAtom) so re-enabling edit mode
     * restores it (R12) rather than always starting deselected.
     * @param {boolean} enabled - True to enable, false to disable.
     */
    enableEditMode(enabled) {
        var _a, _b;
        this.isEditModeEnabled_ = enabled;
        if (!enabled) {
            if (this.isDraggingAtom_)
                this.cancelAtomDrag_();
            this.hoveredMesh_ = null;
            this.updateHighlightMesh_(this.hoverHighlightMesh_, null);
            this.renderer.domElement.style.cursor = "";
            if (this.transformControls_) {
                this.clearSelectedAtom(false);
                if (this.settings.onSelectionChanged) {
                    this.settings.onSelectionChanged(null);
                }
                this.render();
            }
        }
        else if (this.lastSelectedAtomicIndex_ !== null) {
            this.reselectAtomByIndex(this.lastSelectedAtomicIndex_);
            if (this.settings.onSelectionChanged) {
                this.settings.onSelectionChanged((_b = (_a = this.selectedMesh_) === null || _a === void 0 ? void 0 : _a.userData.atomicIndex) !== null && _b !== void 0 ? _b : null);
            }
        }
    }
    /**
     * Shorthand for disabling edit mode.
     */
    disableEditMode() {
        this.enableEditMode(false);
    }
    /**
     * Updates the TransformControls mode (translate, rotate).
     * @param {string} mode - Mode name ("translate" or "rotate").
     */
    setTransformMode(mode) {
        if (this.transformControls_) {
            this.transformControls_.setMode(mode);
        }
    }
    /**
     * Re-points the edit gizmo at the newly active camera so dragging keeps working
     * after the user switches between perspective and orthographic projection.
     */
    toggleOrthographicCamera() {
        super.toggleOrthographicCamera();
        if (this.transformControls_) {
            this.transformControls_.camera = this.camera;
        }
    }
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
    applyBasisDelta_(mutateBasis) {
        const updatedMaterial = this.structure.clone();
        const basis = updatedMaterial.Basis;
        mutateBasis(basis);
        updatedMaterial.setBasis(basis.toJSON());
        return updatedMaterial;
    }
    /**
     * Adds an atom to the structure and triggers scene reconstruction. The new atom is
     * auto-selected once the scene has rebuilt around the updated material.
     * @param {string} elementName - Chemical element symbol (e.g. "Si").
     * @param {Array<number>} cartesianCoordinates - [x, y, z] position in Cartesian space.
     */
    addAtom(elementName, cartesianCoordinates) {
        const newMaterial = this.applyBasisDelta_((basis) => {
            const wasCartesian = basis.isInCartesianUnits;
            basis.toCartesian();
            basis.addAtom({ element: elementName, coordinate: cartesianCoordinates });
            if (!wasCartesian)
                basis.toCrystal();
        });
        const newIndex = newMaterial.Basis.elements.length - 1;
        this.setStructure(newMaterial);
        this.structureGroup.name = newMaterial.name || newMaterial.formula;
        this.rebuildScene();
        this.reselectAtomByIndex(newIndex);
        if (this.settings.onSelectionChanged) {
            this.settings.onSelectionChanged(newIndex);
        }
        if (this.settings.onStructureModified) {
            this.settings.onStructureModified(newMaterial);
        }
    }
    /**
     * Removes the currently selected atom from the structure.
     */
    removeSelectedAtom() {
        if (!this.selectedMesh_)
            return;
        const targetIndex = this.selectedMesh_.userData.atomicIndex;
        const newMaterial = this.applyBasisDelta_((basis) => {
            var _a, _b, _c;
            const removedId = (_a = basis.elements[targetIndex]) === null || _a === void 0 ? void 0 : _a.id;
            basis.elements = basis.elements.filter((_element, index) => index !== targetIndex);
            basis.coordinates = basis.coordinates.filter((_coordinate, index) => index !== targetIndex);
            if ((_b = basis.labels) === null || _b === void 0 ? void 0 : _b.length) {
                basis.labels = basis.labels.filter((label) => label.id !== removedId);
            }
            if ((_c = basis.constraints) === null || _c === void 0 ? void 0 : _c.length) {
                basis.constraints = basis.constraints.filter((constraint) => constraint.id !== removedId);
            }
        });
        this.clearSelectedAtom();
        if (this.settings.onSelectionChanged) {
            this.settings.onSelectionChanged(null);
        }
        this.setStructure(newMaterial);
        this.structureGroup.name = newMaterial.name || newMaterial.formula;
        this.rebuildScene();
        if (this.settings.onStructureModified) {
            this.settings.onStructureModified(newMaterial);
        }
    }
    /**
     * Commits a single moved atom (from either a direct drag or a gizmo drag) as one delta
     * applied to the current material, then rebuilds the scene around it. rebuildScene()
     * itself preserves the selection/gizmo across the rebuild when in edit mode (see
     * wave.js), so no explicit reselect is needed here for the move case.
     */
    commitMovedAtom_(atomicIndex, cartesianPosition) {
        const newMaterial = this.applyBasisDelta_((basis) => {
            const wasCartesian = basis.isInCartesianUnits;
            basis.toCartesian();
            const { coordinates } = basis;
            if (!coordinates[atomicIndex])
                return;
            coordinates[atomicIndex] = {
                ...coordinates[atomicIndex],
                value: cartesianPosition.toArray(),
            };
            basis.coordinates = coordinates;
            if (!wasCartesian)
                basis.toCrystal();
        });
        this.setStructure(newMaterial);
        this.rebuildScene();
        if (this.settings.onStructureModified) {
            this.settings.onStructureModified(newMaterial);
        }
    }
    /**
     * Lifecycle hook to dispose event listeners and objects on visualizer destruction.
     */
    dispose() {
        if (this.renderer && this.renderer.domElement) {
            if (this.handlePointerDownCapture_) {
                this.renderer.domElement.removeEventListener("pointerdown", this.handlePointerDownCapture_);
            }
            if (this.handlePointerMoveCapture_) {
                this.renderer.domElement.removeEventListener("pointermove", this.handlePointerMoveCapture_);
            }
            if (this.handlePointerUpCapture_) {
                this.renderer.domElement.removeEventListener("pointerup", this.handlePointerUpCapture_);
            }
            if (this.handlePointerCancelCapture_) {
                this.renderer.domElement.removeEventListener("pointercancel", this.handlePointerCancelCapture_);
            }
        }
        if (this.handleEditModeKeyDown_) {
            document.removeEventListener("keydown", this.handleEditModeKeyDown_);
        }
        if (this.transformControls_) {
            this.transformControls_.dispose();
        }
        [this.selectionHighlightMesh_, this.hoverHighlightMesh_].forEach((haloMesh) => {
            if (!haloMesh)
                return;
            this.scene.remove(haloMesh);
            haloMesh.geometry.dispose();
            haloMesh.material.dispose();
        });
        if (super.dispose)
            super.dispose();
    }
};
