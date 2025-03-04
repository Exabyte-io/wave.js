import * as THREE from "three";

import { ATOM_GROUP_NAME, COLORS, MEASUREMENT_MODES_ENUM } from "../../enums";
import { BaseTHREEGroupManager } from "../base";
import { BaseLabelsManager, LabelsManagerConstructor } from "../labels/base";
import { RaycasterMixinWithListeners } from "../listeners/mixins";
import { getObjectCoordinateAsArray } from "../threeJsUtils";

const BaseManager = RaycasterMixinWithListeners(BaseTHREEGroupManager);

/**
 * Base class for managing measurements.
 * Contains generic logic for handling measurements: toggling measurement, selecting atoms, creating labels.
 */
export class BaseMeasurementManager<T extends BaseLabelsManager> extends BaseManager {
    measurementType: MEASUREMENT_MODES_ENUM = MEASUREMENT_MODES_ENUM.NONE;

    selectedAtoms: THREE.Object3D[] = [];

    isActive = false;

    values!: any[];

    LabelsManagerCls!: LabelsManagerConstructor<T>;

    labelsManager: any;

    updateState: any;

    constructor(
        waveStructureGroup: THREE.Group,
        waveCamera: THREE.Camera,
        wave: any,
        groupName: string,
        updateState: any,
    ) {
        super(waveStructureGroup, waveCamera, wave, groupName + "-measurement-group");
        this.initRaycaster();
        this.selectedAtoms = [];
        this.intersectedAtom = null;
        this.canvas = wave.renderer.domElement;
        this.updateState = updateState;
    }

    getLabelsManagerInstance() {
        return new this.LabelsManagerCls(this.waveStructureGroup, this.waveCamera, this.wave);
    }

    toggleActive = () => {
        this.toggleVisibility();
        this.isActive = !this.isActive;
        if (!this.isActive) {
            this.resetMeasurements();
            this.destroyListeners();
            this.wave.setCursorStyle();
        } else {
            this.wave.setCursorStyle("pointer");
            this.initListeners(this.updateState);
        }
    };

    setColorForAtom(atomObject: THREE.Mesh, color?: number) {
        const newColor = color || atomObject.previousColor || COLORS.WHITE;
        atomObject.previousColor = atomObject.material.color;
        atomObject.material?.emissive?.setHex(newColor);
    }

    getSelectedAtomIndices() {
        // TODO: refactor to use atom names getter from createAtomGroups
        return this.selectedAtoms.map((atom) => atom.userData.atomicIndex);
    }

    highlightAtom(atomObject: THREE.Object3D) {
        this.setColorForAtom(atomObject, COLORS.RED);
    }

    setAtomAsSelected(atomObject: THREE.Object3D) {
        atomObject.userData.selected = true;
        const selectedAtomIndices = this.getSelectedAtomIndices();
        if (!selectedAtomIndices.includes(atomObject.userData.atomicIndex)) {
            this.selectedAtoms.push(atomObject);
        }
    }

    unsetAtomAsSelected(atomObject: THREE.Object3D) {
        atomObject.userData.selected = false;
        this.setColorForAtom(atomObject);
        this.selectedAtoms = this.selectedAtoms.filter(
            (atom) => atom.userData.atomicIndex !== atomObject.userData.atomicIndex,
        );
    }

    setAtomAsHovered(atomObject: THREE.Object3D) {
        atomObject.userData.hovered = true;
        this.setColorForAtom(atomObject, COLORS.ORANGE);
    }

    unsetAtomAsHovered(atomObject: THREE.Object3D) {
        atomObject.userData.hovered = false;
        this.setColorForAtom(atomObject);
    }

    setIntersectedAtom(intersectItem: THREE.Object3D | null) {
        if (this.intersectedAtom !== intersectItem) {
            this.intersectedAtom = intersectItem;
        }
    }

