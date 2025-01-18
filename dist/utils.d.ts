/**
 * Helper to save textual/bitmap data to a file.
 * @param {String} strData - Textual data
 * @param {String} filename
 */
export function saveFile(strData: string, filename: string): void;
/**
 * Save image data file with type
 * @param {String} imgData
 * @param {String} type
 */
export function saveImageDataToFile(imgData: string, type?: string): void;
/**
 * Converts a given scene data to a material.
 * Lattice is constructed from the LineSegments object.
 * Basis is constructed based on all SphereMesh objects.
 */
export function ThreeDSceneDataToMaterial(scene: any): {
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
} & import("@mat3ra/code/dist/js/entity").InMemoryEntity;
/**
 * Converts given materials to scene data.
 * The first material is used as parent and it's unit cell is used in case multiple materials are passed.
 * Other materials are added as a group under the first material with their cell hidden by default.
 * Atoms are slightly shifted along X axis if multiple materials are passed.
 */
export function materialsToThreeDSceneData(materials: any, shift?: number[]): any;
/**
 * Sets multiple parameters of the target object.
 * @param {Object} targetObject - the object to receive new property values.
 * @param {Object} parameters - the object containing key-value pairs to be set.
 */
export function setParameters(targetObject: Object, parameters: Object): void;
export function exportToDisk(content: string, name?: string, extension?: string, mime?: string): void;
import { Made } from "@mat3ra/made";
