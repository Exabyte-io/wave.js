import * as THREE from "three";

import { ATOM_GROUP_NAME, COLORS, MEASUREMENT_MODES } from "../../enums";
import {
    BaseDOMListenerManagerWithThreeGroup,
    BaseDOMListenreeManagerWtihThreeGroupAndRaycaster,
} from "../base_listener";

export class BaseMeasurementManager extends BaseDOMListenreeManagerWtihThreeGroupAndRaycaster {
    selectedAtoms: THREE.Object3D[] = [];

    highlightedAtom: THREE.Object3D | null = null;

    raycaster: THREE.Raycaster = new THREE.Raycaster();

    pointer: THREE.Vector2 = new THREE.Vector2();

    // isActive: boolean;

    handleAtomClick() {
        // Placeholder for atom click handler
    }

    constructor(waveStructureGroup) {
        super(waveStructureGroup);
        this.initRaycaster();
        this.selectedAtoms = [];
    }

    initializeMeasurement(measurementMode: string, handleAtomClick: any) {
        if (!this.atomClickHandlers) {
            this.atomClickHandlers = [];
        }
        this.atomClickHandlers.push({
            mode: measurementMode,

            handleClick: handleAtomClick.bind(this),
        });
        // TODO: add to structure group instead
        this.waveStructureGroup.add(this.THREEGroup);
    }

    setAtomAsSelected(atomObject: THREE.Object3D) {
        atomObject.userData.selected = true;
        (atomObject as any).material?.emissive?.setHex(0xff0000);
    }

    setAtomAsUnselected(atomObject: THREE.Object3D) {
        atomObject.userData.selected = false;
        (atomObject as any).material?.emissive?.setHex((atomObject as any).currentHex);
    }

    // TODO: Remove
    setHexForAtom(intersectItem: THREE.Object3D) {
        if (this.highlightedAtom !== intersectItem) {
            this.setDefaultHexForAtom();
            this.highlightedAtom = intersectItem;
            (this.highlightedAtom as any).currentHex = (
                this.highlightedAtom as any
            ).material.emissive.getHex();
            (this.highlightedAtom as any).material.emissive.setHex(COLORS.RED);
        }
    }

    // TODO: Remove
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
    // TODO: Remove this and handle at the `allMeasurements` level by selecting one Manager that is Active
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
    // TODO: use isVisible
    _updateMeasurementVisibility() {
        this.THREEGroup.visible = this.currentMeasurementMode !== MEASUREMENT_MODES.NONE;

        this.render();
    }

    createMeasurementLabel(text: string, name: string, position: THREE.Vector3) {
        const label = this.createLabelSprite(text, name, this.config.measurementLabelsConfig);
        label.position.copy(position);
        label.visible = true;
        this.THREEGroup.add(label);
        // TODO: add to structure group instead
        this.waveStructureGroup.add(this.THREEGroup);
        // Remove
        this.render();
        return label;
    }

    /**
     * Checks if the given measurement mode is currently active
     * @param mode The measurement mode to check
     * @returns True if the specified mode is active
     */
    isActive(mode: string): boolean {
        return this.currentMeasurementMode === mode;
    }

    /**
     * Function that handles clicks on atoms, forwarding to the appropriate handler
     * based on the current measurement mode.
     */

    // TODO: define this in child classes for `angles`, `coordinates`, etc.
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

    // TODO: define this in child classes for `angles`, `coordinates`, etc.
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
        while (this.THREEGroup.children.length) {
            this.THREEGroup.remove(this.THREEGroup.children[0]);
        }
        // TODO: remove to wave.js level
        this.render();
    }
}
