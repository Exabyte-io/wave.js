import { ELEMENT_COLORS, ELEMENT_VDW_RADII } from "@exabyte-io/periodic-table.js";
import * as THREE from "three";

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
    initialCameraPosition: [-50, 0, 10],

    // labels
    roundPrecision: 3,
    areElementLabelsInitiallyShown: false,
    areCoordinateLabelsInitiallyShown: false,
    isViewAdjustable: true,
    labelsConfig: {
        areSpritesUsed: true,
        fontFace: "Arial",
        fontSize: 96,
        fontWeight: "Bold",
        fillStyle: "#EEEEEE",
        strokeStyle: "#454545",
        lineWidth: 2,
        textAlign: "center",
        textBaseline: "middle",
    },
    elementLabelsConfig: {
        areSpritesUsed: true,
        fontFace: "Arial",
        fontSize: 96,
        fontWeight: "Bold",
        fillStyle: "#EEEEEE",
        strokeStyle: "#454545",
        lineWidth: 2,
        textAlign: "center",
        textBaseline: "middle",
        scale: 1,
        scaleWidth: 0.5,
        scaleHeight: 0.5,
    },
    coordinateLabelsConfig: {
        areSpritesUsed: true,
        fontFace: "Arial",
        fontSize: 72,
        fontWeight: "Normal",
        fillStyle: "#CCCCCC",
        strokeStyle: "#454545",
        lineWidth: 1,
        textAlign: "center",
        textBaseline: "middle",
        scale: 1.5,
        scaleWidth: 2.5,
        scaleHeight: 0.25,
    },
    labelPointsConfig: {
        size: 1.5,
        depthTest: true,
        depthFunc: THREE.NotEqualDepth,
        transparent: true,
    },
    labelSpriteConfig: {
        transparent: true,
        depthFunc: THREE.LessEqualDepth,
        depthTest: true,
    },
    boundaryConditionTypeColors: {
        bc1: [0xffff00, 0xffff00],
        bc2: [0x0000ff, 0x0000ff],
        bc3: [0xffff00, 0x0000ff],
    },

    hotKeysConfig: {
        toggleOrbitControls: "o",
        toggleInteractive: "i",
        toggleBonds: "b",
        toggleConventionalCell: "c",
        toggleElementLabels: "e",
        toggleCoordinateLabels: "k",
        resetViewer: "r",
        toggleDistanceShown: "d",
        toggleAnglesShown: "a",
        deleteConnection: "x",
    },

    measurementLabelsConfig: {
        areSpritesUsed: true,
        fontFace: "Arial",
        fontSize: 72,
        fontWeight: "Normal",
        fillStyle: "#CCCCCC",
        strokeStyle: "#454545",
        lineWidth: 1,
        textAlign: "center",
        textBaseline: "middle",
        scaleWidth: 1.5,
        scaleHeight: 0.4,
    },
};
