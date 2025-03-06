import { MEASUREMENT_MODES_ENUM } from "../../enums";
import { BaseTHREEGroupManager } from "../base";
import { RaycasterMixinWithListeners } from "../listeners/mixins";
import { getObjectCoordinateAsArray, highlightAtom, isIntersectionObjectAnAtom, setAtomAsHovered, setColorForAtom, unsetAtomAsHovered, } from "../threeJsUtils";
const BaseManager = RaycasterMixinWithListeners(BaseTHREEGroupManager);
/**
 * Base class for managing measurements.
 * Contains generic logic for handling measurements: toggling measurement, selecting atoms, creating labels.
 */
export class BaseMeasurementManager extends BaseManager {
    constructor(waveStructureGroup, waveCamera, wave, groupName, updateState) {
        super(waveStructureGroup, waveCamera, wave, groupName + "-measurement-group");
        this.measurementType = MEASUREMENT_MODES_ENUM.NONE;
        this.selectedAtoms = [];
        this.isActive = false;
        this.toggleActive = () => {
            this.toggleVisibility();
            this.isActive = !this.isActive;
            if (!this.isActive) {
                this.resetMeasurements();
                this.destroyListeners();
                this.wave.setCursorStyle();
            }
            else {
                this.wave.setCursorStyle("pointer");
                this.initListeners(this.updateState);
            }
        };
        this.onPointerMove = (event) => {
            if (!this.isActive)
                return;
            this.checkMouseCoordinates(event, this.waveCamera);
            const intersects = this.getIntersections();
            intersects.forEach((object) => {
                if (isIntersectionObjectAnAtom(object)) {
                    this.setIntersectedAtom(object.object);
                    setAtomAsHovered(object.object);
                }
            });
            if (!intersects.length && this.intersectedAtom) {
                const isSelected = this.isIntersectedAtomSelected();
                if (this.intersectedAtom && !isSelected) {
                    unsetAtomAsHovered(this.intersectedAtom);
                }
                this.setIntersectedAtom(null);
            }
            this.wave.render();
        };
        this.initRaycaster();
        this.selectedAtoms = [];
        this.intersectedAtom = null;
        this.canvas = wave.renderer.domElement;
        this.updateState = updateState;
    }
    getLabelsManagerInstance() {
        return new this.LabelsManagerCls(this.waveStructureGroup, this.waveCamera, this.wave);
    }
    getSelectedAtomIndices() {
        // TODO: refactor to use atom names getter from createAtomGroups
        return this.selectedAtoms.map((atom) => atom.userData.atomicIndex);
    }
    getAtomObjectByAtomicIndex(atomicIndex) {
        return this.wave
            .getAtomGroups()
            .find((atom) => atom.userData.atomicIndex === atomicIndex);
    }
    setAtomAsSelected(atomObject) {
        atomObject.userData.selected = true;
        const selectedAtomIndices = this.getSelectedAtomIndices();
        if (!selectedAtomIndices.includes(atomObject.userData.atomicIndex)) {
            this.selectedAtoms.push(atomObject);
        }
        highlightAtom(atomObject);
    }
    unsetAtomAsSelected(atomObject) {
        atomObject.userData.selected = false;
        setColorForAtom(atomObject);
        this.selectedAtoms = this.selectedAtoms.filter((atom) => atom.userData.atomicIndex !== atomObject.userData.atomicIndex);
    }
    setIntersectedAtom(intersectItem) {
        if (this.intersectedAtom !== intersectItem) {
            this.intersectedAtom = intersectItem;
        }
    }
    isIntersectedAtomSelected() {
        if (!this.intersectedAtom)
            return false;
        return this.selectedAtoms.some((atom) => { var _a; return atom.userData.atomicIndex === ((_a = this.intersectedAtom) === null || _a === void 0 ? void 0 : _a.userData.atomicIndex); });
    }
    getIntersections() {
        return this.raycaster.intersectObjects([...this.wave.getAtomGroups()], true);
    }
    toggleAtomSelection(atomObject) {
        if (this.getSelectedAtomIndices().includes(atomObject.userData.atomicIndex)) {
            this.unsetAtomAsSelected(atomObject);
        }
        else {
            this.setAtomAsSelected(atomObject);
        }
    }
    refillSelectedAtoms() {
        const validAtoms = [];
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
    onClick(event) {
        if (!this.isActive)
            return;
        this.checkMouseCoordinates(event, this.waveCamera);
        const intersects = this.getIntersections();
        intersects.forEach((object) => {
            if (isIntersectionObjectAnAtom(object)) {
                const atom = object.object;
                this.toggleAtomSelection(atom);
            }
        });
        this.copyValuesToClipboard();
    }
    copyValuesToClipboard() {
        const values = this.extractMeasurementValues();
        let valuesText = "";
        if (values.length > 1) {
            valuesText = JSON.stringify(values);
        }
        else if (values.length === 1) {
            valuesText = JSON.stringify(values[0]);
        }
        navigator.clipboard.writeText(valuesText).catch(console.error);
    }
    extractMeasurementValues() {
        const values = this.selectedAtoms.map((atom) => getObjectCoordinateAsArray(atom));
        this.values = values;
        return values;
    }
    createMeasurementLabel(text, name, position, threeGroup = this.THREEGroup) {
        const managerInstance = new this.LabelsManagerCls(this.waveStructureGroup, this.waveCamera, this.wave);
        const label = managerInstance.createLabelSprite(text, name);
        label.position.copy(position);
        threeGroup.add(label);
        this.waveStructureGroup.add(threeGroup);
    }
    getLabelObjectsFromSelectedObjects() {
        return this.selectedAtoms;
    }
    getAdditionalObjectsFromSelectedObjects() {
        return [];
    }
    createMeasurements() {
        if (!this.selectedAtoms.length || !this.isActive)
            return;
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
            setColorForAtom(atom);
        });
        this.selectedAtoms = [];
        this.THREEGroup.clear();
        this.labelsManager.THREEGroup.clear();
    }
}
