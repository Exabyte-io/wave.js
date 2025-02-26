import * as THREE from "three";

import { ATOM_GROUP_NAME, COLORS, MEASUREMENT_GROUP_NAME, MEASUREMENT_MODES } from "../../enums";
import { BaseLabelsMixin } from "../labels/baseLabels";

type ClickHandler = (event: MouseEvent) => void;
type PointerMoveHandler = (event: MouseEvent) => void;

let clickFunction: ClickHandler | null = null;
let pointerMoveFunction: PointerMoveHandler | null = null;

type Constructor<T = {}> = new (...args: any[]) => T;

export const BaseMeasurementMixin = <T extends Constructor>(superclass: T) =>
    class extends BaseLabelsMixin(superclass) {
        selectedAtoms: THREE.Object3D[] = [];

        highlightedAtom: THREE.Object3D | null = null;

        raycaster: THREE.Raycaster = new THREE.Raycaster();

        pointer: THREE.Vector2 = new THREE.Vector2();

        measurementsGroup: THREE.Group = new THREE.Group();

        measurementSettings: any;

        currentMeasurementMode: string = MEASUREMENT_MODES.NONE;

        scene!: THREE.Scene;

        structureGroup!: THREE.Group;

        renderer!: THREE.WebGLRenderer;

        camera!: THREE.Camera;

        settings: any;

        atomClickHandlers: { mode: string; handleClick: any }[] | undefined;

        constructor(config: any) {
            super(config);
            this.initRaycaster();
            this.selectedAtoms = [];
            this.measurementsGroup = new THREE.Group();
            this.measurementsGroup.name = MEASUREMENT_GROUP_NAME;
        }

        initializeMeasurement(measurementMode: string, handleAtomClick: any) {
            if (!this.atomClickHandlers) {
                this.atomClickHandlers = [];
            }
            this.atomClickHandlers.push({
                mode: measurementMode,
                handleClick: handleAtomClick.bind(this),
            });
            this.scene.add(this.measurementsGroup);
            this.structureGroup.add(this.measurementsGroup);
        }

        destroyListeners() {
            const canvas = this.renderer.domElement;
            if (clickFunction) {
                canvas.removeEventListener("click", clickFunction);
            }
            if (pointerMoveFunction) {
                canvas.removeEventListener("mousemove", pointerMoveFunction);
            }
        }

        /**
         * Function to initialize listeners for checking DOM events.
         * @param {Function} updateState - functions for updating data in react.
         * @param settings - measurements settings object, this object helps to define state in this class.
         */
        initListeners(updateState: any, settings: any) {
            this.measurementSettings = settings;

            clickFunction = this.onClick.bind(this, updateState);
            pointerMoveFunction = this.onPointerMove.bind(this);
            const canvas = this.renderer.domElement;
            canvas.addEventListener("click", clickFunction);
            canvas.addEventListener("mousemove", pointerMoveFunction);
        }

        initRaycaster() {
            this.raycaster = new THREE.Raycaster();
            this.raycaster.params.Line.threshold = 0.1;
            this.pointer = new THREE.Vector2();
        }

        getAtomGroups(): THREE.Object3D[] {
            const atomGroups: THREE.Object3D[] = [];
            this.structureGroup.children.forEach((group) => {
                if (group.name === ATOM_GROUP_NAME) {
                    atomGroups.push(...group.children);
                }
            });
            return atomGroups;
        }

        handleSetSelected(intersectItem: THREE.Object3D) {
            intersectItem.userData.selected = true;
            (intersectItem as any).material?.emissive?.setHex(0xff0000);
            this.render();
        }

        checkMouseCoordinates(event: MouseEvent) {
            const canvas = this.renderer.domElement;
            this.pointer.x = (event.offsetX / canvas.width) * 2 - 1;
            this.pointer.y = -(event.offsetY / canvas.height) * 2 + 1;
            this.raycaster.setFromCamera(this.pointer, this.camera);
        }

        setHexForAtom(intersectItem: THREE.Object3D) {
            if (this.highlightedAtom !== intersectItem) {
                if (this.highlightedAtom) {
                    (this.highlightedAtom as any).material?.emissive?.setHex(
                        (this.highlightedAtom as any).currentHex,
                    );
                }
                this.highlightedAtom = intersectItem;
                (this.highlightedAtom as any).currentHex = (
                    this.highlightedAtom as any
                ).material.emissive.getHex();
                (this.highlightedAtom as any).material.emissive.setHex(COLORS.RED);
                this.render();
            }
        }

        setDefaultHexForAtom() {
            if (this.highlightedAtom) {
                (this.highlightedAtom as any).material.emissive.setHex(
                    (this.highlightedAtom as any).currentHex,
                );
            }
        }

        /**
         * Set the current measurement mode, deactivating the previous one
         * @param {string} mode - The measurement mode to activate
         * @returns {boolean} True if the mode was activated, false if it was deactivated
         */
        setMeasurementMode(mode: string): boolean {
            if (this.currentMeasurementMode === mode) {
                this.currentMeasurementMode = MEASUREMENT_MODES.NONE;
                this.resetMeasurements();
                return false;
            }

            this.resetMeasurements();
            this.currentMeasurementMode = mode;

            this._updateMeasurementVisibility();

            return true;
        }

        /**
         * Update the visibility of measurement UI elements based on current mode
         * @private
         */
        _updateMeasurementVisibility() {
            this.measurementsGroup.visible = this.currentMeasurementMode !== MEASUREMENT_MODES.NONE;

            this.render();
        }

        createMeasurementLabel(text: string, name: string, position: THREE.Vector3) {
            const label = this.createLabelSprite(text, name, this.settings.measurementLabelsConfig);
            label.position.copy(position);
            label.visible = true;
            this.measurementsGroup.add(label);
            this.scene.add(this.measurementsGroup);
            this.render();
            return label;
        }

        /**
         * Checks if the given measurement mode is currently active
         * @param mode The measurement mode to check
         * @returns True if the specified mode is active
         */
        isMeasurementModeActive(mode: string): boolean {
            return this.currentMeasurementMode === mode;
        }

        /**
         * Function that handles clicks on atoms, forwarding to the appropriate handler
         * based on the current measurement mode.
         */
        onClick(updateState: any, event: MouseEvent): void {
            this.checkMouseCoordinates(event);
            const intersects = this.raycaster.intersectObjects(this.getAtomGroups(), true);

            if (!intersects.length) return;

            const intersectItem = intersects[0].object;
            if (intersectItem.type === "Mesh") {
                this.atomClickHandlers
                    .filter((handler) => handler.mode === this.currentMeasurementMode)
                    .forEach((handler) => {
                        handler.handleClick(intersectItem, updateState);
                    });
                this.render();
            }
        }

        onPointerMove(event: MouseEvent) {
            this.checkMouseCoordinates(event);
            const intersects = this.raycaster.intersectObjects([...this.getAtomGroups()], true);

            for (const { object: intersectItem } of intersects) {
                if (this.highlightedAtom && this.highlightedAtom !== intersectItem) {
                    this.setDefaultHexForAtom();
                }
                if (!intersectItem.userData?.selected) {
                    if (intersectItem.type === "Mesh") {
                        this.setHexForAtom(intersectItem);
                        break;
                    }
                }
            }

            if (!intersects.length) {
                if (this.highlightedAtom) {
                    this.setDefaultHexForAtom();
                }
            }
            this.render();
        }

        /**
         * Resets all measurements and clears selected atoms
         */
        resetMeasurements(): void {
            if (this.selectedAtoms.length) {
                this.selectedAtoms.forEach((atom) => {
                    if (atom) {
                        atom.userData.selected = false;
                        (atom as any).material.emissive.setHex((atom as any).currentHex);
                    }
                });
                this.selectedAtoms = [];
            }
            while (this.measurementsGroup.children.length) {
                this.measurementsGroup.remove(this.measurementsGroup.children[0]);
            }
            this.render();
        }
    };
