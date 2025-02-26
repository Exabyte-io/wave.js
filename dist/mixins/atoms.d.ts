export function AtomsMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        drawAtomsAsSpheres(atomRadiiScale: any): void;
        getAtomColorByElement(element: any, pallette?: any): any;
        readonly structure: any;
        /**
         * Helper function to set the structural information.
         * @param {Made.Material} s - Structural information as Made.Material.
         */
        setStructure(s: Made.Material): void;
        _structure: any;
        _basis: any;
        readonly basis: any;
        initSphereParameters(): void;
        sphereMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial, THREE.Object3DEventMap> | undefined;
        /**
         * Prepares a sphere mesh object
         * @param {String} color
         * @param {Number} radius
         * @param {Array} coordinate
         * @return {THREE.Object3D}
         */
        getSphereMeshObject({ color, radius, coordinate, }: string): THREE.Object3D;
        _getDefaultSettingsForElement(element?: any, scale?: any): {
            color: any;
            radius: number;
        };
        createAtomsGroup(basis: any, atomRadiiScale: any): THREE.Group<THREE.Object3DEventMap>;
        getAtomRadiusByElement(element: any, scale?: number, radiimap?: any): number;
    };
    [x: string]: any;
};
import * as THREE from "three";
