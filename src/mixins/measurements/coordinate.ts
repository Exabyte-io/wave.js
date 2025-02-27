import * as THREE from "three";

import { MEASUREMENT_MODES } from "../../enums";
import { BaseMeasurementManager } from "./base";

type Constructor<T = {}> = new (...args: any[]) => T;

export class CoordinatesMeasurementManager extends BaseMeasurementManager {
    currentSelectedCoordinate: THREE.Sprite | null = null;

    constructor(config: any) {
        super(config);
        this.coordinateLabels = new THREE.Group();
        this.scene.add(this.coordinateLabels);

        this.currentSelectedCoordinate = null;
        this.initializeMeasurement(MEASUREMENT_MODES.COORDINATE, this.handleCoordinateAtomClick);
    }

    /**
     * Copies the current array of coordinates to clipboard
     */
    copyCoordinatesToClipboard() {
        const coordinatesArray = this.selectedAtoms.map((atom) => {
            const position = new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld);
            return [position.x, position.y, position.z];
        });

        if (coordinatesArray.length === 0) return;
        const coordsText =
            coordinatesArray.length === 1
                ? JSON.stringify(this.coordinatesArray[0])
                : JSON.stringify(this.coordinatesArray);

        navigator.clipboard.writeText(coordsText).catch(console.error);
    }

    /**
     * Toggle selection of atom for coordinate display
     */
    toggleAtomSelection(atom: THREE.Object3D): void {
        // If atom is already selected, deselect it
        const index = this.selectedAtoms.findIndex((selected) => selected === atom);

        if (index >= 0) {
            // Deselect atom
            atom.userData.selected = false;
            atom.material.emissive.setHex(atom.currentHex);
            this.selectedAtoms.splice(index, 1);

            // Remove the coordinate label for this atom
            this.updateCoordinateLabels();
        } else {
            // Select atom
            this.selectedAtoms.push(atom);
            this.handleSetSelected(atom);

            // Add coordinate label for this atom
            this.updateCoordinateLabels();
        }

        this.render();
    }

    /**
     * Update coordinate labels for all selected atoms
     */
    updateCoordinateLabels(): void {
        this.selectedAtoms.forEach((atom) => {
            if (!atom) return;

            const position = new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld);
            const coordText = `(${position.x.toFixed(2)}, ${position.y.toFixed(
                2,
            )}, ${position.z.toFixed(2)})`;

            const label = this.createMeasurementLabel(
                coordText,
                `coord-label-${atom.uuid}`,
                position,
            );

            // Offset the label a bit above the atom
            label.position.y += 0.5;

            this.coordinateMeasurementGroup.add(label);
        });

        // Add the group to the scene if not already added
        if (!this.scene.children.includes(this.coordinateMeasurementGroup)) {
            this.scene.add(this.coordinateMeasurementGroup);
        }
    }

    /**
     * Handle atom click for coordinate measurement
     */
    handleCoordinateAtomClick(atom: THREE.Object3D, updateState: (coords: string) => void): void {
        if (!this.isMeasurementModeActive(MEASUREMENT_MODES.COORDINATE)) return;

        this.toggleAtomSelection(atom);

        if (this.selectedAtoms.length > 0) {
            // Update state with coordinates of the last selected atom
            const position = new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld);
            const coordText = `(${position.x.toFixed(2)}, ${position.y.toFixed(
                2,
            )}, ${position.z.toFixed(2)})`;
            updateState(coordText);
        }
        this.copyCoordinatesToClipboard();
    }
}
