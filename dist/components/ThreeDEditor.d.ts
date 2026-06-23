/**
 * Wrapper component containing 3D visualization through `WaveComponent` and the associated controls
 */
export class ThreeDEditor extends React.Component<any, any, any> {
    /**
     * Create a ThreeDEditor component
     * @param props Properties as explained below
     */
    constructor(props: any);
    state: {
        isInteractive: boolean;
        activeToolbarMenu: null;
        isThreejsEditorModalShown: boolean;
        measurementsSettings: {
            isActive: boolean;
            measurementType: string;
            values: never[];
        }[];
        viewerTriggerResize: boolean;
        viewerSettings: {
            isViewAdjustable: any;
            atomRadiiScale: any;
            repetitionsAlongLatticeVectorA: any;
            repetitionsAlongLatticeVectorB: any;
            repetitionsAlongLatticeVectorC: any;
            chemicalConnectivityFactor: any;
        };
        _initialToggleSettings: {
            orthographicCamera: any;
            bonds: any;
            axes: any;
            autoRotate: any;
            elementLabels: any;
            coordinateLabels: any;
        };
        boundaryConditions: any;
        isConventionalCellShown: any;
        originalMaterial: any;
        material: any;
    };
    handleCellRepetitionsChange(e: any): void;
    handleSphereRadiusChange(e: any): void;
    handleDownloadClick(format?: string): void;
    handleToggleInteractive(): void;
    handleToggleToolbarMenu(toolbarMenuName: any): void;
    handleToggleBonds(): void;
    toggleThreejsEditorModal(): void;
    handleToggleOrthographicCamera(): void;
    handleToggleElementLabels(): void;
    handleToggleCoordinateLabels(): void;
    handleToggleConventionalCell(): void;
    handleToggleIsViewAdjustable(): void;
    handleResetViewer(): void;
    handleTakeScreenshot(): void;
    handleToggleOrbitControls(): void;
    handleToggleOrbitControlsAnimation(): void;
    handleToggleAxes(): void;
    onThreejsEditorModalHide(material: any): void;
    handleChemicalConnectivityFactorChange(e: any): void;
    handleToggleMeasurement(measurementMode: any): void;
    handleSetState(newState: any): void;
    handleSetMeasurementSettingsForTypeInState(newMeasurementSettingsForType: any): void;
    handleDeleteConnection(): void;
    handleResetMeasurements(): void;
    addHotKeyListener(): void;
    removeHotKeyListener(): void;
    handleStartGifRecording(downloadPath: any, rotationSpeed?: number, frameDuration?: number): Promise<void>;
    handleMessage: (event: any) => void;
    handleSetMaterial(newMaterialConfig: any): void;
    componentDidMount(): void;
    /**
     * Apply toggle-based view settings from URL params after the Wave instance is mounted.
     * These settings are imperative (they toggle state on the Wave class instance),
     * so they must be applied after componentDidMount when WaveComponent.wave exists.
     */
    _applyInitialToggleSettings(): void;
    componentWillUnmount(): void;
    UNSAFE_componentWillReceiveProps(nextProps: any, nextContext: any): void;
    _resetStateWaveComponent(): void;
    handleSetSetting: (setting: any) => void;
    getKeyConfig(): {
        [x: string]: () => void;
        [x: number]: () => void;
    };
    handleKeyPress: (e: any) => void;
    getPrimitiveOrConventionalMaterial(material: any, isConventionalCellShown?: boolean): any;
    _getWaveProperty(name: any): any;
    /**
     * Returns a cover div to cover the area and prevent user interaction with component
     */
    renderCoverDiv(): import("react/jsx-runtime").JSX.Element;
    renderWaveComponent(): import("react/jsx-runtime").JSX.Element;
    WaveComponent: WaveComponent | null | undefined;
    getCheckmark(isActive: any): import("react/jsx-runtime").JSX.Element;
    getViewSettingsActions: () => ({
        id: string;
        disabled: boolean;
        content: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        rightIcon: import("react/jsx-runtime").JSX.Element;
        onClick: () => void;
        shouldMenuStayOpened: boolean;
        isDivider?: undefined;
    } | {
        id: string;
        isDivider: boolean;
        disabled?: undefined;
        content?: undefined;
        leftIcon?: undefined;
        rightIcon?: undefined;
        onClick?: undefined;
        shouldMenuStayOpened?: undefined;
    } | {
        id: string;
        disabled: boolean;
        content: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        onClick: () => void;
        shouldMenuStayOpened: boolean;
        rightIcon?: undefined;
        isDivider?: undefined;
    })[];
    getMeasurementsActions: () => ({
        id: string;
        content: string;
        rightIcon: import("react/jsx-runtime").JSX.Element;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        onClick: () => void;
        shouldMenuStayOpened: boolean;
        isDivider?: undefined;
    } | {
        id: string;
        content: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        onClick: () => void;
        shouldMenuStayOpened: boolean;
        rightIcon?: undefined;
        isDivider?: undefined;
    } | {
        id: string;
        isDivider: boolean;
        content?: undefined;
        rightIcon?: undefined;
        leftIcon?: undefined;
        onClick?: undefined;
        shouldMenuStayOpened?: undefined;
    })[];
    getExportActions: () => ({
        id: string;
        title: string;
        content: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        onClick: () => void;
        actions?: undefined;
        paperPlacement?: undefined;
    } | {
        id: string;
        title: string;
        content: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        actions: {
            id: string;
            title: string;
            content: string;
            leftIcon: import("react/jsx-runtime").JSX.Element;
            onClick: () => void;
        }[];
        paperPlacement: string;
        onClick?: undefined;
    })[];
    getParametersActions: () => import("react/jsx-runtime").JSX.Element;
    getToolbarConfig(): ({
        id: string;
        title: string;
        header: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        contentObject: import("react/jsx-runtime").JSX.Element;
        onClick: () => void;
        actions?: undefined;
    } | {
        id: string;
        title: string;
        header: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        actions: ({
            id: string;
            content: string;
            rightIcon: import("react/jsx-runtime").JSX.Element;
            leftIcon: import("react/jsx-runtime").JSX.Element;
            onClick: () => void;
            shouldMenuStayOpened: boolean;
            isDivider?: undefined;
        } | {
            id: string;
            content: string;
            leftIcon: import("react/jsx-runtime").JSX.Element;
            onClick: () => void;
            shouldMenuStayOpened: boolean;
            rightIcon?: undefined;
            isDivider?: undefined;
        } | {
            id: string;
            isDivider: boolean;
            content?: undefined;
            rightIcon?: undefined;
            leftIcon?: undefined;
            onClick?: undefined;
            shouldMenuStayOpened?: undefined;
        })[];
        onClick: () => void;
        contentObject?: undefined;
    } | {
        id: string;
        title: string;
        header: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        actions: ({
            id: string;
            title: string;
            content: string;
            leftIcon: import("react/jsx-runtime").JSX.Element;
            onClick: () => void;
            actions?: undefined;
            paperPlacement?: undefined;
        } | {
            id: string;
            title: string;
            content: string;
            leftIcon: import("react/jsx-runtime").JSX.Element;
            actions: {
                id: string;
                title: string;
                content: string;
                leftIcon: import("react/jsx-runtime").JSX.Element;
                onClick: () => void;
            }[];
            paperPlacement: string;
            onClick?: undefined;
        })[];
        onClick: () => void;
        contentObject?: undefined;
    })[];
    renderWaveOrThreejsEditorModal(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export namespace ThreeDEditor {
    namespace propTypes {
        let material: PropTypes.Validator<import("@mat3ra/made").Material>;
        let editable: PropTypes.Requireable<boolean>;
        let isConventionalCellShown: PropTypes.Requireable<boolean>;
        let boundaryConditions: PropTypes.Requireable<object>;
        let onUpdate: PropTypes.Requireable<(...args: any[]) => any>;
        let isStandalone: PropTypes.Requireable<boolean>;
        let initialViewSettings: PropTypes.Requireable<object>;
    }
    namespace defaultProps {
        let boundaryConditions_1: {};
        export { boundaryConditions_1 as boundaryConditions };
        let isConventionalCellShown_1: boolean;
        export { isConventionalCellShown_1 as isConventionalCellShown };
        let onUpdate_1: undefined;
        export { onUpdate_1 as onUpdate };
        let editable_1: boolean;
        export { editable_1 as editable };
        let isStandalone_1: boolean;
        export { isStandalone_1 as isStandalone };
        let initialViewSettings_1: {};
        export { initialViewSettings_1 as initialViewSettings };
    }
}
import React from "react";
import { WaveComponent } from "./WaveComponent";
import PropTypes from "prop-types";
