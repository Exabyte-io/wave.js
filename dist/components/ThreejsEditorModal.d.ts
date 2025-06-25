export class ThreejsEditorModal extends ModalDialog {
    editor: any;
    domElement: any;
    /**
     *  shows alert with specific parameters
     *  @typedef {{ text: string, onClick: Function }} ButtonsType
     *  @typedef {{ title: string, content: string, buttons: ButtonsType }} ShowAlertInputType
     *  @param {ShowAlertInputType} params
     */
    showAlert(params: {
        title: string;
        content: string;
        buttons: {
            text: string;
            onClick: Function;
        };
    }): void;
    /**
     * submits multiple selections group
     */
    submitMultipleSelectionGroup(): void;
    /**
     * removes multiple selection group
     */
    removeMultipleSelectionGroup(): void;
    /**
     * this function shows confirm window if user forgets to submit multiple selection and tries to exit from editor
     */
    showSubmissionMultipleSelectionModal(): void;
    /**
     * checks is multiple selection submitted
     * @returns {Boolean} true - if multiple selection is submitted false - if not
     */
    isMultipleSelectionGroupSubmitted(): boolean;
    /**
     * force exit from the modal with initially defined materials
     */
    forceExitFromEditor(): void;
    /**
     * exit form editor and calls callback
     * @param {Function} callback - function that should be called before exit from editor
     * @returns {Function} - callback that can be applied to event listener
     */
    exitWithCallback(callback: Function): Function;
    /**
     * extracts materials and hides editor
     */
    extractMaterialAndHide(): void;
    /**
     * displays error confirm window if we have some errors
     */
    onExtractMaterialError(errorMessage?: string): void;
    initialize(el: any): void;
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any): void;
    /**
     * `Number.prototype.format` is used inside three.js editor codebase to format the numbers.
     * The editor does not start without it. The ESLint line is a way to turn off the warning shown in the console.
     */
    setNumberFormat(): void;
    initializeCamera: () => THREE.PerspectiveCamera;
    initializeLights(): void;
    initializeControlsInEditor(): void;
    initializeRaycaster(): void;
    raycaster: THREE.Raycaster | undefined;
    mouse: THREE.Vector2 | undefined;
    /**
     * Initialize threejs editor and add it to the DOM.
     */
    initializeEditor(): void;
    viewport: any;
    /**
     * Add dragover listeners to group the objects.
     */
    addEventListeners(): void;
    /**
     * Handle signals from the editor
     */
    addSignalsListeners(): void;
    /**
     * Load the scene based on the given materials.
     */
    loadScene(): void;
    /**
     * function to be called on Escape click or on exit from editor
     */
    onHide(): void;
    renderBody(): import("react/jsx-runtime").JSX.Element;
    alertRef: any;
}
export namespace ThreejsEditorModal {
    namespace propTypes {
        let materials: PropTypes.Validator<(({
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
            setBasis(textOrObject: string | import("@mat3ra/made/dist/js/basis/basis").BasisConfig, format?: string | undefined, unitz?: string | undefined): void;
            setBasisConstraints(constraints: import("@mat3ra/made/dist/js/constraints/constraints").Constraint[]): void;
            setBasisConstraintsFromArrayOfObjects(constraints: import("@mat3ra/esse/dist/js/types").AtomicConstraintsSchema): void;
            readonly basis: import("@mat3ra/made/dist/js/material").OptionallyConstrainedBasisConfig;
            readonly Basis: import("@mat3ra/made/dist/js/basis/constrained_basis").ConstrainedBasis;
            readonly uniqueElements: string[];
            lattice: import("@mat3ra/esse/dist/js/types").LatticeSchema;
            readonly Lattice: import("@mat3ra/made/dist/js/lattice/lattice").Lattice;
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
            consistencyChecks: import("@mat3ra/esse/dist/js/types").ConsistencyCheck[];
            addConsistencyChecks(array: import("@mat3ra/esse/dist/js/types").ConsistencyCheck[]): void;
            prop: {
                <T = undefined>(name: string, defaultValue: T): T;
                <T_1 = undefined>(name: string): T_1 | undefined;
            } & {
                <T_2 = undefined>(name: string, defaultValue: T_2): T_2;
                <T_3 = undefined>(name: string): T_3 | undefined;
            } & {
                <T_4 = undefined>(name: string, defaultValue: T_4): T_4;
                <T_5 = undefined>(name: string): T_5 | undefined;
            } & {
                <T_6 = undefined>(name: string, defaultValue: T_6): T_6;
                <T_7 = undefined>(name: string): T_7 | undefined;
            } & {
                <T_8 = undefined>(name: string, defaultValue: T_8): T_8;
                <T_9 = undefined>(name: string): T_9 | undefined;
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
            readonly cls: string;
            getClsName: (() => string) & (() => string) & (() => string) & (() => string) & (() => string);
            getAsEntityReference: {
                (byIdOnly: true): {
                    _id: string;
                };
                (byIdOnly: false): Required<import("@mat3ra/esse/dist/js/types").EntityReferenceSchema>;
            } & {
                (byIdOnly: true): {
                    _id: string;
                };
                (byIdOnly: false): Required<import("@mat3ra/esse/dist/js/types").EntityReferenceSchema>;
            } & {
                (byIdOnly: true): {
                    _id: string;
                };
                (byIdOnly: false): Required<import("@mat3ra/esse/dist/js/types").EntityReferenceSchema>;
            } & {
                (byIdOnly: true): {
                    _id: string;
                };
                (byIdOnly: false): Required<import("@mat3ra/esse/dist/js/types").EntityReferenceSchema>;
            } & {
                (byIdOnly: true): {
                    _id: string;
                };
                (byIdOnly: false): Required<import("@mat3ra/esse/dist/js/types").EntityReferenceSchema>;
            };
            getEntityByName: ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity) & ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity) & ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity) & ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity) & ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity);
            id: string;
            _id: string;
            schemaVersion: string;
            systemName: string;
            readonly slug: string;
            readonly isSystemEntity: boolean;
            metadata: object;
            updateMetadata(object: object): void;
            name: string;
            setName(name: string): void;
            readonly isDefault: boolean;
        } & {
            consistencyChecks: import("@mat3ra/esse/dist/js/types").ConsistencyCheck[];
            addConsistencyChecks(array: import("@mat3ra/esse/dist/js/types").ConsistencyCheck[]): void;
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
            readonly cls: string;
            getClsName(): string;
            getAsEntityReference(byIdOnly: true): {
                _id: string;
            };
            getAsEntityReference(byIdOnly: false): Required<import("@mat3ra/esse/dist/js/types").EntityReferenceSchema>;
            getEntityByName(entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string): import("@mat3ra/code/dist/js/entity").InMemoryEntity;
            id: string;
            _id: string;
            schemaVersion: string;
            systemName: string;
            readonly slug: string;
            readonly isSystemEntity: boolean;
        } & {
            metadata: object;
            updateMetadata(object: object): void;
            _json: import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            prop<T_2 = undefined>(name: string, defaultValue: T_2): T_2;
            prop<T_3 = undefined>(name: string): T_3 | undefined;
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
            readonly cls: string;
            getClsName(): string;
            getAsEntityReference(byIdOnly: true): {
                _id: string;
            };
            getAsEntityReference(byIdOnly: false): Required<import("@mat3ra/esse/dist/js/types").EntityReferenceSchema>;
            getEntityByName(entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string): import("@mat3ra/code/dist/js/entity").InMemoryEntity;
            id: string;
            _id: string;
            schemaVersion: string;
            systemName: string;
            readonly slug: string;
            readonly isSystemEntity: boolean;
        } & {
            name: string;
            setName(name: string): void;
            _json: import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            prop<T_4 = undefined>(name: string, defaultValue: T_4): T_4;
            prop<T_5 = undefined>(name: string): T_5 | undefined;
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
            readonly cls: string;
            getClsName(): string;
            getAsEntityReference(byIdOnly: true): {
                _id: string;
            };
            getAsEntityReference(byIdOnly: false): Required<import("@mat3ra/esse/dist/js/types").EntityReferenceSchema>;
            getEntityByName(entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string): import("@mat3ra/code/dist/js/entity").InMemoryEntity;
            id: string;
            _id: string;
            schemaVersion: string;
            systemName: string;
            readonly slug: string;
            readonly isSystemEntity: boolean;
        } & {
            readonly isDefault: boolean;
            _json: import("@mat3ra/esse/dist/js/esse/types").AnyObject;
            prop<T_6 = undefined>(name: string, defaultValue: T_6): T_6;
            prop<T_7 = undefined>(name: string): T_7 | undefined;
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
            readonly cls: string;
            getClsName(): string;
            getAsEntityReference(byIdOnly: true): {
                _id: string;
            };
            getAsEntityReference(byIdOnly: false): Required<import("@mat3ra/esse/dist/js/types").EntityReferenceSchema>;
            getEntityByName(entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string): import("@mat3ra/code/dist/js/entity").InMemoryEntity;
            id: string;
            _id: string;
            schemaVersion: string;
            systemName: string;
            readonly slug: string;
            readonly isSystemEntity: boolean;
        } & import("@mat3ra/code/dist/js/entity").InMemoryEntity) | null | undefined)[]>;
    }
}
import { ModalDialog } from "./ModalDialog";
import * as THREE from "three";
import PropTypes from "prop-types";
