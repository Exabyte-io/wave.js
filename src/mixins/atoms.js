import {Made} from "made.js";
import * as THREE from "three";

const TV3 = THREE.Vector3, TCo = THREE.Color;

export const AtomsMixin = (superclass) => class extends superclass {

    constructor(config) {
        super(config);

        this.initSphereParameters();  // to draw atoms as spheres
        this.atomsGroup = new THREE.Object3D();
        this.scene.add(this.atomsGroup);

        this.drawAtomsAsSpheres = this.drawAtomsAsSpheres.bind(this);
        this.getAtomColorByElement = this.getAtomColorByElement.bind(this);

        this.addAtoms = this.addAtoms.bind(this);
        this.removeAtoms = this.removeAtoms.bind(this);
        this.moveAtoms = this.moveAtoms.bind(this);

        this.setStructure(this._structure);
    }

    get structure() {return this._structure}

    setStructure(s) {
        this._structure = s.clone();  // clone original structure to assert that any updates are propagated to parents
        this._basis = s.Basis;
        this._basis.originalUnits = this._basis.units;
        this._basis.toCartesian();
    }

    get basis() {return this._basis}

    setBasis(b) {
        const convertBackToCrystal = (b.units !== this._basis.originalUnits);
        this._basis = b;
        if (convertBackToCrystal) b.toCrystal();
        this.structure.setBasis(b);
        // explicitly direct the class to call 'onUpdate' during render
        this.callOnUpdate = true;
    }

    initSphereParameters() {
        // radius, segment, ring
        const sphereGeometry = new THREE.SphereGeometry(1, this.settings.sphereQuality, this.settings.sphereQuality);
        const sphereMaterial = new THREE.MeshLambertMaterial();
        this.sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

    }

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

    _vectorToXYZCoordinate(vector) {return [vector.x, vector.y, vector.z]}

    addAtoms(objects = []) {
        const addGroup = this.atomsGroup;
        if (!this.raycaster) return;
        const raycasterOrigin = this.raycaster.ray.origin.clone();
        const raycasterDirection = this.raycaster.ray.direction.clone();
        const positionVector = raycasterOrigin.add(raycasterDirection.multiplyScalar(53));
        const coordinate = this._convertXYZCoordinateToLocal(addGroup, this._vectorToXYZCoordinate(positionVector));
        const sphereMeshObjects = objects.map(o => this.getSphereMeshObject({
            ...this._getDefaultSettingsForElement(),
            coordinate
        }));
        this.basis.addAtom({coordinate});
        this.setBasis(this.basis);  // propagate changes to structure/material
        addGroup.add(...sphereMeshObjects);
        this.render();
    }

    removeAtomsAtObjectPositions(meshObjects) {
        const objectPositions = meshObjects.map(o => this._vectorToXYZCoordinate(o.getWorldPosition()));
        objectPositions.forEach(coordinate => {
            this.basis.removeAtomAtCoordinate({coordinate})
        });
        this.setBasis(this.basis);  // propagate changes to structure/material
    }

    moveAtoms(meshObjects) {
        const moveGroup = this.atomsGroup;
        meshObjects = meshObjects || moveGroup.children;
        // global positions with respect to the THREE world
        const worldPositions = meshObjects.map(o => this._vectorToXYZCoordinate(o.getWorldPosition()));
        this.basis.coordinates = worldPositions;
        this.setBasis(this.basis);  // propagate changes to structure/material
        this.render();
    }

    removeAtoms(objects = []) {
        this.removeAtomsAtObjectPositions(objects);
        this.atomsGroup.remove(...objects);
        this.render();
    }

    _getDefaultSettingsForElement(element = this.settings.defaultElement, scale = this.settings.atomRadiiScale) {
        return {
            color: this.getAtomColorByElement(element),
            radius: this.getAtomRadiusByElement(element, scale),
        }
    }

    // converts coordinates from world space to local wrt object3d
    _convertXYZCoordinateToLocal(object3d, worldCoordinate) {
        return this._vectorToXYZCoordinate(object3d.worldToLocal(new TV3(...worldCoordinate)));
    }

    drawAtomsAsSpheres(atomRadiiScale) {

        const drawGroup = this.atomsGroup;
        this.getAtomColorByElement();

        const basisWithRepetitions = Made.tools.basis.repeat(this.basis, Array(3).fill(this.settings.atomRepetitions));
        const sphereMeshObjects = basisWithRepetitions.coordinates.map((atomicCoordinate, atomicIndex) => {
            const element = basisWithRepetitions.getElementByIndex(atomicIndex);
            // local coordinate with respect to the drawGroup
            const coordinate = this._convertXYZCoordinateToLocal(drawGroup, atomicCoordinate.value);
            return this.getSphereMeshObject({
                ...this._getDefaultSettingsForElement(element, atomRadiiScale),
                coordinate,
            });
        });

        drawGroup.add(...sphereMeshObjects);

    }

    getAtomColorByElement(element, pallette = this.settings.elementColors) {
        return pallette[element] || this.settings.defaultColor;
    }

    getAtomRadiusByElement(element, scale = 1.0, radiimap = this.settings.vdwRadii) {
        return (radiimap[element] || this.settings.sphereRadius) * scale;
    }

}
