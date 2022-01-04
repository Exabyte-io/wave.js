import * as THREE from "three";

/*
 * Mixin containing the logic for dealing with atoms.
 * Draws atoms as spheres and handles actions performed on them.
 */
export const AtomsMixin = (superclass) =>
    class extends superclass {
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

        /**
         * Helper function to set the structural information.
         * @param {Made.Material} s - Structural information as Made.Material.
         */
        setStructure(s) {
            this._structure = s.clone(); // clone original structure to assert that any updates are propagated to parents
            this._basis = s.Basis;
            this._basis.originalUnits = this._basis.units;
            this._basis.toCartesian();
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
        }) {
            // clone original mesh to optimize the speed
            const sphereMesh = this.sphereMesh.clone();
            // set material color after cloning to optimize the speed and avoid re-creating material object
            sphereMesh.material = sphereMesh.material.clone();
            sphereMesh.material.setValues({ color });

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

        drawAtomsAsSpheres(atomRadiiScale) {
            const basis = this.areNonPeriodicBoundariesPresent
                ? this.basisWithElementsInsideNonPeriodicBoundaries
                : this.basis;
            this.repeatObject3DAtRepetitionCoordinates(
                this.createAtomsGroup(basis, atomRadiiScale),
            );
        }

        getAtomColorByElement(element, pallette = this.settings.elementColors) {
            return pallette[element] || this.settings.defaultColor;
        }

        getAtomRadiusByElement(element, scale = 1.0, radiimap = this.settings.vdwRadii) {
            return (radiimap[element] || this.settings.sphereRadius) * scale;
        }
    };
