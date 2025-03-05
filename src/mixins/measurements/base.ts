import * as THREE from "three";

import { ATOM_GROUP_NAME, COLORS, MEASUREMENT_MODES_ENUM } from "../../enums";
import { AtomColorManager } from "../atoms/AtomColorManager";
import { BaseTHREEGroupManager } from "../base";
import { BaseLabelsManager, LabelsManagerConstructor } from "../labels/base";
import { RaycasterMixinWithListeners } from "../listeners/mixins";
import { getObjectCoordinateAsArray } from "../threeJsUtils";
import { AtomObject } from "../types/atoms";

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

    protected getLabelsManagerInstance() {
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

    setColorForAtom(atomObject: THREE.Object3D, color?: number) {
        AtomColorManager.setColorForAtom(atomObject, color);
    }

    getSelectedAtomIndices() {
        // TODO: refactor to use atom names getter from createAtomGroups
        return this.selectedAtoms.map((atom) => atom.userData.atomicIndex);
    }

    getAtomObjectByAtomicIndex(atomicIndex: number) {
        return this.wave
            .getAtomGroups()
            .find((atom: THREE.Object3D) => atom.userData.atomicIndex === atomicIndex);
    }

    highlightAtom(atomObject: THREE.Object3D) {
        AtomColorManager.highlightAtom(atomObject);
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
        AtomColorManager.setAtomAsHovered(atomObject);
    }

    unsetAtomAsHovered(atomObject: THREE.Object3D) {
        AtomColorManager.unsetAtomAsHovered(atomObject);
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

    refillSelectedAtoms(): void {
        const validAtoms: THREE.Object3D[] = [];

        this.selectedAtoms.forEach((atom) => {
            const { atomicIndex } = atom.userData;
            const validAtom = this.getAtomObjectByAtomicIndex(atomicIndex);
            if (validAtom) {
                validAtoms.push(validAtom);
            }
        });

        this.selectedAtoms = validAtoms;
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
        if (!this.isActive) return;
        this.checkMouseCoordinates(event, this.waveCamera);
        const intersects = this.getIntersections();

        intersects.forEach((object: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>) => {
            if (this.isIntersectionObjectAnAtom(object)) {
                this.setIntersectedAtom(object.object);
                this.setAtomAsHovered(object.object);
            }
        });

        if (!intersects.length && this.intersectedAtom) {
            if (this.intersectedAtom) {
                this.unsetAtomAsHovered(this.intersectedAtom);
            }
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
        // To be implemented by derived classes
    }

    getLabelObjectsFromSelectedObjects(): THREE.Object3D[] {
        return this.selectedAtoms;
    }

    getAdditionalObjectsFromSelectedAtoms(): THREE.Object3D[] {
        return [];
    }

    createMeasurements() {
        if (!this.selectedAtoms.length || !this.isActive) return;
        this.refillSelectedAtoms();
        this.labelsManager.createLabels(this.getLabelObjectsFromSelectedObjects(), this.THREEGroup);
        this.getAdditionalObjectsFromSelectedAtoms().forEach((object) => {
            this.THREEGroup.add(object);
        });
        console.log("this.THREEGroup", this.THREEGroup);
        this.highlightSelectedAtoms();
    }

    highlightSelectedAtoms() {
        this.selectedAtoms.forEach((atom) => {
            this.highlightAtom(atom);
        });
    }
}
