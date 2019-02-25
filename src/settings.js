import {ELEMENT_VDW_RADII, ELEMENT_COLORS} from "periodic-table";

export default {
    // atoms
    // atoms.user-controllable
    atomRadiiScale: 0.2,
    atomRepetitions: 1,
    // atoms.non-user-controllable
    defaultElement: "Si",
    sphereRadius: 1.5,
    sphereQuality: 16,
    elementColors: ELEMENT_COLORS,
    vdwRadii: ELEMENT_VDW_RADII,
    // line
    lineWidth: 1.5,
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
}
