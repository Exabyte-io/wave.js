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
    hotKeysConfig: {
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
