export function ControlsMixin(superclass: any): {
    new (): {
        [x: string]: any;
        toggleBoolean(name: any, antagonistNames?: any[]): void;
        areTwoObjectsShallowEqual(o1: any, o2: any): boolean;
        getTwoObjectsShallowDifferentKeys(o1: any, o2: any): {};
    };
    [x: string]: any;
};
