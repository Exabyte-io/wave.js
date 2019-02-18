export const LabelsMixin = (superclass) => class extends superclass {

    /**
     * Work-in-progress function for adding labels with text to 3D objects.
     * @param {String }text
     * @param {Object} options
     * @return {THREE.Sprite}
     * @private
     */
    _createTextSprite(text, options) {
        const parameters = options || {};
        const fontface = parameters.fontface || 'Helvetica';
        const fontsize = parameters.fontsize || 70;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = fontsize + "px " + fontface;

        // get size data (height depends only on font size)
        const metrics = context.measureText(text);
        const textWidth = metrics.width;

        // text color
        context.fillStyle = 'rgba(255, 255, 255, 1.0)';
        context.fillText(text, 0, fontsize);

        // canvas contents will be used for a texture
        const texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            useScreenCoordinates: false
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(100, 50, 1.0);
        return sprite;
    }

    createLabel() {
        // TBA
    }

};
