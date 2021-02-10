import {ELEMENT_VDW_RADII, ELEMENT_COLORS} from "@exabyte-io/periodic-table.js";

export default {
    // atoms
    // atoms.user-controllable
    atomRadiiScale: 0.2,
    repetitions: 1,
    chemicalConnectivityFactor: 1.05,
    // atoms.non-user-controllable
    defaultElement: "Si",
    sphereRadius: 1.5,
    sphereQuality: 16,
    elementColors: ELEMENT_COLORS,
    vdwRadii: ELEMENT_VDW_RADII,
    // line
    lineWidth: 2,
    lineMaterial: {
        dashSize: 1,
        gapSize: 2,
        scale: 2,
        linewidth: 2,
    },
    colors: {
        amber: 0xffc107,
        gray: 0x808080,
    },
    // general
    backgroundColor: "#202020",
    defaultColor: "#CCCCCC",
    labelColor: "rgb(255,255,255)",
    initialCameraPosition: [-50, 0, 10],

    boundaryConditionTypeColors: {
        "bc1": [0xffff00, 0xffff00],
        "bc2": [0x0000FF, 0x0000FF],
        "bc3": [0xffff00, 0x0000FF],
    }
}
