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
export const ATOM_CONNECTIONS_GROUP_NAME = "Atom_Connections";
export const ATOM_CONNECTION_LINE_NAME = "Atom_Connection";
export const MIN_ANGLE_POINTS_DISTANCE = 0.7;
export const MEASURE_LABELS_GROUP_NAME = "Measure_Labels";
export const ANGLE = "ANGLE";
export const LABELS_GROUP_NAME = "Labels_Group";

export const COLORS = {
    RED: 0xff0000,
    GREEN: 0x00ff00,
};
