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
        this.raycaster_ = null;
        this.pointer_ = null;
        this.selectedMesh_ = null;
        this.isEditModeEnabled_ = false;
        this.pointerDownPosition_ = null;
        this.handlePointerDownCapture_ = null;
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
            if (this.orbitControls) {
                this.orbitControls.enabled = !event.value;
            }
        });
        // Rerender scene and trigger callbacks when the drag operation completes
        this.transformControls_.addEventListener("mouseUp", () => {
            // Extract modified material first before notifying parent components
            const modifiedMaterial = this.getModifiedMaterial();
            if (this.settings.onStructureModified) {
                this.settings.onStructureModified(modifiedMaterial);
            }
        });
    }
    /**
     * Initializes the pointer vector and Raycaster for selecting atom meshes inside the canvas.
     */
    initializeSelectionRaycaster() {
        this.raycaster_ = new THREE.Raycaster();
        this.pointer_ = new THREE.Vector2();
        // Track pointer positions to distinguish simple selection clicks from camera rotation drags
        this.handlePointerDownCapture_ = (event) => {
            this.pointerDownPosition_ = { x: event.clientX, y: event.clientY };
        };
        this.handlePointerUpCapture_ = (event) => {
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
        this.renderer.domElement.addEventListener("pointerup", this.handlePointerUpCapture_);
    }
    /**
     * Handles user pointer clicks on the canvas to select atom meshes and attach transform handles.
     * Uses Normalized Device Coordinates (NDC) to match pointer position against elements.
     * @param {PointerEvent} event - Native browser pointer event.
     */
    handlePointerDown(event) {
        if (!this.isEditModeEnabled_)
            return;
        // Block new selection raycasts if the user is already interacting with the TransformControls handles
        if (this.transformControls_ && this.transformControls_.dragging)
            return;
        const boundingRectangle = this.renderer.domElement.getBoundingClientRect();
        if (this.pointer_ && this.raycaster_) {
            this.pointer_.x =
                ((event.clientX - boundingRectangle.left) / boundingRectangle.width) * 2 - 1;
            this.pointer_.y =
                -((event.clientY - boundingRectangle.top) / boundingRectangle.height) * 2 + 1;
            this.raycaster_.setFromCamera(this.pointer_, this.camera);
            const atoms = this.collectAllAtoms();
            const intersections = this.raycaster_.intersectObjects(atoms);
            if (intersections.length > 0) {
                const selectedAtomMesh = intersections[0].object;
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
     * Maps basis coordinates (plain arrays or `{value}` wrapper objects) to raw coordinate
     * arrays, as required by `Made.Basis.fromElementsAndCoordinates`.
     */
    // eslint-disable-next-line class-methods-use-this
    getCoordinateArrays(material) {
        return material.basis.coordinates.map((coordinate) => {
            if (Array.isArray(coordinate))
                return coordinate;
            if (coordinate && Array.isArray(coordinate.value))
                return coordinate.value;
            return coordinate;
        });
    }
    /**
     * Maps basis elements (plain strings or `{value}` wrapper objects, as returned by
     * `material.basis.elements`) to plain element symbols. `Made.Basis.fromElementsAndCoordinates`
     * expects plain symbols and re-wraps them itself; passing already-wrapped objects through
     * would double-wrap them instead of round-tripping.
     */
    // eslint-disable-next-line class-methods-use-this
    getElementSymbols(material) {
        return material.basis.elements.map((element) => typeof element === "string" ? element : element.value);
    }
    /**
     * Builds a new Made.Material from the given elements/coordinates, preserving the
     * parent material's name and lattice.
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
        const elements = [...this.getElementSymbols(material), elementName];
        const coordinates = [...this.getCoordinateArrays(material), cartesianCoordinates];
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
        const elements = this.getElementSymbols(material).filter((_, index) => index !== targetIndex);
        const coordinates = this.getCoordinateArrays(material).filter((_, index) => index !== targetIndex);
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
            if (this.handlePointerUpCapture_) {
                this.renderer.domElement.removeEventListener("pointerup", this.handlePointerUpCapture_);
            }
        }
        if (this.transformControls_) {
            this.transformControls_.dispose();
        }
    }
};
