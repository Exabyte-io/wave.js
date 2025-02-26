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
    export let roundPrecision: number;
    export let areElementLabelsInitiallyShown: boolean;
    export let areCoordinateLabelsInitiallyShown: boolean;
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
    export namespace elementLabelsConfig {
        let areSpritesUsed_1: boolean;
        export { areSpritesUsed_1 as areSpritesUsed };
        let fontFace_1: string;
        export { fontFace_1 as fontFace };
        let fontSize_1: number;
        export { fontSize_1 as fontSize };
        let fontWeight_1: string;
        export { fontWeight_1 as fontWeight };
        let fillStyle_1: string;
        export { fillStyle_1 as fillStyle };
        let strokeStyle_1: string;
        export { strokeStyle_1 as strokeStyle };
        let lineWidth_2: number;
        export { lineWidth_2 as lineWidth };
        let textAlign_1: string;
        export { textAlign_1 as textAlign };
        let textBaseline_1: string;
        export { textBaseline_1 as textBaseline };
        let scale_1: number;
        export { scale_1 as scale };
        export let scaleWidth: number;
        export let scaleHeight: number;
    }
    export namespace coordinateLabelsConfig {
        let areSpritesUsed_2: boolean;
        export { areSpritesUsed_2 as areSpritesUsed };
        let fontFace_2: string;
        export { fontFace_2 as fontFace };
        let fontSize_2: number;
        export { fontSize_2 as fontSize };
        let fontWeight_2: string;
        export { fontWeight_2 as fontWeight };
        let fillStyle_2: string;
        export { fillStyle_2 as fillStyle };
        let strokeStyle_2: string;
        export { strokeStyle_2 as strokeStyle };
        let lineWidth_3: number;
        export { lineWidth_3 as lineWidth };
        let textAlign_2: string;
        export { textAlign_2 as textAlign };
        let textBaseline_2: string;
        export { textBaseline_2 as textBaseline };
        let scale_2: number;
        export { scale_2 as scale };
        let scaleWidth_1: number;
        export { scaleWidth_1 as scaleWidth };
        let scaleHeight_1: number;
        export { scaleHeight_1 as scaleHeight };
        export let offsetVector: number[];
    }
    export namespace labelPointsConfig {
        let size: number;
        let depthTest: boolean;
        let depthFunc: 7;
        let transparent: boolean;
    }
    export namespace labelSpriteConfig {
        let transparent_1: boolean;
        export { transparent_1 as transparent };
        let depthFunc_1: 3;
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
        let toggleElementLabels: string;
        let toggleCoordinateLabels: string;
        let resetViewer: string;
        let toggleDistanceShown: string;
        let toggleAnglesShown: string;
        let toggleCopyCoordinatesShown: string;
        let deleteConnection: string;
    }
    export namespace measurementLabelsConfig {
        let areSpritesUsed_3: boolean;
        export { areSpritesUsed_3 as areSpritesUsed };
        let fontFace_3: string;
        export { fontFace_3 as fontFace };
        let fontSize_3: number;
        export { fontSize_3 as fontSize };
        let fontWeight_3: string;
        export { fontWeight_3 as fontWeight };
        let fillStyle_3: string;
        export { fillStyle_3 as fillStyle };
        let strokeStyle_3: string;
        export { strokeStyle_3 as strokeStyle };
        let lineWidth_4: number;
        export { lineWidth_4 as lineWidth };
        let textAlign_3: string;
        export { textAlign_3 as textAlign };
        let textBaseline_3: string;
        export { textBaseline_3 as textBaseline };
        let scaleWidth_2: number;
        export { scaleWidth_2 as scaleWidth };
        let scaleHeight_2: number;
        export { scaleHeight_2 as scaleHeight };
    }
}
export default _default;
