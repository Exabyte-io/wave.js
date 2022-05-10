const units = {
    bohr: "bohr",
    angstrom: "angstrom",
    degree: "degree",
    radian: "radian",
    alat: "alat",
};

const ATOMIC_COORD_UNITS = {
    crystal: "crystal",
    cartesian: "cartesian",
};

const LATTICE_TYPE = {
    CUB: "CUB",
    FCC: "FCC",
    BCC: "BCC",
    TET: "TET",
    BCT: "BCT",
    ORC: "ORC",
    ORCF: "ORCF",
    ORCI: "ORCI",
    ORCC: "ORCC",
    HEX: "HEX",
    RHL: "RHL",
    MCL: "MCL",
    MCLC: "MCLC",
    TRI: "TRI",
};

export const materialConfig = {
    name: "LaAg(PO3)4",
    basis: {
        elements: [
            {
                id: 1,
                value: "La",
            },
            {
                id: 2,
                value: "La",
            },
            {
                id: 3,
                value: "La",
            },
            {
                id: 4,
                value: "La",
            },
            {
                id: 5,
                value: "Ag",
            },
            {
                id: 6,
                value: "Ag",
            },
            {
                id: 7,
                value: "Ag",
            },
            {
                id: 8,
                value: "Ag",
            },
            {
                id: 9,
                value: "P",
            },
            {
                id: 10,
                value: "P",
            },
            {
                id: 11,
                value: "P",
            },
            {
                id: 12,
                value: "P",
            },
            {
                id: 13,
                value: "P",
            },
            {
                id: 14,
                value: "P",
            },
            {
                id: 15,
                value: "P",
            },
            {
                id: 16,
                value: "P",
            },
            {
                id: 17,
                value: "P",
            },
            {
                id: 18,
                value: "P",
            },
            {
                id: 19,
                value: "P",
            },
            {
                id: 20,
                value: "P",
            },
            {
                id: 21,
                value: "P",
            },
            {
                id: 22,
                value: "P",
            },
            {
                id: 23,
                value: "P",
            },
            {
                id: 24,
                value: "P",
            },
            {
                id: 25,
                value: "O",
            },
            {
                id: 26,
                value: "O",
            },
            {
                id: 27,
                value: "O",
            },
            {
                id: 28,
                value: "O",
            },
            {
                id: 29,
                value: "O",
            },
            {
                id: 30,
                value: "O",
            },
            {
                id: 31,
                value: "O",
            },
            {
                id: 32,
                value: "O",
            },
            {
                id: 33,
                value: "O",
            },
            {
                id: 34,
                value: "O",
            },
            {
                id: 35,
                value: "O",
            },
            {
                id: 36,
                value: "O",
            },
            {
                id: 37,
                value: "O",
            },
            {
                id: 38,
                value: "O",
            },
            {
                id: 39,
                value: "O",
            },
            {
                id: 40,
                value: "O",
            },
            {
                id: 41,
                value: "O",
            },
            {
                id: 42,
                value: "O",
            },
            {
                id: 43,
                value: "O",
            },
            {
                id: 44,
                value: "O",
            },
            {
                id: 45,
                value: "O",
            },
            {
                id: 46,
                value: "O",
            },
            {
                id: 47,
                value: "O",
            },
            {
                id: 48,
                value: "O",
            },
            {
                id: 49,
                value: "O",
            },
            {
                id: 50,
                value: "O",
            },
            {
                id: 51,
                value: "O",
            },
            {
                id: 52,
                value: "O",
            },
            {
                id: 53,
                value: "O",
            },
            {
                id: 54,
                value: "O",
            },
            {
                id: 55,
                value: "O",
            },
            {
                id: 56,
                value: "O",
            },
            {
                id: 57,
                value: "O",
            },
            {
                id: 58,
                value: "O",
            },
            {
                id: 59,
                value: "O",
            },
            {
                id: 60,
                value: "O",
            },
            {
                id: 61,
                value: "O",
            },
            {
                id: 62,
                value: "O",
            },
            {
                id: 63,
                value: "O",
            },
            {
                id: 64,
                value: "O",
            },
            {
                id: 65,
                value: "O",
            },
            {
                id: 66,
                value: "O",
            },
            {
                id: 67,
                value: "O",
            },
            {
                id: 68,
                value: "O",
            },
            {
                id: 69,
                value: "O",
            },
            {
                id: 70,
                value: "O",
            },
            {
                id: 71,
                value: "O",
            },
            {
                id: 72,
                value: "O",
            },
        ],
        coordinates: [
            {
                id: 1,
                value: [0.463822, 0.282921, 0.477068],
            },
            {
                id: 2,
                value: [0.463822, 0.217079, 0.977068],
            },
            {
                id: 3,
                value: [0.536178, 0.782921, 0.022932],
            },
            {
                id: 4,
                value: [0.536178, 0.717079, 0.522932],
            },
            {
                id: 5,
                value: [0.932122, 0.722079, 0.432573],
            },
            {
                id: 6,
                value: [0.932122, 0.777921, 0.932573],
            },
            {
                id: 7,
                value: [0.067878, 0.277921, 0.567427],
            },
            {
                id: 8,
                value: [0.067878, 0.222079, 0.067427],
            },
            {
                id: 9,
                value: [0.882048, 0.11323, 0.762573],
            },
            {
                id: 10,
                value: [0.117952, 0.88677, 0.237427],
            },
            {
                id: 11,
                value: [0.007576, 0.901859, 0.754234],
            },
            {
                id: 12,
                value: [0.992424, 0.401859, 0.745766],
            },
            {
                id: 13,
                value: [0.117952, 0.61323, 0.737427],
            },
            {
                id: 14,
                value: [0.432126, 0.411238, 0.198562],
            },
            {
                id: 15,
                value: [0.662249, 0.125946, 0.306028],
            },
            {
                id: 16,
                value: [0.432126, 0.088762, 0.698562],
            },
            {
                id: 17,
                value: [0.007576, 0.598141, 0.254234],
            },
            {
                id: 18,
                value: [0.662249, 0.374054, 0.806028],
            },
            {
                id: 19,
                value: [0.337751, 0.874054, 0.693972],
            },
            {
                id: 20,
                value: [0.337751, 0.625946, 0.193972],
            },
            {
                id: 21,
                value: [0.567874, 0.588762, 0.801438],
            },
            {
                id: 22,
                value: [0.882048, 0.38677, 0.262573],
            },
            {
                id: 23,
                value: [0.567874, 0.911238, 0.301438],
            },
            {
                id: 24,
                value: [0.992424, 0.098141, 0.245766],
            },
            {
                id: 25,
                value: [0.808083, 0.103722, 0.10097],
            },
            {
                id: 26,
                value: [0.193613, 0.163698, 0.296717],
            },
            {
                id: 27,
                value: [0.904508, 0.380743, 0.834348],
            },
            {
                id: 28,
                value: [0.630018, 0.608712, 0.709049],
            },
            {
                id: 29,
                value: [0.652264, 0.841254, 0.415259],
            },
            {
                id: 30,
                value: [0.369982, 0.391288, 0.290951],
            },
            {
                id: 31,
                value: [0.191917, 0.603722, 0.39903],
            },
            {
                id: 32,
                value: [0.352946, 0.521603, 0.135538],
            },
            {
                id: 33,
                value: [0.806387, 0.836302, 0.703283],
            },
            {
                id: 34,
                value: [0.700173, 0.078476, 0.78669],
            },
            {
                id: 35,
                value: [0.078721, 0.985838, 0.292693],
            },
            {
                id: 36,
                value: [0.318625, 0.706766, 0.104587],
            },
            {
                id: 37,
                value: [0.088941, 0.358706, 0.394838],
            },
            {
                id: 38,
                value: [0.299827, 0.921524, 0.21331],
            },
            {
                id: 39,
                value: [0.516278, 0.867103, 0.838955],
            },
            {
                id: 40,
                value: [0.078721, 0.514162, 0.792693],
            },
            {
                id: 41,
                value: [0.921279, 0.014162, 0.707307],
            },
            {
                id: 42,
                value: [0.647054, 0.478397, 0.864462],
            },
            {
                id: 43,
                value: [0.483722, 0.132897, 0.161045],
            },
            {
                id: 44,
                value: [0.784291, 0.311527, 0.154166],
            },
            {
                id: 45,
                value: [0.516278, 0.632897, 0.338955],
            },
            {
                id: 46,
                value: [0.647054, 0.021603, 0.364462],
            },
            {
                id: 47,
                value: [0.806387, 0.663698, 0.203283],
            },
            {
                id: 48,
                value: [0.318625, 0.793234, 0.604587],
            },
            {
                id: 49,
                value: [0.215709, 0.811527, 0.345834],
            },
            {
                id: 50,
                value: [0.784291, 0.188473, 0.654166],
            },
            {
                id: 51,
                value: [0.681375, 0.293234, 0.895413],
            },
            {
                id: 52,
                value: [0.911059, 0.858706, 0.105162],
            },
            {
                id: 53,
                value: [0.652264, 0.658746, 0.915259],
            },
            {
                id: 54,
                value: [0.808083, 0.396278, 0.60097],
            },
            {
                id: 55,
                value: [0.483722, 0.367103, 0.661045],
            },
            {
                id: 56,
                value: [0.630018, 0.891288, 0.209049],
            },
            {
                id: 57,
                value: [0.352946, 0.978397, 0.635538],
            },
            {
                id: 58,
                value: [0.088941, 0.141294, 0.894838],
            },
            {
                id: 59,
                value: [0.215709, 0.688473, 0.845834],
            },
            {
                id: 60,
                value: [0.347736, 0.341254, 0.084741],
            },
            {
                id: 61,
                value: [0.700173, 0.421524, 0.28669],
            },
            {
                id: 62,
                value: [0.347736, 0.158746, 0.584741],
            },
            {
                id: 63,
                value: [0.911059, 0.641294, 0.605162],
            },
            {
                id: 64,
                value: [0.193613, 0.336302, 0.796717],
            },
            {
                id: 65,
                value: [0.095492, 0.619257, 0.165652],
            },
            {
                id: 66,
                value: [0.191917, 0.896278, 0.89903],
            },
            {
                id: 67,
                value: [0.921279, 0.485838, 0.207307],
            },
            {
                id: 68,
                value: [0.095492, 0.880743, 0.665652],
            },
            {
                id: 69,
                value: [0.681375, 0.206766, 0.395413],
            },
            {
                id: 70,
                value: [0.369982, 0.108712, 0.790951],
            },
            {
                id: 71,
                value: [0.904508, 0.119257, 0.334348],
            },
            {
                id: 72,
                value: [0.299827, 0.578476, 0.71331],
            },
        ],
        units: ATOMIC_COORD_UNITS.crystal,
    },
    lattice: {
        // Primitive cell for Diamond FCC Silicon at ambient conditions
        type: LATTICE_TYPE.MCL,
        a: 7.3,
        b: 13.211,
        c: 80.079,
        alpha: 90,
        beta: 90.47,
        gamma: 90,
        units: {
            length: units.angstrom,
            angle: units.degree,
        },
    },
    vectors: {
        a: [7.299754, 0, -0.05988158],
        b: [0, 13.211, 0],
        c: [0, 0, 80.079],
        alat: 1,
        units: "angstrom",
    },
    boundaryConditions: {
        type: "bc1",
        offset: 0,
    },
};
