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
            isViewAdjustable: boolean;
            atomRadiiScale: number;
            repetitionsAlongLatticeVectorA: number;
            repetitionsAlongLatticeVectorB: number;
            repetitionsAlongLatticeVectorC: number;
            chemicalConnectivityFactor: number;
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
        let material: PropTypes.Validator<NonNullable<{
            _json: import("@mat3ra/made/dist/js/material").MaterialSchemaJSON;
            toJSON(): import("@mat3ra/made/dist/js/types").MaterialJSON;
            src: import("@mat3ra/esse/dist/js/types").FileSourceSchema | undefined;
            updateFormula(): void;
            isNonPeriodic: boolean;
            getDerivedPropertyByName(name: string): {
                name?: "volume" | undefined;
                units?: "angstrom^3" | undefined;
                value: number;
            } | {
                name?: "density" | undefined;
                units?: "g/cm^3" | undefined;
                value: number;
            } | {
                pointGroupSymbol?: string | undefined;
                spaceGroupSymbol?: string | undefined;
                tolerance?: {
                    units?: "angstrom" | undefined;
                    value: number;
                } | undefined;
                name?: "symmetry" | undefined;
            } | {
                name?: "elemental_ratio" | undefined;
                value: number;
                element?: string | undefined;
            } | {
                name?: "p-norm" | undefined;
                degree?: number | undefined;
                value: number;
            } | {
                name?: "inchi" | undefined;
                value: string;
            } | {
                name?: "inchi_key" | undefined;
                value: string;
            } | undefined;
            getDerivedProperties(): import("@mat3ra/esse/dist/js/types").DerivedPropertiesSchema;
            readonly formula: string;
            readonly unitCellFormula: string;
            unsetFileProps(): void;
            setBasis(textOrObject: string | import("@mat3ra/made/dist/js/parsers/xyz").BasisConfig, format?: string, unitz?: string): void;
            setBasisConstraints(constraints: import("@mat3ra/made/dist/js/constraints/constraints").Constraint[]): void;
            readonly basis: import("@mat3ra/made/dist/js/parsers/xyz").BasisConfig;
            readonly Basis: import("@mat3ra/made/dist/js/basis/constrained_basis").ConstrainedBasis;
            readonly uniqueElements: string[];
            lattice: import("@mat3ra/made/dist/js/lattice/lattice_vectors").BravaisConfigProps | undefined;
            readonly Lattice: Made.Lattice;
            getInchiStringForHash(): string;
            calculateHash(salt?: string, isScaled?: boolean, bypassNonPeriodicCheck?: boolean): string;
            hash: string;
            readonly scaledHash: string;
            toCrystal(): void;
            toCartesian(): void;
            getBasisAsXyz(fractional?: boolean): string;
            getAsQEFormat(): string;
            getAsPOSCAR(ignoreOriginal?: boolean, omitConstraints?: boolean): string;
            getACopyWithConventionalCell(): any;
            getConsistencyChecks(): import("@mat3ra/esse/dist/js/types").ConsistencyCheck[];
            getBasisConsistencyChecks(): import("@mat3ra/esse/dist/js/types").ConsistencyCheck[];
            consistencyChecks: object[];
            addConsistencyChecks(array: object[]): void;
            prop: {
                <T = undefined>(name: string, defaultValue: T): T;
                <T_1 = undefined>(name: string): T_1 | undefined;
            } & {
                <T_2 = undefined>(name: string, defaultValue: T_2): T_2;
                <T_1_1 = undefined>(name: string): T_1_1 | undefined;
            } & {
                <T_3 = undefined>(name: string, defaultValue: T_3): T_3;
                <T_1_2 = undefined>(name: string): T_1_2 | undefined;
            } & {
                <T_4 = undefined>(name: string, defaultValue: T_4): T_4;
                <T_1_3 = undefined>(name: string): T_1_3 | undefined;
            } & {
                <T_5 = undefined>(name: string, defaultValue: T_5): T_5;
                <T_6 = undefined>(name: string): T_6 | undefined;
            };
            setProp: ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void);
            unsetProp: ((name: string) => void) & ((name: string) => void) & ((name: string) => void) & ((name: string) => void) & ((name: string) => void);
            setProps: ((json?: import("@mat3ra/esse/dist/js/esse/types").AnyObject | undefined) => any) & ((json?: import("@mat3ra/esse/dist/js/esse/types").AnyObject | undefined) => any) & ((json?: import("@mat3ra/esse/dist/js/esse/types").AnyObject | undefined) => any) & ((json?: import("@mat3ra/esse/dist/js/esse/types").AnyObject | undefined) => any) & ((json?: import("@mat3ra/esse/dist/js/esse/types").AnyObject | undefined) => any);
            toJSONSafe: ((exclude?: string[] | undefined) => import("@mat3ra/esse/dist/js/esse/types").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/esse/dist/js/esse/types").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/esse/dist/js/esse/types").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/esse/dist/js/esse/types").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/esse/dist/js/esse/types").AnyObject);
            toJSONQuick: ((exclude?: string[] | undefined) => import("@mat3ra/esse/dist/js/esse/types").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/esse/dist/js/esse/types").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/esse/dist/js/esse/types").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/esse/dist/js/esse/types").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/esse/dist/js/esse/types").AnyObject);
            clone: ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any);
            validate: (() => void) & (() => void) & (() => void) & (() => void) & (() => void);
            clean: ((config: import("@mat3ra/esse/dist/js/esse/types").AnyObject) => import("@mat3ra/esse/dist/js/esse/types").AnyObject) & ((config: import("@mat3ra/esse/dist/js/esse/types").AnyObject) => import("@mat3ra/esse/dist/js/esse/types").AnyObject) & ((config: import("@mat3ra/esse/dist/js/esse/types").AnyObject) => import("@mat3ra/esse/dist/js/esse/types").AnyObject) & ((config: import("@mat3ra/esse/dist/js/esse/types").AnyObject) => import("@mat3ra/esse/dist/js/esse/types").AnyObject) & ((config: import("@mat3ra/esse/dist/js/esse/types").AnyObject) => import("@mat3ra/esse/dist/js/esse/types").AnyObject);
            isValid: (() => boolean) & (() => boolean) & (() => boolean) & (() => boolean) & (() => boolean);
            id: string;
            readonly cls: string;
            getClsName: (() => string) & (() => string) & (() => string) & (() => string) & (() => string);
            readonly slug: string;
            readonly isSystemEntity: boolean;
            getAsEntityReference: ((byIdOnly?: boolean | undefined) => import("@mat3ra/esse/dist/js/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@mat3ra/esse/dist/js/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@mat3ra/esse/dist/js/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@mat3ra/esse/dist/js/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@mat3ra/esse/dist/js/types").EntityReferenceSchema);
            getEntityByName: ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity) & ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity) & ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity) & ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity) & ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity);
            metadata: object;
            updateMetadata(object: object): void;
            name: string;
            setName(name: string): void;
            readonly isDefault: boolean;
        } & {
            consistencyChecks: object[];
            addConsistencyChecks(array: object[]): void;
            _json: import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            prop<T = undefined>(name: string, defaultValue: T): T;
            prop<T_1 = undefined>(name: string): T_1 | undefined;
            setProp(name: string, value: unknown): void;
            unsetProp(name: string): void;
            setProps(json?: import("@mat3ra/esse/dist/js/esse/types").AnyObject | undefined): any;
            toJSON(exclude?: string[] | undefined): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            toJSONSafe(exclude?: string[] | undefined): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            toJSONQuick(exclude?: string[] | undefined): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            clone(extraContext?: object | undefined): any;
            validate(): void;
            clean(config: import("@mat3ra/esse/dist/js/esse/types").AnyObject): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            isValid(): boolean;
            id: string;
            readonly cls: string;
            getClsName(): string;
            readonly slug: string;
            readonly isSystemEntity: boolean;
            getAsEntityReference(byIdOnly?: boolean | undefined): import("@mat3ra/esse/dist/js/types").EntityReferenceSchema;
            getEntityByName(entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string): import("@mat3ra/code/dist/js/entity").InMemoryEntity;
        } & {
            metadata: object;
            updateMetadata(object: object): void;
            _json: import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            prop<T_2 = undefined>(name: string, defaultValue: T_2): T_2;
            prop<T_1_1 = undefined>(name: string): T_1_1 | undefined;
            setProp(name: string, value: unknown): void;
            unsetProp(name: string): void;
            setProps(json?: import("@mat3ra/esse/dist/js/esse/types").AnyObject | undefined): any;
            toJSON(exclude?: string[] | undefined): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            toJSONSafe(exclude?: string[] | undefined): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            toJSONQuick(exclude?: string[] | undefined): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            clone(extraContext?: object | undefined): any;
            validate(): void;
            clean(config: import("@mat3ra/esse/dist/js/esse/types").AnyObject): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            isValid(): boolean;
            id: string;
            readonly cls: string;
            getClsName(): string;
            readonly slug: string;
            readonly isSystemEntity: boolean;
            getAsEntityReference(byIdOnly?: boolean | undefined): import("@mat3ra/esse/dist/js/types").EntityReferenceSchema;
            getEntityByName(entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string): import("@mat3ra/code/dist/js/entity").InMemoryEntity;
        } & {
            name: string;
            setName(name: string): void;
            _json: import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            prop<T_3 = undefined>(name: string, defaultValue: T_3): T_3;
            prop<T_1_2 = undefined>(name: string): T_1_2 | undefined;
            setProp(name: string, value: unknown): void;
            unsetProp(name: string): void;
            setProps(json?: import("@mat3ra/esse/dist/js/esse/types").AnyObject | undefined): any;
            toJSON(exclude?: string[] | undefined): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            toJSONSafe(exclude?: string[] | undefined): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            toJSONQuick(exclude?: string[] | undefined): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            clone(extraContext?: object | undefined): any;
            validate(): void;
            clean(config: import("@mat3ra/esse/dist/js/esse/types").AnyObject): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            isValid(): boolean;
            id: string;
            readonly cls: string;
            getClsName(): string;
            readonly slug: string;
            readonly isSystemEntity: boolean;
            getAsEntityReference(byIdOnly?: boolean | undefined): import("@mat3ra/esse/dist/js/types").EntityReferenceSchema;
            getEntityByName(entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string): import("@mat3ra/code/dist/js/entity").InMemoryEntity;
        } & {
            readonly isDefault: boolean;
            _json: import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            prop<T_4 = undefined>(name: string, defaultValue: T_4): T_4;
            prop<T_1_3 = undefined>(name: string): T_1_3 | undefined;
            setProp(name: string, value: unknown): void;
            unsetProp(name: string): void;
            setProps(json?: import("@mat3ra/esse/dist/js/esse/types").AnyObject | undefined): any;
            toJSON(exclude?: string[] | undefined): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            toJSONSafe(exclude?: string[] | undefined): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            toJSONQuick(exclude?: string[] | undefined): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            clone(extraContext?: object | undefined): any;
            validate(): void;
            clean(config: import("@mat3ra/esse/dist/js/esse/types").AnyObject): import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            isValid(): boolean;
            id: string;
            readonly cls: string;
            getClsName(): string;
            readonly slug: string;
            readonly isSystemEntity: boolean;
            getAsEntityReference(byIdOnly?: boolean | undefined): import("@mat3ra/esse/dist/js/types").EntityReferenceSchema;
            getEntityByName(entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string): import("@mat3ra/code/dist/js/entity").InMemoryEntity;
        } & import("@mat3ra/code/dist/js/entity").InMemoryEntity>>;
        let editable: PropTypes.Requireable<boolean>;
        let isConventionalCellShown: PropTypes.Requireable<boolean>;
        let boundaryConditions: PropTypes.Requireable<object>;
        let onUpdate: PropTypes.Requireable<(...args: any[]) => any>;
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
    }
}
import React from "react";
import { WaveComponent } from "./WaveComponent";
import { Made } from "@mat3ra/made";
import PropTypes from "prop-types";
