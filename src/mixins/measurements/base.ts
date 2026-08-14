import * as THREE from "three";

import { MEASUREMENT_MODES_ENUM } from "../../enums";
import { BaseTHREEGroupManager } from "../base";
import { BaseLabelsManager, LabelsManagerConstructor } from "../labels/base";
import { LinesManager } from "../lines/LinesManager";
import { RaycasterMixinWithListeners } from "../listeners/mixins";
import {
    getObjectCoordinateAsArray,
    highlightAtom,
    isIntersectionObjectAnAtom,
    isObjectAnAtom,
    setAtomAsHovered,
    setColorForAtom,
    unsetAtomAsHovered,
} from "../utils_three";

const BaseManager = RaycasterMixinWithListeners(BaseTHREEGroupManager);

/**
 * Base class for managing measurements.
 * Contains generic logic for handling measurements: toggling measurement, selecting atoms, creating labels.
 */
export class BaseMeasurementManager<T extends BaseLabelsManager> extends BaseManager {
    measurementType: MEASUREMENT_MODES_ENUM = MEASUREMENT_MODES_ENUM.NONE;

    selectedAtoms: THREE.Object3D[] = [];

    isActive = false;

    /**
     * How many atom picks one measurement of this type consumes: a distance needs a pair, an
     * angle a triplet, a coordinate copy just the one. Reported through getSettings() so the UI
     * can say how many picks are still outstanding without hardcoding the arity a second time -
     * the managers group their own selections by this number (getPairsOfSelectedAtoms,
     * getTripletsOfSelectedAtoms), so this is the same fact, not a copy of it.
     */
    atomsPerMeasurement = 1;

    values!: any[];

    LabelsManagerCls!: LabelsManagerConstructor<T>;

    labelsManager: any;

    linesManager: LinesManager;

    updateState: any;

