// const units = {
//     bohr: "bohr",
//     angstrom: "angstrom",
//     degree: "degree",
//     radian: "radian",
//     alat: "alat",
// };

// const ATOMIC_COORD_UNITS = {
//     crystal: "crystal",
//     cartesian: "cartesian",
// };

// const LATTICE_TYPE = {
//     CUB: "CUB",
//     FCC: "FCC",
//     BCC: "BCC",
//     TET: "TET",
//     BCT: "BCT",
//     ORC: "ORC",
//     ORCF: "ORCF",
//     ORCI: "ORCI",
//     ORCC: "ORCC",
//     HEX: "HEX",
//     RHL: "RHL",
//     MCL: "MCL",
//     MCLC: "MCLC",
//     TRI: "TRI",
// };

export const materialConfig = {
    lattice: {
        a: 10.6068,
        b: 10.9713,
        c: 11.1312,
        alpha: 90,
        beta: 90,
        gamma: 90,
        units: {
            length: "angstrom",
            angle: "degree",
        },
        type: "TRI",
        vectors: {
            a: [10.6068, 0, 0],
            b: [0, 10.9713, 0],
            c: [0, 0, 11.1312],
            alat: 1,
            units: "angstrom",
        },
    },
    basis: {
        elements: [
            {
                id: 0,
                value: "H",
            },
            {
                id: 1,
                value: "H",
            },
            {
                id: 2,
                value: "O",
            },
        ],
        coordinates: [
            {
                id: 0,
                value: [0.5024513, 0.4557345, 0.4491879],
            },
            {
                id: 1,
                value: [0.4713957, 0.5442655, 0.5508121],
            },
            {
                id: 2,
                value: [0.5286043, 0.4789223, 0.5294038],
            },
        ],
        units: "crystal",
        cell: [
            [10.6068, 0, 6.494791834598073e-16],
            [1.7643196026397283e-15, 10.9713, 6.717983713742678e-16],
            [0, 0, 11.1312],
        ],
        constraints: [],
    },
    name: "H2O (clone)",
    isNonPeriodic: true,
    _id: "7BxADDRbd6ujx2iHP",
    metadata: {
        tags: [],
        inSet: [
            {
                _id: "nQtFH6EKKxYJFY98d",
                slug: "read",
                cls: "Team",
            },
            {
                _id: "t3FSpkyRsYSTF3XCJ",
                slug: "admin",
                cls: "Team",
            },
            {
                _id: "ZmPD6kF4bmcJBCRuq",
                slug: "owner",
                cls: "Team",
            },
            {
                _id: "jG8W6qGaacXtnb8Qd",
                slug: "read",
                cls: "Team",
            },
            {
                _id: "HcJzkQjEASdZhEM9s",
                slug: "comment",
                cls: "Team",
            },
            {
                _id: "mo29ZQzpfGZkuf9nD",
                slug: "execute",
                cls: "Team",
            },
            {
                _id: "EJoQRHQPdbsc4hmFJ",
                slug: "edit",
                cls: "Team",
            },
        ],
        boundaryConditions: {
            type: "bc1",
            offset: 1,
        },
    },
};
