import * as THREE from "three";
import {Made} from "@exabyte-io/made.js";

const TV3 = THREE.Vector3;

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

    /**
     * Convert THREE.vector to an XYZ coordinate array
     * @param {THREE.Vector} vector THREE vector
     * @return {Number[]}
     * @private
     */
    _vectorToXYZCoordinate(vector) {return [vector.x, vector.y, vector.z]}

    _getDefaultSettingsForElement(element = this.settings.defaultElement, scale = this.settings.atomRadiiScale) {
        return {
            color: this.getAtomColorByElement(element),
            radius: this.getAtomRadiusByElement(element, scale),
        }
    }

    /**
     * Converts coordinates from the global (world) space to local wrt object3d
     * @param {THREE.Object3D} object3d - The object to set new reference frame.
     * @param {Number[]} worldCoordinate - Coordinate of the object in the Global (World) frame.
     * @return {Number[]}
     * @private
     */
    _convertXYZCoordinateToLocal(object3d, worldCoordinate) {
        return this._vectorToXYZCoordinate(object3d.worldToLocal(new TV3(...worldCoordinate)));
    }

    drawAtomsAsSpheres(atomRadiiScale) {

        const drawGroup = this.materialGroup;
        this.getAtomColorByElement();

        const basisWithRepetitions = Made.tools.basis.repeat(this.basis, Array(3).fill(this.settings.atomRepetitions));
        const sphereMeshObjects = basisWithRepetitions.coordinates.map((atomicCoordinate, atomicIndex) => {
            const element = basisWithRepetitions.getElementByIndex(atomicIndex);
            // local coordinate with respect to the drawGroup
            const coordinate = this._convertXYZCoordinateToLocal(drawGroup, atomicCoordinate.value);
            const sphereMesh = this.getSphereMeshObject({
                ...this._getDefaultSettingsForElement(element, atomRadiiScale),
                coordinate,
            });
            sphereMesh.name = element;
            return sphereMesh;
        });

        drawGroup.add(...sphereMeshObjects);

    }

    getAtomColorByElement(element, pallette = this.settings.elementColors) {
        return pallette[element] || this.settings.defaultColor;
    }

    getAtomRadiusByElement(element, scale = 1.0, radiimap = this.settings.vdwRadii) {
        return (radiimap[element] || this.settings.sphereRadius) * scale;
    }

};
