import * as THREE from "three";

import { ATOM_GROUP_NAME, COLORS, MEASUREMENT_MODES } from "../../enums";
import { RaycasterMixinWithListeners } from "../listeners/mixins";
import { BaseLabelsManager } from "../labels/base";
import { BaseTHREEGroupManager } from "../base";
import { getObjectCoordinateAsArray } from "../threeJsUtils";

const BaseManager = RaycasterMixinWithListeners(BaseTHREEGroupManager);

/**
 * Base class for managing measurements.
 * Contains generic logic for handling measurements: toggling measurement, selecting atoms, creating labels.
 */
export class BaseMeasurementManager extends BaseManager {
    measurementType: MEASUREMENT_MODES = MEASUREMENT_MODES.NONE;

    selectedAtoms: THREE.Object3D[] = [];

    isActive = false;

    values: any[];

    LabelsManager: any = BaseLabelsManager;

    constructor(waveStructureGroup: THREE.Group, waveCamera: THREE.Camera, wave: any) {
        super(waveStructureGroup, waveCamera);
        this.initRaycaster();
        this.selectedAtoms = [];
        this.intersectedAtom = null;
        this.canvas = wave.renderer.domElement;
    }

    toggleActive = () => {
        this.isActive = !this.isActive;
        this.THREEGroup.visible = this.isActive;
        if (!this.isActive) {
            this.resetMeasurements();
            this.destroyListeners();
        } else {
            this.initListeners();
        }
    };

    setColorForAtom(atomObject: THREE.Object3D, color?: number) {
        const newColor = color || atomObject.material.emissive.getHex();
        atomObject.currentHex = atomObject.material.emissive.getHex();
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
        this.selectedAtoms = this.selectedAtoms.filter((atom) => atom !== atomObject);
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

    getAtomGroups() {
        const atomGroups: THREE.Object3D<THREE.Object3DEventMap>[] = [];
        this.waveStructureGroup.children.forEach((group) => {
            if (group.name === ATOM_GROUP_NAME) {
                atomGroups.push(...group.children);
            }
        });
        return atomGroups;
    }

    getIntersections() {
        return this.raycaster.intersectObjects([...this.getAtomGroups()], true);
    }

    toggleAtomSelection(atomObject: THREE.Object3D) {
        if (this.selectedAtoms.includes(atomObject)) {
            this.selectedAtoms = this.selectedAtoms.filter((atom) => atom !== atomObject);
            this.unsetAtomAsSelected(atomObject);
        } else {
            this.selectedAtoms.push(atomObject);
            this.setAtomAsSelected(atomObject);
        }
    }

    getSettings() {
        return {
            isActive: this.isActive,
            measurementType: this.measurementType,
            values: this.values,
        };
    }

    // @ts-ignore
    onClick(event: MouseEvent) {
        if (!this.isActive) return;
        this.checkMouseCoordinates(event, this.waveCamera);
        const intersects = this.getIntersections();

        intersects.forEach((object: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>) => {
            if (this.isIntersectionObjectAnAtom(object)) {
                if (this.selectedAtoms.includes(object.object)) {
                    this.unsetAtomAsSelected(object.object);
                } else {
                    this.setAtomAsSelected(object.object);
                }
            }
        });

        this.copyValuesToClipboard();
    }

    onPointerMove = (event: MouseEvent) => {
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
        const managerInstance = new this.LabelsManager(
            this.waveStructureGroup,
            this.waveCamera,
            this.wave,
        );
        const label = managerInstance.createLabelSprite(text, name);
        label.position.copy(position);
        this.THREEGroup.add(label);
        this.waveStructureGroup.add(this.THREEGroup);
        return label;
    }

    resetMeasurements(): void {
        this.selectedAtoms.forEach((atom) => {
            this.unsetAtomAsSelected(atom);
        });
        this.THREEGroup.clear();
    }
}
