import { Basis, MaterialInMemoryEntity } from "@mat3ra/made";
import * as THREE from "three";
import { Object3D } from "three";
export declare const AtomsMixin: (superclass: any) => {
    new (config: any): {
        [x: string]: any;
        readonly structure: any;
        setStructure(material: MaterialInMemoryEntity): void;
        readonly basis: any;
        initSphereParameters(): void;
        /**
         * Prepares a sphere mesh object
         * @param {String} color
         * @param {Number} radius
         * @param {Array} coordinate
         * @return {THREE.Object3D}
         */
        getSphereMeshObject({ color, radius, coordinate, }: {
            color?: string;
            radius?: number;
            coordinate?: number[];
        }): any;
        _getDefaultSettingsForElement(element?: any, scale?: any): {
            color: any;
            radius: number;
        };
        createAtomsGroup(basis: Basis, atomRadiiScale: number): THREE.Group<THREE.Object3DEventMap>;
        drawAtomsAsSpheres(atomRadiiScale: number): void;
        getAtomColorByElement(element: string, pallette?: any): any;
        getAtomRadiusByElement(element: string | number, scale?: number, radiimap?: any): number;
        getAtomGroups(): THREE.Object3D<THREE.Object3DEventMap>[];
        isTHREEObjectAnAtom(object: any): object is THREE.Mesh<any, any, any>;
        getAtomNameFromObject(object: any): any;
        getVerticeKeyPerAtom(atom: Object3D): any;
        createAtomVerticesHashMap(getVerticeKeyPerAtom?: (atom: Object3D) => any, atoms?: THREE.Object3D<THREE.Object3DEventMap>[]): import("./Hashmap").VerticesHashMapHandler;
    };
    [x: string]: any;
};