    isIntersectionObjectAnAtom(intersection: THREE.Intersection) {
        return intersection.object.type === "Mesh";
    }

    getIntersections() {
        return this.raycaster.intersectObjects([...this.wave.getAtomGroups()], true);
    }

    toggleAtomSelection(atomObject: THREE.Object3D) {
        if (this.getSelectedAtomIndices().includes(atomObject.userData.atomicIndex)) {
            this.unsetAtomAsSelected(atomObject);
        } else {
            this.setAtomAsSelected(atomObject);
        }
    }

    refillSelectedAtoms() {
        const selectedAtomIndices = this.getSelectedAtomIndices();
        const newSelectedAtoms = this.wave
            .getAtomGroups()
            .filter((atom) => selectedAtomIndices.includes(atom.userData.atomicIndex));
        newSelectedAtoms.forEach((atom, index) => {
            atom.userData = this.selectedAtoms[index].userData;
        });
        this.selectedAtoms = newSelectedAtoms;
    }

    getSettings() {
        return {
            isActive: this.isActive,
            measurementType: this.measurementType,
            values: this.values,
        };
    }

    onClick(event: MouseEvent) {
        if (!this.isActive) return;
        this.checkMouseCoordinates(event, this.waveCamera);
        const intersects = this.getIntersections();

        intersects.forEach((object: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>) => {
            if (this.isIntersectionObjectAnAtom(object)) {
                const atom = object.object;
                this.toggleAtomSelection(atom);
            }
        });

        this.copyValuesToClipboard();
    }

    onPointerMove = (event: MouseEvent) => {
        // TODO: remove or implement
        return;
        if (!this.isActive) return;
        this.checkMouseCoordinates(event, this.waveCamera);
        const intersects = this.getIntersections();

        for (const object of intersects) {
            if (this.isIntersectionObjectAnAtom(object)) {
                this.setIntersectedAtom(object.object);
                this.setAtomAsHovered(object.object);
                break;
            }
        }

        if (!intersects.length && this.intersectedAtom) {
            this.unsetAtomAsHovered(this.intersectedAtom);
            this.setIntersectedAtom(null);
        }
    };

    copyValuesToClipboard() {
        const values = this.extractMeasurementValues();
        let valuesText = "";
        if (values.length > 1) {
            valuesText = JSON.stringify(values);
        } else if (values.length === 1) {
            valuesText = JSON.stringify(values[0]);
        }
        navigator.clipboard.writeText(valuesText).catch(console.error);
    }

    extractMeasurementValues() {
        const values = this.selectedAtoms.map((atom) => getObjectCoordinateAsArray(atom));
        this.values = values;
        return values;
    }

    createMeasurementLabel(
        text: string,
        name: string,
        position: THREE.Vector3,
        threeGroup = this.THREEGroup,
    ) {
        const managerInstance = new this.LabelsManagerCls(
            this.waveStructureGroup,
            this.waveCamera,
            this.wave,
        );
        const label = managerInstance.createLabelSprite(text, name);
        label.position.copy(position);
        threeGroup.add(label);
        this.waveStructureGroup.add(threeGroup);
    }

    resetMeasurements(): void {
        // TODO: remove or implement
    }

    getLabelObjectsFromSelectedAtoms() {
        return this.selectedAtoms;
    }

    getAdditionalObjectsFromSelectedAtoms() {
        return [];
    }

    createMeasurements() {
        if (!this.selectedAtoms.length || !this.isActive) return;
        this.refillSelectedAtoms();
        this.labelsManager.createLabels(this.getLabelObjectsFromSelectedAtoms(), this.THREEGroup);
        this.getAdditionalObjectsFromSelectedAtoms().forEach((object) => {
            this.THREEGroup.add(object);
        });
        this.highlightSelectedAtoms();
    }

    highlightSelectedAtoms() {
        this.selectedAtoms.forEach((atom) => {
            this.highlightAtom(atom);
        });
    }
}
