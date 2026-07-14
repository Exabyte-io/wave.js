import { Made } from "@mat3ra/made";
import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
// eslint-disable-next-line import/no-cycle
import { ThreeDSceneDataToMaterial } from "../utils";
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
        this.isEditModeEnabled_ = false;
        this.pointerDownPosition_ = null;
        this.pendingDragAtom_ = null;
        this.isDraggingAtom_ = false;
        this.dragPlane_ = null;
        this.dragOffset_ = null;
        this.handlePointerDownCapture_ = null;
        this.handlePointerMoveCapture_ = null;
        this.handlePointerUpCapture_ = null;
        this.initializeEditor = this.initializeEditor.bind(this);
        this.initializeSelectionRaycaster = this.initializeSelectionRaycaster.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.setTransformMode = this.setTransformMode.bind(this);
        this.addAtom = this.addAtom.bind(this);
        this.removeSelectedAtom = this.removeSelectedAtom.bind(this);
        this.getModifiedMaterial = this.getModifiedMaterial.bind(this);
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
        // Rerender the viewport on every translation/rotation frame update
        this.transformControls_.addEventListener("change", () => {
            this.render();
        });
        // Disables the OrbitControls while dragging an atom to avoid camera movement conflicts
        this.transformControls_.addEventListener("dragging-changed", (event) => {
            var _a, _b, _c;
            if (this.orbitControls) {
                this.orbitControls.enabled = !event.value;
            }
            // Snapshot the object's position when a drag starts so mouseUp can tell whether
            // the gizmo actually moved anything (a zero-movement click-release must not commit).
            if (event.value) {
                this.transformDragStartPosition_ =
                    (_c = (_b = (_a = this.transformControls_) === null || _a === void 0 ? void 0 : _a.object) === null || _b === void 0 ? void 0 : _b.position.clone()) !== null && _c !== void 0 ? _c : null;
            }
            else {
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
                draggedObject.position.distanceTo(startPosition) > 1e-6;
            if (!hasMoved) {
                return;
            }
            // Extract modified material first before notifying parent components
            const modifiedMaterial = this.getModifiedMaterial();
            if (this.settings.onStructureModified) {
                this.settings.onStructureModified(modifiedMaterial);
            }
        });
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
            this.pointerDownPosition_ = { x: event.clientX, y: event.clientY };
            this.pendingDragAtom_ = null;
            this.isDraggingAtom_ = false;
            if (!this.isEditModeEnabled_)
                return;
            // Let TransformControls handle its own gizmo-handle drags exclusively
            if (this.transformControls_ && this.transformControls_.dragging)
                return;
            this.pendingDragAtom_ = this.getAtomAtPointer(event);
        };
        this.handlePointerMoveCapture_ = (event) => {
            if (!this.pendingDragAtom_)
                return;
            if (!this.isDraggingAtom_) {
                if (!this.pointerDownPosition_)
                    return;
                const distance = Math.sqrt((event.clientX - this.pointerDownPosition_.x) ** 2 +
                    (event.clientY - this.pointerDownPosition_.y) ** 2);
                // Only commit to a drag once the pointer has moved a few pixels, so a plain
                // click still falls through to handlePointerUpCapture_'s select-only path.
                if (distance < 5)
                    return;
                this.beginAtomDrag_(event);
            }
            if (!this.dragPlane_ || !this.dragOffset_)
                return;
            const point = this.getPointerPlaneIntersection(event, this.dragPlane_);
            if (!point)
                return;
            this.pendingDragAtom_.position.copy(point.add(this.dragOffset_));
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
            // Perform raycasting selection only if pointer movement is negligible (less than 5px)
            if (distance < 5) {
                this.handlePointerDown(event);
            }
            this.pointerDownPosition_ = null;
        };
        this.renderer.domElement.addEventListener("pointerdown", this.handlePointerDownCapture_);
        this.renderer.domElement.addEventListener("pointermove", this.handlePointerMoveCapture_);
        this.renderer.domElement.addEventListener("pointerup", this.handlePointerUpCapture_);
    }
    /**
     * Selects the pending atom and sets up the camera-facing drag plane through its current
     * position, offset so the atom doesn't jump to snap its center to the cursor.
     */
    beginAtomDrag_(event) {
        if (!this.pendingDragAtom_)
            return;
        this.isDraggingAtom_ = true;
        this.setSelectedAtomMesh(this.pendingDragAtom_);
        if (this.settings.onSelectionChanged) {
            this.settings.onSelectionChanged(this.pendingDragAtom_.userData.atomicIndex);
        }
        if (this.orbitControls)
            this.orbitControls.enabled = false;
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        this.dragPlane_ = new THREE.Plane().setFromNormalAndCoplanarPoint(cameraDirection, this.pendingDragAtom_.position);
        const startPoint = this.getPointerPlaneIntersection(event, this.dragPlane_);
        this.dragOffset_ = startPoint
            ? this.pendingDragAtom_.position.clone().sub(startPoint)
            : new THREE.Vector3();
    }
    /**
     * Finalizes a direct atom drag: restores camera orbiting and reports the modified
     * material, mirroring what the gizmo's own "mouseUp" handler does after a gizmo drag.
     */
    endAtomDrag_() {
        this.isDraggingAtom_ = false;
        this.pendingDragAtom_ = null;
        this.pointerDownPosition_ = null;
        if (this.orbitControls)
            this.orbitControls.enabled = true;
        const modifiedMaterial = this.getModifiedMaterial();
        if (this.settings.onStructureModified) {
            this.settings.onStructureModified(modifiedMaterial);
        }
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
     * Clears any previous selection's highlight first.
     */
    setSelectedAtomMesh(atomMesh) {
        if (this.selectedMesh_ && this.selectedMesh_ !== atomMesh) {
            const previousMaterial = this.selectedMesh_.material;
            if (previousMaterial.emissive)
                previousMaterial.emissive.setHex(0x000000);
        }
        this.selectedMesh_ = atomMesh;
        const material = atomMesh.material;
        if (material.emissive)
            material.emissive.setHex(0x333333);
        if (this.transformControls_)
            this.transformControls_.attach(atomMesh);
    }
    /**
     * Clears the current atom selection, removes its highlight, and detaches the gizmo.
     */
    clearSelectedAtom() {
        if (this.selectedMesh_) {
            const material = this.selectedMesh_.material;
            if (material.emissive)
                material.emissive.setHex(0x000000);
            this.selectedMesh_ = null;
        }
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
     * Enables or disables edit mode interactions and controls visibility.
     * @param {boolean} enabled - True to enable, false to disable.
     */
    enableEditMode(enabled) {
        this.isEditModeEnabled_ = enabled;
        if (!enabled && this.transformControls_) {
            this.clearSelectedAtom();
            if (this.settings.onSelectionChanged) {
                this.settings.onSelectionChanged(null);
            }
            this.render();
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
     * Returns the material's elements and coordinates as plain [x,y,z] arrays, converted to
     * Cartesian units first. getModifiedMaterial() normalizes its basis to crystal (fractional)
     * units, so this conversion must happen before combining those coordinates with any new
     * Cartesian point (e.g. a freshly added atom) - mixing crystal and Cartesian values in one
     * array and labeling the whole thing "cartesian" silently corrupts every existing atom's
     * position (crystal fractions like 0.25 get reinterpreted as 0.25 Angstrom).
     */
    // eslint-disable-next-line class-methods-use-this
    getCartesianElementsAndCoordinates(material) {
        const basis = material.Basis;
        basis.toCartesian();
        return {
            elements: basis.elements.map((element) => typeof element === "string" ? element : element.value),
            coordinates: basis.coordinatesAsArray,
        };
    }
    /**
     * Builds a new Made.Material from the given Cartesian-unit elements/coordinates,
     * preserving the parent material's name and lattice.
     */
    // eslint-disable-next-line class-methods-use-this
    buildMaterialFromBasis(material, elements, coordinates) {
        const newBasis = Made.Basis.fromElementsAndCoordinates({
            elements,
            coordinates,
            units: "cartesian",
            cell: material.Lattice,
        });
        return new Made.Material({
            name: material.name,
            lattice: material.Lattice.toJSON(),
            basis: newBasis.toJSON(),
        });
    }
    /**
     * Adds an atom to the structure group and triggers scene reconstruction.
     * @param {string} elementName - Chemical element symbol (e.g. "Si").
     * @param {Array<number>} cartesianCoordinates - [x, y, z] position in Cartesian space.
     */
    addAtom(elementName, cartesianCoordinates) {
        const material = this.getModifiedMaterial();
        const { elements: existingElements, coordinates: existingCoordinates } = this.getCartesianElementsAndCoordinates(material);
        const elements = [...existingElements, elementName];
        const coordinates = [...existingCoordinates, cartesianCoordinates];
        const newMaterial = this.buildMaterialFromBasis(material, elements, coordinates);
        this.setStructure(newMaterial);
        this.structureGroup.name = newMaterial.name || newMaterial.formula;
        this.rebuildScene();
        if (this.settings.onStructureModified) {
            this.settings.onStructureModified(newMaterial);
        }
    }
    /**
     * Removes the currently selected atom mesh from the structure group.
     */
    removeSelectedAtom() {
        if (!this.selectedMesh_)
            return;
        const targetIndex = this.selectedMesh_.userData.atomicIndex;
        const material = this.getModifiedMaterial();
        const { elements: allElements, coordinates: allCoordinates } = this.getCartesianElementsAndCoordinates(material);
        const elements = allElements.filter((_, index) => index !== targetIndex);
        const coordinates = allCoordinates.filter((_, index) => index !== targetIndex);
        const newMaterial = this.buildMaterialFromBasis(material, elements, coordinates);
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
     * Converts the current Three.js scene data back into a Made.Material object.
     * Temporarily detaches TransformControls to prevent helper meshes from polluting the basis extraction.
     * @returns {Made.Material} The modified material structure.
     */
    getModifiedMaterial() {
        if (this.transformControls_) {
            this.scene.remove(this.transformControls_);
        }
        const modifiedMaterial = ThreeDSceneDataToMaterial(this.scene);
        if (this.transformControls_) {
            this.scene.add(this.transformControls_);
        }
        return modifiedMaterial;
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
        }
        if (this.transformControls_) {
            this.transformControls_.dispose();
        }
    }
};
