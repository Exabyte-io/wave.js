export const LabelsMixin = (superclass) => class extends superclass {

    _createTextSprite(message, opts) {
        const parameters = opts || {};
        const fontface = parameters.fontface || 'Helvetica';
        const fontsize = parameters.fontsize || 70;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = fontsize + "px " + fontface;

        // get size data (height depends only on font size)
        const metrics = context.measureText(message);
        const textWidth = metrics.width;

        // text color
        context.fillStyle = 'rgba(255, 255, 255, 1.0)';
        context.fillText(message, 0, fontsize);

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

    }

};
