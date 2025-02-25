import * as THREE from "three";

import { BaseLabelsMixin } from "./baseLabels";

export const LabelsAsPointsMixin = (superclass) =>
    class extends BaseLabelsMixin(superclass) {
        /**
         * Creates a label as points for efficient rendering of many labels
         * @param {String} text - the text to be displayed
         * @param {Array<number>} positions - array of positions [x1,y1,z1,x2,y2,z2,...]
         * @param {String} name - name for the points object
         * @param {Object} config - additional options for the points (size, etc.)
         * @returns {THREE.Points}
         */
        createLabelPoints(text, positions, name, config = this.settings.labelPointsConfig) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
            const material = new THREE.PointsMaterial(config);
            const points = new THREE.Points(geometry, material);
            points.name = name;
            return points;
        }

        /**
         * Creates and positions multiple labels efficiently using Three.Points
         * For best performance when rendering many labels.
         * @param {Object} labelData - Map of label text to array of positions
         * @param {Function} getNameForLabel - Function to generate name for each label
         */
        createLabelsAsPoints(verticesHashMap, getNameForLabel, targetGroup, config) {
            if (!targetGroup) {
                console.warn("No target group provided for labels");
                return;
            }

            targetGroup.clear();
            Object.entries(verticesHashMap).forEach(([key, vertices]) => {
                const points = this.createLabelPoints(key, vertices, getNameForLabel(key), config);
                targetGroup.add(points);
            });
            // Only add to structureGroup if not already added
            if (!this.structureGroup.children.includes(targetGroup)) {
                this.structureGroup.add(targetGroup);
            }
        }

        /**
         * Creates labels for a specific label type
         * @param {string} labelType - Type of label to create
         * @param {THREE.Group} [sourceGroup=this.structureGroup] - Group to extract atoms from
         */
        createLabels(labelType, sourceGroup = this.structureGroup) {
            const labelsHolder = this.findLabelsHolder(labelType);
            if (!labelsHolder) return;

            const verticesHashMap = this.createVerticesHashMap(labelsHolder, sourceGroup);
            labelsHolder.threeJsGroup.clear();

            this.createLabelsAsPoints(
                verticesHashMap,
                labelsHolder.getNameForLabel,
                labelsHolder.threeJsGroup,
                labelsHolder.config,
            );
            this.render();
        }
    };
