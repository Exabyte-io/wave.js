import * as THREE from "three";
import { ATOM_GROUP_NAME } from "../enums";
import { createObjectVerticesHashMap } from "./Hashmap";
import { ApplyGlow } from "./utils";
/*
 * Mixin containing the logic for dealing with atoms.
 * Draws atoms as spheres and handles actions performed on them.
 */
export const AtomsMixin = (superclass) => class extends superclass {
    constructor(config) {
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
    setStructure(material) {
        const extendedMaterial = material;
        this._structure = extendedMaterial.clone(); // clone original structure to assert that any updates are propagated to parents
        this._basis = extendedMaterial.Basis;
        this._basis.originalUnits = this._basis.units;
        this._basis.toCartesian();
        this.verticesHashMap = this.createAtomVerticesHashMap();
    }
    get basis() {
        return this._basis;
    }
    initSphereParameters() {
        // radius, segment, ring
        const sphereGeometry = new THREE.SphereGeometry(1, this.settings.sphereQuality, this.settings.sphereQuality);
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
    getSphereMeshObject({ color = this.settings.defaultColor, radius = this.settings.sphereRadius, coordinate = [], }) {
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
    _getDefaultSettingsForElement(element = this.settings.defaultElement, scale = this.settings.atomRadiiScale) {
        return {
            color: this.getAtomColorByElement(element),
            radius: this.getAtomRadiusByElement(element, scale),
        };
    }
    createAtomsGroup(basis, atomRadiiScale) {
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
                atomicIndex,
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
    drawAtomsAsSpheres(atomRadiiScale) {
        const basis = this.areNonPeriodicBoundariesPresent
            ? this.basisWithElementsInsideNonPeriodicBoundaries
            : this.basis;
        this.repeatAtomsAtRepetitionCoordinates(this.createAtomsGroup(basis, atomRadiiScale));
    }
    getAtomColorByElement(element, pallette = this.settings.elementColors) {
        return pallette[element] || this.settings.defaultColor;
    }
    getAtomRadiusByElement(element, scale = 1.0, radiimap = this.settings.vdwRadii) {
        return (radiimap[element] || this.settings.sphereRadius) * scale;
    }
    getAtomGroups() {
        const atomGroups = [];
        this.structureGroup.children.forEach((group) => {
            if (group.name === ATOM_GROUP_NAME) {
                atomGroups.push(...group.children);
            }
        });
        return atomGroups;
    }
    // eslint-disable-next-line class-methods-use-this
    isTHREEObjectAnAtom(object) {
        return object instanceof THREE.Mesh;
    }
    // eslint-disable-next-line class-methods-use-this
    getAtomNameFromObject(object) {
        return object.name.split("-")[0];
    }
    getVerticeKeyPerAtom(atom) {
        return this.getAtomNameFromObject(atom);
    }
    createAtomVerticesHashMap(getVerticeKeyPerAtom = this.getVerticeKeyPerAtom.bind(this), atoms = this.getAtomGroups()) {
        return createObjectVerticesHashMap(getVerticeKeyPerAtom, atoms);
    }
};
