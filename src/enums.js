export const BOUNDARY_CONDITIONS = [
    {
        type: "pbc",
        name: "Periodic Boundary Condition (pbc)",
        isNonPeriodic: false,
    },
    {
        type: "bc1",
        name: "Vacuum-Slab-Vacuum (bc1)",
        isNonPeriodic: true,
    },
    {
        type: "bc2",
        name: "Metal-Slab-Metal (bc2)",
        isNonPeriodic: true,
    },
    {
        type: "bc3",
        name: "Vacuum-Slab-Metal (bc3)",
        isNonPeriodic: true,
    },
];

export const ATOM_GROUP_NAME = "Atoms";
