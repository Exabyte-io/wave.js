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
export const MEASUREMENT_LABELS_GROUP_NAME = "Measure_Labels";
export const ANGLE = "ANGLE";
export const LABELS_GROUP_NAME = "Labels_Group";
export const ELEMENT_LABELS_GROUP_NAME = "Element_Labels_Group";
export const COORDINATE_LABELS_GROUP_NAME = "Coordinate_Labels_Group";

export const COLORS = {
    RED: 0xff0000,
    GREEN: 0x00ff00,
    ORANGE: 0xffa500,
    WHITE: 0xffffff,
    BLACK: 0x000000,
};

export enum MEASUREMENT_MODES_ENUM {
    NONE = "none",
    DISTANCE = "distance",
    ANGLE = "angle",
    COORDINATE = "coordinate",
}

export const MEASUREMENT_MODES = {
    NONE: "none",
    DISTANCE: "distance",
    ANGLE: "angle",
    COORDINATE: "coordinate",
};

export const LABEL_TYPES = {
    COORDINATE: "coordinate",
    ELEMENT: "element",
    DISTANCE: "distance",
    COORDINATE_MEASUREMENT: "coordinateMeasurement",
};
