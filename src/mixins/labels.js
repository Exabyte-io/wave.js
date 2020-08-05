import {CSS2DObject} from "three-css2drender";

/*
 * Mixin containing the logic for dealing with text labels.
 */
export const addAxisLabels = function (symbol, coordinate, textColor, backgroundColor) {
    const text = document.createElement('div');
    text.className = 'label';
    text.style.color = textColor;
    text.style.backgroundColor = backgroundColor;
    text.textContent = symbol;
    const label = new CSS2DObject(text);
    label.position.copy(coordinate);

    return label;
};
