export declare const BOUNDARY_CONDITIONS: {
    type: string;
    name: string;
    isNonPeriodic: boolean;
}[];
export declare const ATOM_GROUP_NAME = "Atoms";
export declare const ATOM_CONNECTIONS_GROUP_NAME = "Atom_Connections";
export declare const ATOM_CONNECTION_LINE_NAME = "Atom_Connection";
export declare const MIN_ANGLE_POINTS_DISTANCE = 0.7;
export declare const MEASUREMENT_LABELS_GROUP_NAME = "Measure_Labels";
export declare const ANGLE = "ANGLE";
export declare const LABELS_GROUP_NAME = "Labels_Group";
export declare const ELEMENT_LABELS_GROUP_NAME = "Element_Labels_Group";
export declare const COORDINATE_LABELS_GROUP_NAME = "Coordinate_Labels_Group";
export declare const COLORS: {
    RED: number;
    GREEN: number;
    ORANGE: number;
    WHITE: number;
    BLACK: number;
};
export declare enum MEASUREMENT_MODES_ENUM {
    NONE = "none",
    DISTANCE = "distance",
    ANGLE = "angle",
    COORDINATE = "coordinate"
}
export declare const MEASUREMENT_MODES: {
    NONE: string;
    DISTANCE: string;
    ANGLE: string;
    COORDINATE: string;
};
export declare const LABEL_TYPES: {
    COORDINATE: string;
    ELEMENT: string;
    DISTANCE: string;
    COORDINATE_MEASUREMENT: string;
};
