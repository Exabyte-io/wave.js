import * as THREE from "three";
import { MEASUREMENT_MODES } from "../../enums";
import { BaseMeasurementMixin } from "./baseMeasurement";
export const CoordinateMeasurementMixin = (superclass) => class extends BaseMeasurementMixin(superclass) {
    constructor(config) {
        super(config);
        this.currentSelectedCoordinate = null;
        this.coordinateLabels = new THREE.Group();
        this.scene.add(this.coordinateLabels);
        this.measurementsGroup.add(this.coordinateLabels);
        this.currentSelectedCoordinate = null;
        this.initializeMeasurement(MEASUREMENT_MODES.COORDINATE, this.handleCoordinateAtomClick);
    }
    /**
     * Copies the current array of coordinates to clipboard
     */
    copyCoordinatesToClipboard() {
        const coordinatesArray = this.selectedAtoms.map((atom) => {
            const position = new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld);
            return this.coordinatesToPrecision(position);
        });
        if (coordinatesArray.length === 0)
            return;
        const coordsText = coordinatesArray.length === 1
            ? JSON.stringify(coordinatesArray[0])
            : JSON.stringify(coordinatesArray);
        navigator.clipboard.writeText(coordsText).catch(console.error);
    }
    /**
     * Toggle selection of atom for coordinate display
     */
    toggleAtomSelection(atom) {
        // If atom is already selected, deselect it
        const index = this.selectedAtoms.findIndex((selected) => selected === atom);
        if (index >= 0) {
            // Deselect atom
            atom.userData.selected = false;
            // @ts-ignore
            atom.material.emissive.setHex(atom.currentHex);
            this.selectedAtoms.splice(index, 1);
        }
        else {
            this.selectedAtoms.push(atom);
            this.handleSetSelected(atom);
        }
        this.render();
    }
    /**
     * Handle atom click for coordinate measurement
     */
    handleCoordinateAtomClick(atom, updateState) {
        if (!this.isMeasurementModeActive(MEASUREMENT_MODES.COORDINATE))
            return;
        this.toggleAtomSelection(atom);
        if (this.selectedAtoms.length > 0) {
            const position = new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld);
            const coordinates = this.coordinatesToPrecision(position);
            updateState({ coordinates });
        }
        this.copyCoordinatesToClipboard();
    }
    coordinatesToPrecision(position) {
        const { roundPrecision } = this.settings;
        return [
            parseFloat(position.x.toFixed(roundPrecision)),
            parseFloat(position.y.toFixed(roundPrecision)),
            parseFloat(position.z.toFixed(roundPrecision)),
        ];
    }
};
