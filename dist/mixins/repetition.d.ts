export function RepetitionMixin(superclass: any): {
    new (): {
        [x: string]: any;
        /**
         * Returns an array of coordinates (lattice points) to repeat the 3D objects bases on the number of repetitions.
         * The method should get the maximum number of repetitions in one of the vectors (numberOfRepetitions)
         */
        repetitionCoordinates(numberOfRepetitions: any): import("@mat3ra/made/dist/js/basis/types").Coordinate[];
        /**
         * The method receives coordinates in the form of a cube (NxNxN) and repetitions we want to display
         * Returns a new array based on the received data
         */
        coordinatesByAxes(coordinates: any, repetitions: any): any;
        /**
         * Gets repetition information including coordinates and dimensions.
         * Used by both object and atom repetition functions.
         */
        getRepetitionInfo(): {
            coordinates: any;
            originalRepetitions: {
                repetitionsAlongLatticeVectorA: any;
                repetitionsAlongLatticeVectorB: any;
                repetitionsAlongLatticeVectorC: any;
            };
            dimensions: {
                dimA: any;
                dimB: any;
                dimC: any;
            };
        };
        /**
         * Repeats a given 3D object at the lattice points given by repetitionCoordinates function.
         */
        repeatObject3DAtRepetitionCoordinates(object3D: any): void;
        /**
         * Repeats a given 3D atom at the lattice points given by repetitionCoordinates function.
         * This function was added because previous one function for repeating atoms is not correct for the atoms
         * with measurement functionality.
         */
        repeatAtomsAtRepetitionCoordinates(object3D: any): void;
        /**
         * Creates a cloned atom with a unique atomic index based on its position in the repetition grid
         */
        createClonedAtomWithUniqueIndex(originalAtom: any, gridPosition: any, dimensions: any, originalAtomCount: any, point: any): any;
    };
    [x: string]: any;
};
