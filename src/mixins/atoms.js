import * as THREE from "three";
import {Made} from "@exabyte-io/made.js";

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

    createSitesGroup(basis, atomRadiiScale) {
        const sitesGroup = new THREE.Group();
        sitesGroup.name = "Sites";
        basis.coordinates.forEach((atomicCoordinate, atomicIndex) => {
            const element = basis.getElementByIndex(atomicIndex);
            const sphereMesh = this.getSphereMeshObject({
                ...this._getDefaultSettingsForElement(element, atomRadiiScale),
                coordinate: atomicCoordinate.value,
            });
            sphereMesh.name = `${element}-${atomicIndex}`;
            sitesGroup.add(sphereMesh);
        });
        return sitesGroup;
    }

    /**
     * Whether to draw bond between given atoms.
     */
    areElementsBonded(element1, coordinate1, element2, coordinate2) {
        // TODo: implement the logic.
        return true;
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
                const bond = this.getBondObject(element1, index1, coordinate1, element2, index2, coordinate2);
                this.bondsGroup.add(bond);
            });
        });
        this.structureGroup.add(this.bondsGroup);
    }

    getBondObject(element1, index1, coordinate1, element2, index2, coordinate2) {
        const material = new THREE.LineBasicMaterial({color: this.settings.colors.amber});
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
        const sitesGroup = this.createSitesGroup(basisWithRepetitions, atomRadiiScale);
        this.structureGroup.add(sitesGroup);
    }

    getAtomColorByElement(element, pallette = this.settings.elementColors) {
        return pallette[element] || this.settings.defaultColor;
    }

    getAtomRadiusByElement(element, scale = 1.0, radiimap = this.settings.vdwRadii) {
        return (radiimap[element] || this.settings.sphereRadius) * scale;
    }

};
