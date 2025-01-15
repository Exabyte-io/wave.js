declare namespace _default {
    export const atomRadiiScale: number;
    export const repetitions: number;
    export const chemicalConnectivityFactor: number;
    export const defaultElement: string;
    export const sphereRadius: number;
    export const sphereQuality: number;
    export { ELEMENT_COLORS as elementColors };
    export { ELEMENT_VDW_RADII as vdwRadii };
    export const lineWidth: number;
    export namespace lineMaterial {
        const dashSize: number;
        const gapSize: number;
        const scale: number;
        const linewidth: number;
    }
    export namespace colors {
        const amber: number;
        const gray: number;
    }
    export const backgroundColor: string;
    export const defaultColor: string;
    export const initialCameraPosition: number[];
    export const areLabelsInitiallyShown: boolean;
    export const isViewAdjustable: boolean;
    export namespace labelsConfig {
        export const areSpritesUsed: boolean;
        export const fontFace: string;
        export const fontSize: number;
        export const fontWeight: string;
        export const fillStyle: string;
        export const strokeStyle: string;
        const lineWidth_1: number;
        export { lineWidth_1 as lineWidth };
        export const textAlign: string;
        export const textBaseline: string;
    }
    export namespace labelPointsConfig {
        const size: number;
        const depthTest: boolean;
        const depthFunc: any;
        const transparent: boolean;
    }
    export namespace labelSpriteConfig {
        const transparent_1: boolean;
        export { transparent_1 as transparent };
        const depthFunc_1: any;
        export { depthFunc_1 as depthFunc };
        const depthTest_1: boolean;
        export { depthTest_1 as depthTest };
    }
    export namespace boundaryConditionTypeColors {
        const bc1: number[];
        const bc2: number[];
        const bc3: number[];
    }
    export namespace hotKeysConfig {
        const toggleOrbitControls: string;
        const toggleInteractive: string;
        const toggleBonds: string;
        const toggleConventionalCell: string;
        const toggleLabels: string;
        const resetViewer: string;
        const toggleThreejsEditorModal: string;
        const toggleDistanceShown: string;
        const toggleAnglesShown: string;
        const deleteConnection: string;
    }
}
export default _default;
