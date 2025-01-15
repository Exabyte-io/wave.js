export function BondsMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        isDrawBondsEnabled: boolean;
        /**
         * Draw bonds. Bonds are created synchronously if the asynchronous callback (createBondsAsync) to draw bonds
         * in background has not returned yet. This may happen if the structure is large and draw bonds is toggled quickly.
         * We need this to block the UI until the bonds are drawn.
         */
        drawBonds(): void;
        /**
         * Creates bond asynchronously as bonds creation takes time for large structures.
         */
        createBondsAsync(): void;
        areBondsCreated: boolean | undefined;
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
        areElementsBonded(element1: string, coordinate1: any[], element2: string, coordinate2: any[], bondsData: any[]): boolean;
        /**
         * Returns bonds data for unique element pairs. This is to avoid calling getElementsBondsData for all elements
         * combinations as it is required to repeat the cell in all directions to determine the bonds.
         * @returns {Array} an array of bond data entries for unique element pairs inside structure.
         */
        getBondsDataForUniqueElementPairs(): any[];
        /**
         * Returns the maximum bond length in the structure.
         * @param bondsData {Array} an array of bond data entries for unique element pairs inside structure.
         * @returns {Number}
         */
        getMaxBondLength(bondsData: any[]): number;
        /**
         * Returns an array of [element, coordinate] for all elements and their neighbors.
         * The basis is repeated in all directions to find whether the elements at the edges have bonds to neighbors cells
         * elements. Only elements with distance to edge less or equal than the maximum bond length are repeated as the other
         * elements can not have bond with the elements in repeated cells.
         * @param maxBondLength {Number}
         * @return {Array}
         */
        getElementsAndCoordinatesArrayWithEdgeNeighbors(maxBondLength: number): any[];
        /**
         * Create the half bond objects between elements.
         * k-d tree algorithm is used to optimize the time to find the element's neighbors.
         * See https://en.wikipedia.org/wiki/K-d_tree for more information.
         */
        createBondsGroup(): any;
        bondsGroup: any;
        /**
         * Returns a bond as cylinder geometry object.
         * @return {THREE.Mesh}
         */
        getBondObject(element1: any, index1: any, coordinate1: any, element2: any, index2: any, coordinate2: any): THREE.Mesh;
    };
    [x: string]: any;
};
