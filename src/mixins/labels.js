import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer.js";

export const addAxisLabels = function(symbol, coord, color, background) {
    const text = document.createElement('div');
    text.className ='label';
    text.style.color = color;
    text.style.backgroundColor = background;
    text.textContent = symbol;
    const label = new CSS2DObject( text );
    label.position.copy(coord);

    return label;
}

