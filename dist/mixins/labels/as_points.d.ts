import * as THREE from "three";
import { BaseLabelsManager } from "./base";
export declare abstract class BaseLabelsAsPointsManager extends BaseLabelsManager {
    /**
     * Creates a label as points for efficient rendering of many labels
     * @param {String} text - the text to be displayed
     * @param {Array<number>} positions - array of positions [x1,y1,z1,x2,y2,z2,...]
     * @param {String} name - name for the points object
     * @returns {THREE.Points}
     */
    createLabelPoints(text: string, positions: number[], name: string): THREE.Points<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.PointsMaterial, THREE.Object3DEventMap>;
    /**
     * Creates and positions multiple labels efficiently using Three.Points
     * For best performance when rendering many labels.
     * @param {Object} verticesHashMap - Object with label names as keys and arrays of positions as values
     * @param {Function} getNameForLabel - Function to get the name for a label
     * @param {THREE.Group} targetGroup - Group to add the labels to
     */
    createLabelsAsPoints(verticesHashMap: {
        [key: string]: number[];
    }, getNameForLabel: (text: string) => string, targetGroup: THREE.Group): void;
}
