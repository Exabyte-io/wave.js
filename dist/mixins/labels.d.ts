export function LabelsMixin(superclass: any): {
    new (config: any): {
        [x: string]: any;
        "__#1@#texturesCache": {};
        labelsGroup: any;
        /**
         * Creates a new texture based on a 2D canvas with the supplied text
         * @param {String} text - the text to be placed on the texture;
         * @return {THREE.Texture}
         */
        createLabelTextTexture(text: string): THREE.Texture;
        /**
         * Returns cached or newly created texture with label text
         * @param {String} text - the text to be placed on the texture;
         * @return {THREE.Texture}
         */
        getLabelTextTexture(text: string): THREE.Texture;
        /**
         * Creates a sprite with a label text
         * @param {String} text - the text displayed on the atom label;
         * should be 1-2 symbols long to fit the square form of the label shown in front of a sphere
         * @param {String} name - the name of the created sprite;
         * naming convention: label-for-<atom mesh uuid>
         * @return {THREE.Sprite}
         */
        createLabelSprite(text: string, name: string): THREE.Sprite;
        /**
         * Adjusts label positions in 3D space so that they don't overlap with their corresponding atoms
         * and always face the camera.
         * @method adjustLabelsToCameraPosition
         */
        adjustLabelsToCameraPosition(): void;
        /**
         * Creates a hash map representing the positions (vertices) for atom labels.
         * The hash map uses atom names as keys and corresponding 3D positions as values.
         * If an atom name already exists in the hash map, it appends the atom's coordinates to the associated entry.
         *
         * @returns {Object.<string, Array.<number>>} HashMap with atom names as keys and an array of vertices as values.
         */
        createVerticesHashMap(): {
            [x: string]: number[];
        };
        /**
         * Creates labels as sprites or points
         * depending on the settings.labelsConfig.areSpritesUsed value
         */
        createLabels(): void;
        /**
         * Creates label sprites as points.
         * If we want to use a lot of labels and don't want to have a huge impact
         * from rendering scene we should use Three.Points or Three.InstancedMesh.
         * https://threejs.org/docs/#api/en/objects/Points
         * https://threejs.org/docs/?q=instanced#api/en/objects/InstancedMesh
         */
        createLabelsAsPoints(): void;
        /**
         * Creates and positions label sprites based on atom vertices.
         * Clears any existing labels, then uses a hash map of vertices to determine label placement.
         * Each label, represented as a sprite, is positioned at an offset determined by the atom's radius.
         * For performance considerations, when using many labels, consider using Three.Points or Three.InstancedMesh.
         *
         * https://threejs.org/docs/#api/en/objects/Points
         * https://threejs.org/docs/?q=instanced#api/en/objects/InstancedMesh
         */
        createLabelsAsSprites(viewGroup: any): void;
        /**
         * Computes an offset vector for a given atom position to position labels correctly.
         * This method returns a vector pointing from the atom to the camera but with a
         * length equal to the sphere radius.
         * @param {THREE.Vector3} atomPosition - The 3D position of the atom.
         * @param {String} element - The name of the atom.
         * @returns {THREE.Vector3} - Offset vector for the label.
         */
        getLabelOffsetVector(atomPosition: THREE.Vector3, element: string): THREE.Vector3;
        /**
         * Toggles the visibility of all the text labels within the atom group
         */
        toggleLabels(): void;
        areLabelsShown: any;
    };
    [x: string]: any;
};
