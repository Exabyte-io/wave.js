import { AtomicElementSchema } from "@mat3ra/esse/dist/js/types";
import { filterBondsDataByElementsAndOrder, getElementsBondsData } from "@mat3ra/periodic-table";
import { sharedUtils } from "@mat3ra/utils";
import createKDTree from "static-kdtree";
import * as THREE from "three";

interface BondDataInterface {
    length: {
        value: number;
    };
}

type ElementAndCoordinateAsArray = [string, number[]];

/*
 * Mixin containing the logic for dealing with bonds.
 */
export const BondsMixin = (superclass: any) =>
    class extends superclass {
        constructor(config: any) {
            super(config);
            this.createBondsAsync();
            this.isDrawBondsEnabled = false;
            this.drawBonds = this.drawBonds.bind(this);
            this.createBondsAsync = this.createBondsAsync.bind(this);
        }

        /**
         * Creates bond asynchronously as bonds creation takes time for large structures.
         */
        createBondsAsync(): void {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const clsInstance = this;
            clsInstance.areBondsCreated = false;
            setTimeout(() => {
                clsInstance.bondsGroup = clsInstance.createBondsGroup();
                clsInstance.areBondsCreated = true;
            }, 10);
        }

        /**
         * Whether to draw the bond between given elements.
         * The elements are considered bonded if their distance <= bond length * connectivity factor
         * @param element1 {String} symbol of the first element
         * @param coordinate1 {Array} coordinates of the first element
         * @param element2 {String} symbol of the second element
         * @param coordinate2 {Array} coordinates of the second element
         * @param bondsData {Array} an array of bond data entries for unique element pairs inside structure.
         * @returns {Boolean}
         */
        // TODO: move to made basis bonded
        areElementsBonded(
            element1: string,
            coordinate1: number[],
            element2: string,
            coordinate2: number[],
            bondsData: BondDataInterface[],
        ): boolean {
            const distance = sharedUtils.math.vDist(coordinate1, coordinate2);
            const connectivityFactor = this.settings.chemicalConnectivityFactor;
            return Boolean(
                filterBondsDataByElementsAndOrder(bondsData, element1, element2).find(
                    (b: BondDataInterface) => {
                        return (
                            b.length.value &&
                            distance !== undefined &&
                            distance <= b.length.value * connectivityFactor
                        );
                    },
                ),
            );
        }

        /**
         * Returns bonds data for unique element pairs. This is to avoid calling getElementsBondsData for all elements
         * combinations as it is required to repeat the cell in all directions to determine the bonds.
         * @returns {Array} an array of bond data entries for unique element pairs inside structure.
         */
        // TODO: move to made basis bonded
        getBondsDataForUniqueElementPairs(): BondDataInterface[] {
            const bonds: BondDataInterface[] = [];
            const { uniqueElements } = this.basis;
            uniqueElements.forEach((element1: string, index1: number) => {
                uniqueElements.forEach((element2: string, index2: number) => {
                    if (element1 && element2 && index2 >= index1) {
                        Array.prototype.push.apply(bonds, getElementsBondsData(element1, element2));
                    }
                });
            });
            return bonds;
        }

        /**
         * Returns the maximum bond length in the structure.
         * @param bondsData {Array} an array of bond data entries for unique element pairs inside structure.
         * @returns {Number}
         */
        // TODO: move to made basis bonded
        getMaxBondLength(bondsData: BondDataInterface[]): number {
            const connectivityFactor = this.settings.chemicalConnectivityFactor;
            return (
                connectivityFactor *
                sharedUtils.math.max(bondsData.map((b: BondDataInterface) => b.length.value || 0))
            );
        }

        /**
         * Returns an array of [element, coordinate] for all elements and their neighbors.
         * The basis is repeated in all directions to find whether the elements at the edges have bonds to neighbors cells
         * elements. Only elements with distance to edge less or equal than the maximum bond length are repeated as the other
         * elements can not have bond with the elements in repeated cells.
         * @param maxBondLength {Number}
         * @return {Array}
         */
        // TODO: move to made basis bonded
        getElementsAndCoordinatesArrayWithEdgeNeighbors(
            maxBondLength: number,
        ): ElementAndCoordinateAsArray[] {
            const elementsAndCoordinatesArray1 = this.basis.elementsAndCoordinatesArray;
            const planes = this.getCellPlanes(this.cell);

            const { cell } = this;
            const vecA = new THREE.Vector3(cell.ax, cell.ay, cell.az);
            const vecB = new THREE.Vector3(cell.bx, cell.by, cell.bz);
            const vecC = new THREE.Vector3(cell.cx, cell.cy, cell.cz);

            const result: ElementAndCoordinateAsArray[] = [...elementsAndCoordinatesArray1];

            elementsAndCoordinatesArray1.forEach(([element, coord]: [any, any]) => {
                const cartesianCoord = new THREE.Vector3(...(coord as [number, number, number]));

                let nearEdge = false;
                for (let i = 0; i < planes.length; i++) {
                    if (Math.abs(planes[i].distanceToPoint(cartesianCoord)) <= maxBondLength) {
                        nearEdge = true;
                        break;
                    }
                }

                if (nearEdge) {
                    [-1, 0, 1].forEach((shiftI) => {
                        [-1, 0, 1].forEach((shiftJ) => {
                            [-1, 0, 1].forEach((shiftK) => {
                                if (shiftI === 0 && shiftJ === 0 && shiftK === 0) return;

                                const shiftedCoord = cartesianCoord
                                    .clone()
                                    .addScaledVector(vecA, shiftI)
                                    .addScaledVector(vecB, shiftJ)
                                    .addScaledVector(vecC, shiftK);

                                result.push([
                                    element,
                                    [shiftedCoord.x, shiftedCoord.y, shiftedCoord.z],
                                ]);
                            });
                        });
                    });
                }
            });

            return result;
        }

        /**
         * Create the instanced mesh for all bonds, including repetitions.
         * k-d tree algorithm is used to optimize the time to find the element's neighbors.
         * See https://en.wikipedia.org/wiki/K-d_tree for more information.
         */
        createBondsGroup(): THREE.InstancedMesh | THREE.Group {
            const bondsData = this.getBondsDataForUniqueElementPairs();
            const maxBondLength = this.getMaxBondLength(bondsData);

            const elementsAndCoordinatesArray1 = this.basis.elementsAndCoordinatesArray;
            const elementsAndCoordinatesArray2 =
                this.getElementsAndCoordinatesArrayWithEdgeNeighbors(maxBondLength);

            const tree = createKDTree(
                elementsAndCoordinatesArray2.map(
                    ([element, coordinate]: ElementAndCoordinateAsArray) => coordinate,
                ),
            );

            const baseBondsData: any[] = [];

            elementsAndCoordinatesArray1.forEach(
                ([element1, coordinate1]: ElementAndCoordinateAsArray, index1: number) => {
                    // iterate over all elements in maxBondLength radius of this element. O(3n^(2/3))
                    tree.rnn(coordinate1, maxBondLength, (index2: number) => {
                        const [element2, coordinate2] = elementsAndCoordinatesArray2[index2];
                        if (
                            index2 === index1 ||
                            !this.areElementsBonded(
                                element1,
                                coordinate1,
                                element2,
                                coordinate2,
                                bondsData,
                            )
                        )
                            return;
                        const bondData = this.getBondData(
                            element1,
                            index1,
                            coordinate1,
                            element2,
                            index2,
                            coordinate2,
                        );
                        baseBondsData.push(bondData);
                    });
                },
            );

            return this.createInstancedMeshForBonds(baseBondsData);
        }

        /**
         * Creates an InstancedMesh containing all bonds, accounting for repetitions.
         */
        createInstancedMeshForBonds(baseBondsData: any[]): THREE.InstancedMesh | THREE.Group {
            const { coordinates: repetitionCoords } = this.getRepetitionInfo();
            const totalRepetitions = 1 + repetitionCoords.length;
            const totalInstances = baseBondsData.length * totalRepetitions;

            if (totalInstances === 0) {
                return new THREE.Group();
            }

            const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8, 1);
            geometry.translate(0, 0.5, 0); // shift so scaling operates from the base

            const material = new THREE.MeshBasicMaterial();
            const instancedMesh = new THREE.InstancedMesh(geometry, material, totalInstances);

            const matrix = new THREE.Matrix4();
            const colorObj = new THREE.Color();

            let instanceIndex = 0;
            const allShifts = [[0, 0, 0], ...repetitionCoords];

            allShifts.forEach((shiftArr) => {
                const shiftVec = new THREE.Vector3(...shiftArr);

                baseBondsData.forEach((bond) => {
                    const finalPos = bond.position.clone().add(shiftVec);
                    matrix.compose(finalPos, bond.quaternion, new THREE.Vector3(1, bond.height, 1));
                    instancedMesh.setMatrixAt(instanceIndex, matrix);
                    instancedMesh.setColorAt(instanceIndex, colorObj.set(bond.color));
                    instanceIndex += 1;
                });
            });

            instancedMesh.instanceMatrix.needsUpdate = true;
            if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

            return instancedMesh;
        }

        /**
         * Draw bonds. Bonds are created synchronously if the asynchronous callback (createBondsAsync) to draw bonds
         * in background has not returned yet. This may happen if the structure is large and draw bonds is toggled quickly.
         * We need this to block the UI until the bonds are drawn.
         */
        drawBonds(): void {
            this.createBondsAsync();
            if (!this.areBondsCreated) {
                this.bondsGroup = this.createBondsGroup();
                this.areBondsCreated = true;
            }
            this.structureGroup.add(this.bondsGroup);
        }

        /**
         * Returns bond data properties (position, quaternion, height, color).
         */
        getBondData(
            element1: string,
            index1: number,
            coordinate1: number[],
            element2: string,
            index2: number,
            coordinate2: number[],
        ) {
            const vector1 = new THREE.Vector3(...coordinate1);
            const vector2 = new THREE.Vector3(...coordinate2);
            const direction = new THREE.Vector3().subVectors(vector2, vector1);
            const height = direction.length() / 2;
            direction.normalize();
            // create quaternion to rotate the cylinder
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            return {
                position: vector1,
                quaternion,
                height,
                color: this.getAtomColorByElement(element1),
            };
        }
    };