    currentSelectedLine: THREE.Line | null = null;

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
        this.intersectedObject = null;
        this.canvas = wave.renderer.domElement;
        this.linesManager = new LinesManager(waveStructureGroup, waveCamera, wave, groupName);
        this.updateState = updateState;
    }

    protected getLabelsManagerInstance() {
        return new this.LabelsManagerCls(this.waveStructureGroup, this.waveCamera, this.wave);
    }

    toggleActive = () => {
        this.isActive = !this.isActive;
        if (this.isActive) {
            this.wave.setCursorStyle("pointer");
            this.initListeners(this.updateState);
        } else {
            this.destroyListeners();
            this.wave.setCursorStyle();
        }
        this.toggleVisibility();
    };

    getSelectedAtomIndices() {
        // TODO: refactor to use atom names getter from createAtomGroups
        return this.selectedAtoms.map((atom) => atom.userData.atomicIndex);
    }

    getAtomObjectByAtomicIndex(atomicIndex: number) {
        return this.wave
            .getAtomGroups()
            .find((atom: THREE.Object3D) => atom.userData.atomicIndex === atomicIndex);
    }

    setAtomAsSelected(atomObject: THREE.Object3D) {
        atomObject.userData.selected = true;
        const selectedAtomIndices = this.getSelectedAtomIndices();
        if (!selectedAtomIndices.includes(atomObject.userData.atomicIndex)) {
            this.selectedAtoms.push(atomObject);
        }
        highlightAtom(atomObject);
    }

    unsetAtomAsSelected(atomObject: THREE.Object3D) {
        atomObject.userData.selected = false;
        setColorForAtom(atomObject);
        this.selectedAtoms = this.selectedAtoms.filter(
            (atom) => atom.userData.atomicIndex !== atomObject.userData.atomicIndex,
        );
    }

    setIntersectedAtom(intersectItem: THREE.Object3D | null) {
        if (intersectItem === null) {
            this.intersectedObject = null;
            return;
        }
        if (this.intersectedObject !== intersectItem && isObjectAnAtom(intersectItem)) {
            this.intersectedObject = intersectItem;
        }
    }

    isIntersectedAtomSelected() {
        if (!this.intersectedObject) return false;
        return this.selectedAtoms.some(
            (atom) => atom.userData.atomicIndex === this.intersectedObject?.userData.atomicIndex,
        );
    }

    getIntersections() {
        return this.raycaster.intersectObjects(
            [...this.wave.getAtomGroups(), ...this.linesManager.getLines()],
            true,
        );
    }

    toggleAtomSelection(atomObject: THREE.Object3D) {
        if (this.getSelectedAtomIndices().includes(atomObject.userData.atomicIndex)) {
            this.unsetAtomAsSelected(atomObject);
        } else {
            this.setAtomAsSelected(atomObject);
        }
    }

    toggleLineSelection(line: THREE.Line) {
        if (line.userData.selected) {
            this.handleLineDeselection(line);
        } else {
            this.handleLineSelection(line);
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
            // Picks made so far, so a partially-specified measurement ("1 of 2 picked") is
            // visible instead of leaving the user guessing why nothing has been measured yet.
            selectedAtomsCount: this.selectedAtoms.length,
            atomsPerMeasurement: this.atomsPerMeasurement,
        };
    }

    onClick(event: MouseEvent) {
        if (!this.isActive) return;
        this.checkMouseCoordinates(event, this.waveCamera);
        const intersects = this.getIntersections();
        intersects.forEach((object: THREE.Intersection<THREE.Object3D | THREE.Line>) => {
            if (isIntersectionObjectAnAtom(object)) {
                const atom = object.object;
                this.toggleAtomSelection(atom);
            }
            if (object.object.type === "Line") {
                const line = object.object as THREE.Line;
                this.toggleLineSelection(line);
            }
        });
        this.copyValuesToClipboard();
    }

    onPointerMove = (event: MouseEvent) => {
        if (!this.isActive) return;
        this.checkMouseCoordinates(event, this.waveCamera);
        const intersects = this.getIntersections();

        intersects.forEach((object: THREE.Intersection<THREE.Object3D | THREE.Line>) => {
            if (isIntersectionObjectAnAtom(object)) {
                this.setIntersectedAtom(object.object);
                setAtomAsHovered(object.object);
            }
        });

        if (!intersects.length && this.intersectedObject) {
            const isSelected = this.isIntersectedAtomSelected();
            if (this.intersectedObject && !isSelected && isObjectAnAtom(this.intersectedObject)) {
                unsetAtomAsHovered(this.intersectedObject);
            }
            this.setIntersectedAtom(null);
        }
        this.wave.render();
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

    extractMeasurementValues(): number[] | number[][] {
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

    getLabelObjectsFromSelectedObjects(): THREE.Object3D[] {
        return this.selectedAtoms;
    }

    getAdditionalObjectsFromSelectedObjects(): THREE.Object3D[] {
        return [];
    }

    createMeasurements() {
        if (!this.selectedAtoms.length || !this.isActive) return;
        this.refillSelectedAtoms();
        this.labelsManager.createLabels(this.getLabelObjectsFromSelectedObjects(), this.THREEGroup);
        this.getAdditionalObjectsFromSelectedObjects().forEach((object) => {
            this.THREEGroup.add(object);
        });
        this.highlightSelectedAtoms();
    }

    highlightSelectedAtoms() {
        this.selectedAtoms.forEach((atom) => {
            highlightAtom(atom);
        });
    }

    resetMeasurements() {
        this.selectedAtoms.forEach((atom) => {
            this.unsetAtomAsSelected(atom);
        });
        this.selectedAtoms = [];
        this.values = [];
        this.THREEGroup.clear();
        this.labelsManager.THREEGroup.clear();
    }

    handleLineSelection(line: THREE.Line): void {
        this.linesManager.setLineAsSelected(line);
        this.currentSelectedLine = line;
    }

    handleLineDeselection(line: THREE.Line): void {
        this.linesManager.unsetLineAsSelected(line);
        this.currentSelectedLine = null;
    }

    removeAtomsFromSelectionByIndices(atomicIndices: number[]): void {
        this.selectedAtoms = this.selectedAtoms.filter(
            (atom) => !atomicIndices.includes(atom.userData.atomicIndex),
        );

        atomicIndices.forEach((index) => {
            const atom = this.getAtomObjectByAtomicIndex(index);
            if (atom) {
                atom.userData.selected = false;
                setColorForAtom(atom);
            }
        });
    }

    deleteSelectedLine(): void {
        if (this.currentSelectedLine) {
            const atomicIndices = this.currentSelectedLine.userData.atomicIndices || [];
            this.linesManager.removeLine(this.currentSelectedLine);
            this.removeAtomsFromSelectionByIndices(atomicIndices);
            this.currentSelectedLine = null;
            this.createMeasurements();
        }
    }
}
