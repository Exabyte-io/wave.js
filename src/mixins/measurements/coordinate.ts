import * as THREE from "three";

import { MEASUREMENT_MODES } from "../../enums";
import { BaseMeasurementManager } from "./base";

export class CoordinatesMeasurementManager extends BaseMeasurementManager {
    currentSelectedCoordinate: THREE.Sprite | null = null;

    updateState: (coords: string) => void;

    coordinatesArray: number[][] = [];

    constructor(config: any) {
        super(config);
        this.updateState = config.updateState;
        this.measurementType = MEASUREMENT_MODES.COORDINATE;

        this.currentSelectedCoordinate = null;
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

            label.position.y += 0.5;

            this.THREEGroup.add(label);
        });

        if (!this.waveStructureGroup.children.includes(this.THREEGroup)) {
            this.waveStructureGroup.add(this.THREEGroup);
        }
    }

    /**
     * Handle atom click for coordinate measurement
     */
    handleAtomClick(atom: THREE.Object3D): void {
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
            this.setAtomAsSelected(atom);

            // Add coordinate label for this atom
            this.updateCoordinateLabels();
        }

        if (this.selectedAtoms.length > 0) {
            // Update state with coordinates of the last selected atom
            const position = new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld);
            const coordText = `(${position.x.toFixed(2)}, ${position.y.toFixed(
                2,
            )}, ${position.z.toFixed(2)})`;
            this.updateState(coordText);
        }
        this.copyCoordinatesToClipboard();
        this.toggleAtomSelection(atom);
    }
}
