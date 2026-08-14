// @ts-ignore // Types for this library are needed
import { ELEMENT_COLORS, PERIODIC_TABLE } from "@mat3ra/periodic-table";
import * as THREE from "three";

// @ts-ignore
declare module "@mat3ra/periodic-table" {
    interface Element {
        van_der_Waals_radius_pm: number;
    }
}

/**
 * Van der Waals radii in Angstrom, keyed by element symbol.
 *
 * Must stay a symbol-keyed object: `getAtomRadiusByElement` (mixins/atoms.ts) looks radii up
 * by element symbol, so building this with `Array.prototype.map` - which yields a positional
 * array indexed 0..117 - made every lookup return undefined and silently fall back to
 * `sphereRadius`, rendering every element at the same size.
 */
const vdwRadiiMapAngstrom: Record<string, number> = Object.fromEntries(
    Object.keys(PERIODIC_TABLE).map((elementSymbol) => [
        elementSymbol,
        PERIODIC_TABLE[elementSymbol].van_der_Waals_radius_pm / 100,
    ]),
);

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
    vdwRadii: vdwRadiiMapAngstrom,
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
    isViewAdjustable: true,
    labelsConfig: {
        areSpritesUsed: true,
        fontFace: "Arial",
        fontSize: 96,
        fontWeight: "Bold",
        scale: 1,
        scaleWidth: 0.5,
        scaleHeight: 0.5,
        textParameters: {
            fillStyle: "#EEEEEE",
            strokeStyle: "#454545",
            lineWidth: 2,
            textAlign: "center",
            textBaseline: "middle",
        },
    },
    elementLabelsConfig: {
        areSpritesUsed: true,
        fontFace: "Arial",
        fontSize: 96,
        fontWeight: "Bold",
        scale: 1,
        scaleWidth: 0.5,
        scaleHeight: 0.5,
        textParameters: {
            fillStyle: "#EEEEEE",
            strokeStyle: "#454545",
            lineWidth: 2,
            textAlign: "center",
            textBaseline: "middle",
        },
    },
    coordinateLabelsConfig: {
        areSpritesUsed: true,
        fontFace: "Arial",
        fontSize: 72,
        fontWeight: "Normal",
        scale: 1.5,
        scaleWidth: 2.5,
        scaleHeight: 0.25,
        offsetVector: [0, 0, 0.5],
        textParameters: {
            fillStyle: "#CCCCCC",
            strokeStyle: "#454545",
            lineWidth: 1,
            textAlign: "center",
            textBaseline: "middle",
        },
    },
    distanceLabelsConfig: {
        areSpritesUsed: true,
        fontFace: "Arial",
        fontSize: 72,
        fontWeight: "Normal",
        scale: 1.5,
        scaleWidth: 2.5,
        scaleHeight: 0.25,
        offsetVector: [0, 0, 0],
        textParameters: {
            fillStyle: "#CCCCCC",
            strokeStyle: "#454545",
            lineWidth: 1,
            textAlign: "center",
            textBaseline: "middle",
        },
    },
    angleLabelsConfig: {
        areSpritesUsed: true,
        fontFace: "Arial",
        fontSize: 72,
        fontWeight: "Normal",
        scale: 1.5,
        scaleWidth: 2.5,
        scaleHeight: 0.25,
        offsetVector: [0, 0, 0],
        textParameters: {
            fillStyle: "#CCCCCC",
            strokeStyle: "#454545",
            lineWidth: 1,
            textAlign: "center",
            textBaseline: "middle",
        },
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

    /**
     * Single-character keys, dispatched from a `keypress` handler. Every entry here appears in
     * the keyboard sheet automatically, so a rebind cannot leave a stale label behind - the
     * drift that produced defect D2, where a tooltip promised a hotkey that did not exist.
     */
    hotKeysConfig: {
        toggleKeyboardSheet: "?",
        toggleOrbitControls: "o",
        toggleInteractive: "i",
        toggleBonds: "b",
        toggleElementLabels: "e",
        toggleCoordinateLabels: "k",
        resetViewer: "r",
        toggleDistanceShown: "d",
        toggleAnglesShown: "a",
        toggleCopyCoordinatesShown: "c",
        deleteConnection: "x",
        toggleEditMode: "t",
        focusCameraOnSelection: "f",
    },

    /**
     * Editor keys that `keypress` never fires for - non-character keys and modifier combos - so
     * they are handled on `keydown` instead. They used to be hardcoded inside
     * ThreeDEditor.handleEditModeKeyDown, which meant the keyboard sheet had no way to know about
     * them and they appeared in no tooltip or menu at all. Declaring them here makes the handler
     * and the sheet read from one source.
     *
     * `usesModifier: true` means Ctrl on Windows/Linux and Cmd on macOS; `requiresShift` is
     * additive on top of it. `keys` lists every key that triggers the action.
     */
    editorKeysConfig: {
        undo: { keys: ["z"], usesModifier: true, requiresShift: false, label: "Undo" },
        redo: { keys: ["z"], usesModifier: true, requiresShift: true, label: "Redo" },
        removeSelected: {
            keys: ["Delete", "Backspace"],
            usesModifier: false,
            requiresShift: false,
            label: "Remove selected",
        },
        cancelOrDeselect: {
            keys: ["Escape"],
            usesModifier: false,
            requiresShift: false,
            label: "Cancel drag · deselect",
        },
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
