import * as THREE from "three";

import { ATOM_GROUP_NAME, COLORS, MEASUREMENT_MODES_ENUM } from "../../enums";
import { RaycasterMixinWithListeners } from "../listeners/mixins";
import { BaseLabelsManager, LabelsManagerConstructor } from "../labels/base";
import { BaseTHREEGroupManager } from "../base";
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

    constructor(
        waveStructureGroup: THREE.Group,
        waveCamera: THREE.Camera,
        wave: any,
        updateState: any,
    ) {
        super(waveStructureGroup, waveCamera, wave);
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
            this.wave.setCursorStyle("");
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

    setAtomAsSelected(atomObject: THREE.Object3D) {
        atomObject.userData.selected = true;
        this.setColorForAtom(atomObject, COLORS.RED);
        this.selectedAtoms.push(atomObject);
    }

    unsetAtomAsSelected(atomObject: THREE.Object3D) {
        atomObject.userData.selected = false;
        this.setColorForAtom(atomObject);
        this.selectedAtoms = this.selectedAtoms.filter((atom) => atom.uuid !== atomObject.uuid);
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
        if (this.selectedAtoms.includes(atomObject)) {
            this.unsetAtomAsSelected(atomObject);
        } else {
            this.setAtomAsSelected(atomObject);
        }
        this.wave.render();
    }

    getSettings() {
        return {
            isActive: this.isActive,
            measurementType: this.measurementType,
            values: this.values,
        };
    }

    getUpdatedMeasurementSettings() {
        const settings = this.getSettings();
        const settingsHandler = new MeasurementSettingsHandler();
    }

    // @ts-ignore
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

    createMeasurementLabel(text: string, name: string, position: THREE.Vector3) {
        const managerInstance = new this.LabelsManagerCls(
            this.waveStructureGroup,
            this.waveCamera,
            this.wave,
        );
        const label = managerInstance.createLabelSprite(text, name);
        label.position.copy(position);
        this.THREEGroup.add(label);
        this.waveStructureGroup.add(this.THREEGroup);
        console.log(
            "createMeasurementLabel",
            this.waveStructureGroup,
            this.THREEGroup,
            this.THREEGroup.children,
        );
        return label;
    }

    createMeasurementLabelsForAtoms(atoms = this.selectedAtoms) {
        this.THREEGroup.clear();
        atoms.forEach((atom) => {
            const position = new THREE.Vector3().copy(atom.position);
            const name = atom.name;
            const text = atom.name;
            this.createMeasurementLabel(text, name, position);
        });
    }

    resetMeasurements(): void {
        this.selectedAtoms.forEach((atom) => {
            this.unsetAtomAsSelected(atom);
        });
        this.THREEGroup.clear();
    }
}
