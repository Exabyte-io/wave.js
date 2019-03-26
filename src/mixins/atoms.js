import * as THREE from "three";
import {Made} from "@exabyte-io/made.js";
import {ELEMENT_BONDS} from "@exabyte-io/periodic-table.js";

/*
 * Mixin containing the logic for dealing with atoms.
 * Draws atoms as spheres and handles actions performed on them.
 */
export const AtomsMixin = (superclass) => class extends superclass {

    constructor(config) {
        super(config);

        this.areBondsDrawn = false;
        this.bondsGroup = new THREE.Group();
        this.bondsGroup.name = "Bonds";

        // to draw atoms as spheres
        this.initSphereParameters();

        this.toggleBonds = this.toggleBonds.bind(this);
        this.drawAtomsAsSpheres = this.drawAtomsAsSpheres.bind(this);
        this.getAtomColorByElement = this.getAtomColorByElement.bind(this);

        this.setStructure(this._structure);
    }

    get structure() {return this._structure}

    /**
     * Helper function to set the structural information.
     * @param {Made.Material} s - Structural information as Made.Material.
     */
    setStructure(s) {
        this._structure = s.clone();  // clone original structure to assert that any updates are propagated to parents
        this._basis = s.Basis;
        this._basis.originalUnits = this._basis.units;
        this._basis.toCartesian();
    }

    get basis() {return this._basis}

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
    getSphereMeshObject({color = this.settings.defaultColor, radius = this.settings.sphereRadius, coordinate = []}) {
        // clone original mesh to optimize the speed
        const sphereMesh = this.sphereMesh.clone();
        // set material color after cloning to optimize the speed and avoid re-creating material object
        sphereMesh.material = sphereMesh.material.clone();
        sphereMesh.material.setValues({color});

        sphereMesh.scale.x = sphereMesh.scale.y = sphereMesh.scale.z = radius;
        sphereMesh.position.set(...coordinate);

        return sphereMesh;
    }

    _getDefaultSettingsForElement(element = this.settings.defaultElement, scale = this.settings.atomRadiiScale) {
        return {
            color: this.getAtomColorByElement(element),
            radius: this.getAtomRadiusByElement(element, scale),
        }
    }

    createAtomsGroup(basis, atomRadiiScale) {
        const atomsGroup = new THREE.Group();
        atomsGroup.name = "Atoms";
        basis.coordinates.forEach((atomicCoordinate, atomicIndex) => {
            const element = basis.getElementByIndex(atomicIndex);
            const sphereMesh = this.getSphereMeshObject({
                ...this._getDefaultSettingsForElement(element, atomRadiiScale),
                coordinate: atomicCoordinate.value,
            });
            sphereMesh.name = `${element}-${atomicIndex}`;
            atomsGroup.add(sphereMesh);
        });
        return atomsGroup;
    }

    /**
     * Whether to draw a bond between given elements.
     */
    areElementsBonded(element1, coordinate1, element2, coordinate2) {
        return Boolean(ELEMENT_BONDS.find(b => {
            return b.elements.includes(element1) && b.elements.includes(element2) &&
                b.length.value && b.length.value >= Made.math.vDist(coordinate1.value, coordinate2.value);
        }));
    }

    /**
     * Add bonds.
     */
    addBonds() {
        const basis = Made.tools.basis.repeat(this.basis, Array(3).fill(this.settings.atomRepetitions));
        basis.coordinates.forEach((coordinate1, index1) => {
            const element1 = basis.getElementByIndex(index1);
            basis.coordinates.forEach((coordinate2, index2) => {
                const element2 = basis.getElementByIndex(index2);
                if (index2 <= index1 || !this.areElementsBonded(element1, coordinate1, element2, coordinate2)) return;
                const bond = this.getBondObjectAsCylinder(element1, index1, coordinate1, element2, index2, coordinate2);
                this.bondsGroup.add(bond);
            });
        });
        this.structureGroup.add(this.bondsGroup);
    }

    cylindricalSegment(A, B, radius, material) {
        var vec = B.clone();
        vec.sub(A);
        var h = vec.length();
        vec.normalize();
        var quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec);
        var geometry = new THREE.CylinderGeometry(radius, radius, h, 32);
        geometry.translate(0, h / 2, 0);
        var cylinder = new THREE.Mesh(geometry, material);
        cylinder.applyQuaternion(quaternion);
        cylinder.position.set(A.x, A.y, A.z);
        return cylinder;
    }

    /**
     * Draw bond with cylinder geometry.
     */
    getBondObjectAsCylinder(element1, index1, coordinate1, element2, index2, coordinate2) {
        const vector1 = new THREE.Vector3(...coordinate1.value);
        const vector2 = new THREE.Vector3(...coordinate2.value);
        const direction = new THREE.Vector3().subVectors(vector2, vector1);
        const height = direction.length();
        direction.normalize();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, height, 8, 1);
        geometry.translate(0, height / 2, 0);
        const material = new THREE.MeshBasicMaterial();
        const bond = new THREE.Mesh(geometry, material);
        bond.applyQuaternion(quaternion);
        bond.position.set(vector1.x, vector1.y, vector1.z);
        bond.name = `${element1}-${index1}:${element2}-${index2}`;
        return bond;
    }

    /**
     * Draw bond with line geometry.
     */
    getBondObjectAsLine(element1, index1, coordinate1, element2, index2, coordinate2) {
        const material = new THREE.LineBasicMaterial();
        const geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(...coordinate1.value));
        geometry.vertices.push(new THREE.Vector3(...coordinate2.value));
        const bond = new THREE.Line(geometry, material);
        bond.name = `${element1}-${index1}:${element2}-${index2}`;
        return bond;
    }

    /**
     * Remove bonds.
     */
    removeBonds() {
        this.structureGroup.remove(this.bondsGroup);
    }

    toggleBonds() {
        if (this.areBondsDrawn) {
            this.removeBonds();
            this.areBondsDrawn = false;
        } else {
            this.addBonds();
            this.areBondsDrawn = true;
        }
    }

    drawAtomsAsSpheres(atomRadiiScale) {
        const basisWithRepetitions = Made.tools.basis.repeat(this.basis, Array(3).fill(this.settings.atomRepetitions));
        const atomsGroup = this.createAtomsGroup(basisWithRepetitions, atomRadiiScale);
        this.structureGroup.add(atomsGroup);
    }

    getAtomColorByElement(element, pallette = this.settings.elementColors) {
        return pallette[element] || this.settings.defaultColor;
    }

    getAtomRadiusByElement(element, scale = 1.0, radiimap = this.settings.vdwRadii) {
        return (radiimap[element] || this.settings.sphereRadius) * scale;
    }

};
