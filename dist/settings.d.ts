declare namespace _default {
    export let atomRadiiScale: number;
    export let repetitions: number;
    export let chemicalConnectivityFactor: number;
    export let defaultElement: string;
    export let sphereRadius: number;
    export let sphereQuality: number;
    export { ELEMENT_COLORS as elementColors };
    export { ELEMENT_VDW_RADII as vdwRadii };
    export let lineWidth: number;
    export namespace lineMaterial {
        let dashSize: number;
        let gapSize: number;
        let scale: number;
        let linewidth: number;
    }
    export namespace colors {
        let amber: number;
        let gray: number;
    }
    export let backgroundColor: string;
    export let defaultColor: string;
    export let initialCameraPosition: number[];
    export let areElementLabelsInitiallyShown: boolean;
    export let isViewAdjustable: boolean;
    export namespace labelsConfig {
        export let areSpritesUsed: boolean;
        export let fontFace: string;
        export let fontSize: number;
        export let fontWeight: string;
        export let fillStyle: string;
        export let strokeStyle: string;
        let lineWidth_1: number;
        export { lineWidth_1 as lineWidth };
        export let textAlign: string;
        export let textBaseline: string;
    }
    export namespace labelPointsConfig {
        let size: number;
        let depthTest: boolean;
        let depthFunc: any;
        let transparent: boolean;
    }
    export namespace labelSpriteConfig {
        let transparent_1: boolean;
        export { transparent_1 as transparent };
        let depthFunc_1: any;
        export { depthFunc_1 as depthFunc };
        let depthTest_1: boolean;
        export { depthTest_1 as depthTest };
    }
    export namespace boundaryConditionTypeColors {
        let bc1: number[];
        let bc2: number[];
        let bc3: number[];
    }
    export namespace hotKeysConfig {
        let toggleOrbitControls: string;
        let toggleInteractive: string;
        let toggleBonds: string;
        let toggleConventionalCell: string;
        let toggleElementLabels: string;
        let resetViewer: string;
        let toggleThreejsEditorModal: string;
        let toggleDistanceShown: string;
        let toggleAnglesShown: string;
        let deleteConnection: string;
    }
}
export default _default;
