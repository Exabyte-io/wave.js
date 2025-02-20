var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
import * as THREE from "three";
import { ATOM_GROUP_NAME, ELEMENT_LABELS_GROUP_NAME } from "../../enums";
import { BaseLabelsMixin } from "./baseLabels";
/*
 * Mixin containing the logic for dealing with atom-specific labels.
 * Extends the base label functionality with features specific to atom labeling.
 */
export const ElementLabelsMixin = (superclass) => { var _elementTexturesCache, _elementLabelsGroup, _a; return _a = class extends BaseLabelsMixin(superclass) {
        constructor(config) {
            super(config);
            _elementTexturesCache.set(this, {});
            _elementLabelsGroup.set(this, void 0);
            __classPrivateFieldSet(this, _elementLabelsGroup, new THREE.Group(), "f");
            __classPrivateFieldGet(this, _elementLabelsGroup, "f").name = ELEMENT_LABELS_GROUP_NAME;
            this.areElementLabelsShown = this.settings.areElementLabelsInitiallyShown;
            __classPrivateFieldGet(this, _elementLabelsGroup, "f").visible = this.areElementLabelsShown;
            this.structureGroup.add(__classPrivateFieldGet(this, _elementLabelsGroup, "f"));
        }
        /**
         * Creates a hash map representing the positions (vertices) for atom labels.
         * The hash map uses atom names as keys and corresponding 3D positions as values.
         * If an atom name already exists in the hash map, it appends the atom's coordinates to the associated entry.
         *
         * @returns {Object.<string, Array.<number>>} HashMap with atom names as keys and an array of vertices as values.
         */
        createVerticesHashMap() {
            const verticesHashMap = {};
            this.structureGroup.children.forEach((group) => {
                if (group.name !== ATOM_GROUP_NAME)
                    return;
                group.children.forEach((atom) => {
                    if (atom instanceof THREE.Mesh) {
                        const text = atom.userData.symbolWithLabel;
                        const position = new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld);
                        const { x, y, z } = position;
                        if (!verticesHashMap[text]) {
                            verticesHashMap[text] = [];
                        }
                        verticesHashMap[text].push(x, y, z);
                    }
                });
            });
            return verticesHashMap;
        }
        /**
         * Computes an offset vector for a given atom position to position labels correctly.
         * This method returns a vector pointing from the atom to the camera but with a
         * length equal to the sphere radius.
         * @param {THREE.Vector3} atomPosition - The 3D position of the atom.
         * @param {String} element - The name of the atom.
         * @returns {THREE.Vector3} - Offset vector for the label.
         */
        getLabelOffsetVector(atomPosition, element) {
            const vectorToCamera = new THREE.Vector3().subVectors(this.camera.position, atomPosition);
            const offsetLength = this.getAtomRadiusByElement(element);
            return vectorToCamera.normalize().multiplyScalar(offsetLength);
        }
        /**
         * Creates labels as sprites or points
         * depending on the settings.elementLabelsConfig.areSpritesUsed value
         */
        createElementLabels() {
            const verticesHashMap = this.createVerticesHashMap();
            const getNameForLabel = (text) => `element-label-for-${text}`;
            if (this.settings.elementLabelsConfig.areSpritesUsed) {
                this.createLabelsAsSprites(verticesHashMap, getNameForLabel, this.getLabelOffsetVector.bind(this), (text, position) => ({ atomPosition: position, atomName: text }), __classPrivateFieldGet(this, _elementLabelsGroup, "f"), this.settings.elementLabelsConfig);
            }
            else {
                this.createLabelsAsPoints(verticesHashMap, getNameForLabel, __classPrivateFieldGet(this, _elementLabelsGroup, "f"), this.settings.elementLabelsConfig);
            }
            this.render();
        }
        /**
         * Adjusts label positions in 3D space so that they don't overlap with their corresponding atoms
         * and always face the camera.
         * @method adjustElementLabelsToCameraPosition
         */
        adjustElementLabelsToCameraPosition() {
            if (!this.areElementLabelsShown || !this.settings.elementLabelsConfig.areSpritesUsed)
                return;
            __classPrivateFieldGet(this, _elementLabelsGroup, "f").children.forEach((label) => {
                const { atomPosition, atomName: element } = label.userData;
                const offsetVector = this.getLabelOffsetVector(atomPosition, element);
                label.position.addVectors(atomPosition, offsetVector);
                label.visible = this.areElementLabelsShown;
                label.lookAt(this.camera.position);
            });
        }
        /**
         * Toggles the visibility of all labels
         */
        toggleElementLabels() {
            this.areElementLabelsShown = !this.areElementLabelsShown;
            __classPrivateFieldGet(this, _elementLabelsGroup, "f").visible = this.areElementLabelsShown;
            this.render();
        }
    },
    _elementTexturesCache = new WeakMap(),
    _elementLabelsGroup = new WeakMap(),
    _a; };
