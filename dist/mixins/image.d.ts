export function ImageMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        drawUnitCell: any;
    };
    [x: string]: any;
};
