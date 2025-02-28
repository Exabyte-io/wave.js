import * as THREE from "three";

import { ATOM_GROUP_NAME, COLORS, MEASUREMENT_MODES } from "../../enums";
import {
    BaseDOMListenerManagerWithThreeGroup,
    BaseDOMListenerManagerWithThreeGroupAndRaycaster,
} from "../base_listener";
import { BaseLabelsManager } from "../labels/base";

/**
 * Base class for managing measurements.
 * Contains generic logic for handling measurements: toggling measurement, selecting atoms, creating labels.
 */
export class BaseMeasurementManager extends BaseDOMListenerManagerWithThreeGroupAndRaycaster {
    measurementType = "";

    selectedAtoms: THREE.Object3D[] = [];

    intersectedAtom: THREE.Object3D | null = null;

    isActive = false;

    constructor(config: any) {
        super(config);
        this.initRaycaster();
        this.selectedAtoms = [];
        this.intersectedAtom = null;
    }

    setAtomAsSelected(atomObject: THREE.Object3D) {
        atomObject.userData.selected = true;
        atomObject.material?.emissive?.setHex(0xff0000);
    }

    setAtomAsUnselected(atomObject: THREE.Object3D) {
        atomObject.userData.selected = false;
        atomObject.material?.emissive?.setHex(atomObject.currentHex);
    }

    // TODO: Remove
    setHexForAtom(intersectItem: THREE.Object3D) {
        if (this.intersectedAtom !== intersectItem) {
            this.setDefaultHexForAtom();
            this.intersectedAtom = intersectItem;
            this.intersectedAtom.currentHex = this.intersectedAtom.material.emissive.getHex();
            this.intersectedAtom.material.emissive.setHex(COLORS.RED);
        }
    }

    setDefaultHexForAtom() {
        // @ts-ignore
        this.intersectedAtom.material.emissive.setHex(this.intersectedAtom?.currentHex);
    }

    onClick = (event: MouseEvent) => {
        if (!this.isActive) return;
        this.checkMouseCoordinates(event);
        const intersects = this.raycaster.intersectObjects([...this.getAtomGroup()], true);
        if (!intersects.length) return;

        for (const { object: intersectItem } of intersects) {
            if (this.intersectedAtom && this.intersectedAtom !== intersectItem) {
                this.handleAtomClick(this.intersectedAtom);
            }
        }
    };

    handleAtomClick(atom: THREE.Object3D) {
        console.log(atom);
    }

    toggleAtomSelection(atomObject: THREE.Object3D) {
        if (this.selectedAtoms.includes(atomObject)) {
            this.selectedAtoms = this.selectedAtoms.filter((atom) => atom !== atomObject);
            this.setAtomAsUnselected(atomObject);
        } else {
            this.selectedAtoms.push(atomObject);
            this.setAtomAsSelected(atomObject);
        }
    }

    /** Handles visualization of mouse interaction with atoms and other objects */
    onPointerMove = (event: MouseEvent) => {
        this.checkMouseCoordinates(event);
        const intersects = this.raycaster.intersectObjects([...this.getAtomGroup()], true);

        for (const { object: intersectItem } of intersects) {
            if (this.intersectedAtom && this.intersectedAtom !== intersectItem) {
                this.setDefaultHexForAtom();
            }
            if (!intersectItem.userData?.selected) {
                if (intersectItem.type === "Mesh") {
                    this.setHexForAtom(intersectItem);
                    break;
                }
            }
        }

        // On leave atom, reset the previously intersected atom
        if (!intersects.length) {
            if (this.intersectedAtom) {
                this.setDefaultHexForAtom();
            }
        }
    };

    createMeasurementLabel(text: string, name: string, position: THREE.Vector3) {
        const labelManager = new BaseLabelsManager(this.waveStructureGroup, this.waveCamera);
        const label = labelManager.createLabelSprite(text, name);
        label.position.copy(position);
        label.visible = true;
        this.THREEGroup.add(label);
        this.waveStructureGroup.add(this.THREEGroup);
        return label;
    }

    /**
     * Removes all measurements items and clears selected atoms
     */
    resetMeasurements(): void {
        if (this.selectedAtoms.length) {
            this.selectedAtoms.forEach((atom) => {
                atom.userData.selected = false;
                // @ts-ignore
                atom.material.emissive.setHex(atom.currentHex);
            });
            this.selectedAtoms = [];
        }
        while (this.THREEGroup.children.length) {
            this.THREEGroup.remove(this.THREEGroup.children[0]);
        }
    }
}
