import { Made } from "@mat3ra/made";
import * as THREE from "three";
import { Object3D, Object3DEventMap } from "three";

import { ATOM_GROUP_NAME } from "../enums";
import {
    getArrayFromVector,
    getObjectCoordinate,
    getObjectCoordinateAsArray,
} from "./threeJsUtils";
import { ApplyGlow } from "./utils";

export interface VerticesHashMap {
    [key: string]: number[];
}

export class VerticesHashMapHandler {
    hashmap: VerticesHashMap;

    constructor() {
        this.hashmap = {};
    }

    add(key: string, value: number[]) {
        if (!this.hashmap[key]) {
            this.hashmap[key] = [...value];
        } else {
            this.hashmap[key].push(...value);
        }
    }

    get(key: string) {
        return this.hashmap[key];
    }

    iterateCoordinates(callback: (key: string, coordinateAsArray: number[]) => void) {
        Object.entries(this.hashmap).forEach(([key, vertices]) => {
            for (let i = 0; i < vertices.length; i += 3) {
                const coordinateAsArray = vertices.slice(i, i + 3);
                callback(key, coordinateAsArray);
            }
        });
    }
}

/*
 * Mixin containing the logic for dealing with atoms.
 * Draws atoms as spheres and handles actions performed on them.
 */
export const AtomsMixin = (superclass: any) =>
    class extends superclass {
        constructor(config: any) {
            super(config);

            // to draw atoms as spheres
            this.initSphereParameters();

            this.drawAtomsAsSpheres = this.drawAtomsAsSpheres.bind(this);
            this.getAtomColorByElement = this.getAtomColorByElement.bind(this);

            this.setStructure(this._structure);
        }

        get structure() {
            return this._structure;
        }

        /**
         * Helper function to set the structural information.
         * @param {Made.Material} material - Structural information as Made.Material.
         */
        setStructure(material: Made.Material) {
            this._structure = material.clone(); // clone original structure to assert that any updates are propagated to parents
            this._basis = material.Basis;
            this._basis.originalUnits = this._basis.units;
            this._basis.toCartesian();
            this.verticesHashMap = this.createAtomVerticesHashMap();
        }

        get basis() {
            return this._basis;
        }

        initSphereParameters() {
            // radius, segment, ring
            const sphereGeometry = new THREE.SphereGeometry(
                1,
                this.settings.sphereQuality,
                this.settings.sphereQuality,
            );
            const sphereMaterial = new THREE.MeshLambertMaterial();
            this.sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        }

        /**
         * Prepares a sphere mesh object
         * @param {String} color
         * @param {Number} radius
         * @param {Array} coordinate
         * @return {THREE.Object3D}
         */
        getSphereMeshObject({
            color = this.settings.defaultColor,
            radius = this.settings.sphereRadius,
            coordinate = [],
        }: {
            color?: string;
            radius?: number;
            coordinate?: number[];
        }) {
            // clone original mesh to optimize the speed
            const sphereMesh = this.sphereMesh.clone();
            // set material color after cloning to optimize the speed and avoid re-creating material object
            sphereMesh.material = sphereMesh.material.clone();
            sphereMesh.material.setValues({ color });

            // eslint-disable-next-line no-multi-assign
            sphereMesh.scale.x = sphereMesh.scale.y = sphereMesh.scale.z = radius;
            sphereMesh.position.set(...coordinate);

            return sphereMesh;
        }

        _getDefaultSettingsForElement(
            element = this.settings.defaultElement,
            scale = this.settings.atomRadiiScale,
        ) {
            return {
                color: this.getAtomColorByElement(element),
                radius: this.getAtomRadiusByElement(element, scale),
            };
        }

        createAtomsGroup(basis: Made.Basis, atomRadiiScale: number) {
            const atomsGroup = new THREE.Group();
            atomsGroup.name = ATOM_GROUP_NAME;
            const { atomicLabelsArray, elementsWithLabelsArray } = basis;
            basis.coordinates.forEach((atomicCoordinate, atomicIndex) => {
                const element = basis.getElementByIndex(atomicIndex);
                const coordinate = atomicCoordinate.value;
                const sphereMesh = this.getSphereMeshObject({
                    ...this._getDefaultSettingsForElement(element, atomRadiiScale),
                    coordinate,
                });
                sphereMesh.name = `${element}-${atomicIndex}`;
                // store any additional data in userData
                // https://threejs.org/docs/#api/en/core/Object3D.userData
                sphereMesh.userData = {
                    ...sphereMesh.userData,
                    symbolWithLabel: elementsWithLabelsArray[atomicIndex],
                };
                const atomColor = this.getAtomColorByElement(element).toLowerCase();
                const label = parseInt(atomicLabelsArray[atomicIndex], 10) || 0;
                // set glow according to the label value as offset, currently
                // only single digit numeric labels are allowed, in practice we
                // expect only two different labels: 1 and 2 for up and down
                // spin representations
                ApplyGlow(sphereMesh, atomColor, label);
                atomsGroup.add(sphereMesh);
            });
            return atomsGroup;
        }

        drawAtomsAsSpheres(atomRadiiScale: number) {
            const basis = this.areNonPeriodicBoundariesPresent
                ? this.basisWithElementsInsideNonPeriodicBoundaries
                : this.basis;
            this.repeatAtomsAtRepetitionCoordinates(this.createAtomsGroup(basis, atomRadiiScale));
        }

        getAtomColorByElement(element: string, pallette = this.settings.elementColors) {
            return pallette[element] || this.settings.defaultColor;
        }

        getAtomRadiusByElement(
            element: string | number,
            scale = 1.0,
            radiimap = this.settings.vdwRadii,
        ) {
            return (radiimap[element] || this.settings.sphereRadius) * scale;
        }

        getAtomGroups() {
            const atomGroups: THREE.Object3D<THREE.Object3DEventMap>[] = [];
            this.structureGroup.children.forEach((group: THREE.Group) => {
                if (group.name === ATOM_GROUP_NAME) {
                    atomGroups.push(...group.children);
                }
            });
            return atomGroups;
        }

        isTHREEObjectAnAtom(object: any) {
            return object instanceof THREE.Mesh;
        }

        getAtomNameFromObject(object: any) {
            return object.name.split("-")[0];
        }

        getVerticeKeyPerAtom(atom: Object3D) {
            return this.getAtomNameFromObject(atom);
        }

        createAtomVerticesHashMap(getVerticeKeyPerAtom = null, atoms = null) {
            const positionsHashMap = new VerticesHashMapHandler();
            const getVerticeKeyPerAtomFn =
                getVerticeKeyPerAtom || this.getVerticeKeyPerAtom.bind(this);
            const atomsToUse = atoms || this.getAtomGroups();
            atomsToUse.forEach((atom: THREE.Object3D) => {
                if (this.isTHREEObjectAnAtom(atom)) {
                    const [x, y, z] = getArrayFromVector(atom.position);
                    const mapKey = getVerticeKeyPerAtomFn(atom);
                    positionsHashMap.add(mapKey, [x, y, z]);
                }
            });
            return positionsHashMap;
        }
    };
