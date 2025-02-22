/*
 * Mixin containing the logic for dealing with the images, GIFs.
 */
export const ImageMixin = (superclass) => class extends superclass {
    constructor(config) {
        super(config);
        this.drawUnitCell = this.drawUnitCell.bind(this);
    }
};
