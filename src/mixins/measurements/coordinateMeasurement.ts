import * as THREE from "three";
import { BaseMeasurementMixin } from "./baseMeasurement";
import { COORDINATE_LABELS_GROUP_NAME, MEASUREMENT_MODES } from "../../enums";

type Constructor<T = {}> = new (...args: any[]) => T;

export const CoordinateMeasurementMixin = <T extends Constructor>(superclass: T) =>
    class extends BaseMeasurementMixin(superclass) {
        coordinateMeasurementGroup: THREE.Group;

        coordinatesArray: Array<[number, number, number]>;

        isCoordinateMeasurementActive: boolean;

        constructor(config: any) {
            super(config);
            this.coordinateMeasurementGroup = new THREE.Group();
            this.coordinateMeasurementGroup.name = COORDINATE_LABELS_GROUP_NAME;
            this.coordinatesArray = [];
            this.isCoordinateMeasurementActive = false;
            this.structureGroup.add(this.coordinateMeasurementGroup);
            this.initializeMeasurement(
                MEASUREMENT_MODES.COORDINATE,
                this.handleCoordinateAtomClick,
            );
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
            // Clear existing labels
            this.coordinateMeasurementGroup.clear();

            // Create labels for all selected atoms
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
         * Reset coordinate measurements
         */
        resetCoordinateMeasurements(): void {
            this.coordinateMeasurementGroup.clear();

            // Deselect all atoms
            this.selectedAtoms.forEach((atom) => {
                if (atom) {
                    atom.userData.selected = false;
                    atom.material.emissive.setHex(atom.currentHex);
                }
            });

            this.selectedAtoms = [];
            this.render();
        }

        /**
         * Handle atom click for coordinate measurement
         */
        handleCoordinateAtomClick(
            atom: THREE.Object3D,
            updateState: (coords: string) => void,
        ): void {
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

        /**
         * Selects an atom and creates its coordinate label
         * @param {THREE.Mesh} atom - The atom to select
         */
        selectAtomCoordinate(atom: THREE.Object3D) {
            this.selectedAtoms.add(atom);
            atom.userData.selected = true;

            const position = new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld);
            const { x, y, z } = position;
            atom.userData.coordinateArrayIndex = this.coordinatesArray.length;
            this.coordinatesArray.push([x, y, z]);

            const text = this.createCoordinateText([x, y, z]);
            const label = this.createSingleCoordinateLabel(text, position, "measurement");
            label.visible = true;
            atom.userData.coordinateLabel = label;
            this.coordinateMeasurementGroup.add(label);
        }

        /**
         * Deselects an atom and removes its coordinate label
         * @param {THREE.Mesh} atom - The atom to deselect
         */
        deselectAtomCoordinate(atom) {
            this.selectedAtoms.delete(atom.uuid);
            atom.userData.selected = false;
            atom.material.emissive.setHex(atom.currentHex || 0);

            if (typeof atom.userData.coordinateArrayIndex === "number") {
                this.coordinatesArray.splice(atom.userData.coordinateArrayIndex, 1);
                this.selectedAtoms.forEach((uuid) => {
                    const otherAtom = this.scene.getObjectByProperty("uuid", uuid);
                    if (
                        otherAtom &&
                        otherAtom.userData.coordinateArrayIndex > atom.userData.coordinateArrayIndex
                    ) {
                        otherAtom.userData.coordinateArrayIndex -= 1;
                    }
                });
                delete atom.userData.coordinateArrayIndex;
            }

            if (atom.userData.coordinateLabel) {
                this.coordinateMeasurementGroup.remove(atom.userData.coordinateLabel);
                atom.userData.coordinateLabel = null;
            }
        }

        /**
         * Copies the current array of coordinates to clipboard
         */
        copyCoordinatesToClipboard() {
            if (this.coordinatesArray.length === 0) return;
            const coordsText =
                this.coordinatesArray.length === 1
                    ? JSON.stringify(this.coordinatesArray[0])
                    : JSON.stringify(this.coordinatesArray);

            navigator.clipboard.writeText(coordsText).catch(console.error);
        }

        /**
         * Clears all coordinate measurements and resets atoms
         */
        clearCoordinateMeasurements() {
            this.selectedAtoms.forEach((uuid) => {
                const atom = this.scene.getObjectByProperty("uuid", uuid);
                if (atom) {
                    this.deselectAtomCoordinate(atom);
                }
            });
            this.selectedAtoms.clear();
            this.coordinatesArray = [];

            while (this.coordinateMeasurementGroup.children.length) {
                this.coordinateMeasurementGroup.remove(this.coordinateMeasurementGroup.children[0]);
            }
        }
    };
