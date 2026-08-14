import * as THREE from "three";
declare module "@mat3ra/periodic-table" {
    interface Element {
        van_der_Waals_radius_pm: number;
    }
}
declare const _default: {
    atomRadiiScale: number;
    repetitions: number;
    chemicalConnectivityFactor: number;
    defaultElement: string;
    sphereRadius: number;
    sphereQuality: number;
    elementColors: any;
    vdwRadii: Record<string, number>;
    lineWidth: number;
    lineMaterial: {
        dashSize: number;
        gapSize: number;
        scale: number;
        linewidth: number;
    };
    colors: {
        amber: number;
        gray: number;
    };
    backgroundColor: string;
    defaultColor: string;
    initialCameraPosition: number[];
    roundPrecision: number;
    isViewAdjustable: boolean;
    labelsConfig: {
        areSpritesUsed: boolean;
        fontFace: string;
        fontSize: number;
        fontWeight: string;
        scale: number;
        scaleWidth: number;
        scaleHeight: number;
        textParameters: {
            fillStyle: string;
            strokeStyle: string;
            lineWidth: number;
            textAlign: string;
            textBaseline: string;
        };
    };
    elementLabelsConfig: {
        areSpritesUsed: boolean;
        fontFace: string;
        fontSize: number;
        fontWeight: string;
        scale: number;
        scaleWidth: number;
        scaleHeight: number;
        textParameters: {
            fillStyle: string;
            strokeStyle: string;
            lineWidth: number;
            textAlign: string;
            textBaseline: string;
        };
    };
    coordinateLabelsConfig: {
        areSpritesUsed: boolean;
        fontFace: string;
        fontSize: number;
        fontWeight: string;
        scale: number;
        scaleWidth: number;
        scaleHeight: number;
        offsetVector: number[];
        textParameters: {
            fillStyle: string;
            strokeStyle: string;
            lineWidth: number;
            textAlign: string;
            textBaseline: string;
        };
    };
    distanceLabelsConfig: {
        areSpritesUsed: boolean;
        fontFace: string;
        fontSize: number;
        fontWeight: string;
        scale: number;
        scaleWidth: number;
        scaleHeight: number;
        offsetVector: number[];
        textParameters: {
            fillStyle: string;
            strokeStyle: string;
            lineWidth: number;
            textAlign: string;
            textBaseline: string;
        };
    };
    angleLabelsConfig: {
        areSpritesUsed: boolean;
        fontFace: string;
        fontSize: number;
        fontWeight: string;
        scale: number;
        scaleWidth: number;
        scaleHeight: number;
        offsetVector: number[];
        textParameters: {
            fillStyle: string;
            strokeStyle: string;
            lineWidth: number;
            textAlign: string;
            textBaseline: string;
        };
    };
    labelPointsConfig: {
        size: number;
        depthTest: boolean;
        depthFunc: THREE.DepthModes;
        transparent: boolean;
    };
    labelSpriteConfig: {
        transparent: boolean;
        depthFunc: THREE.DepthModes;
        depthTest: boolean;
    };
    boundaryConditionTypeColors: {
        bc1: number[];
        bc2: number[];
        bc3: number[];
    };
    /**
     * Single-character keys, dispatched from a `keypress` handler. Every entry here appears in
     * the keyboard sheet automatically, so a rebind cannot leave a stale label behind - the
     * drift that produced defect D2, where a tooltip promised a hotkey that did not exist.
     */
    hotKeysConfig: {
        toggleKeyboardSheet: string;
        toggleOrbitControls: string;
        toggleInteractive: string;
        toggleBonds: string;
        toggleElementLabels: string;
        toggleCoordinateLabels: string;
        resetViewer: string;
        toggleDistanceShown: string;
        toggleAnglesShown: string;
        toggleCopyCoordinatesShown: string;
        deleteConnection: string;
        toggleEditMode: string;
        focusCameraOnSelection: string;
    };
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
        undo: {
            keys: string[];
            usesModifier: boolean;
            requiresShift: boolean;
            label: string;
        };
        redo: {
            keys: string[];
            usesModifier: boolean;
            requiresShift: boolean;
            label: string;
        };
        removeSelected: {
            keys: string[];
            usesModifier: boolean;
            requiresShift: boolean;
            label: string;
        };
        cancelOrDeselect: {
            keys: string[];
            usesModifier: boolean;
            requiresShift: boolean;
            label: string;
        };
    };
    measurementLabelsConfig: {
        areSpritesUsed: boolean;
        fontFace: string;
        fontSize: number;
        fontWeight: string;
        fillStyle: string;
        strokeStyle: string;
        lineWidth: number;
        textAlign: string;
        textBaseline: string;
        scaleWidth: number;
        scaleHeight: number;
    };
};
export default _default;
