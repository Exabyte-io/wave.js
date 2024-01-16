/* eslint-disable class-methods-use-this */
import * as THREE from "three";

import {
    ANGLE,
    ATOM_CONNECTION_LINE_NAME,
    ATOM_CONNECTIONS_GROUP_NAME,
    ATOM_GROUP_NAME,
    COLORS,
    MEASUREMENT_LABELS_GROUP_NAME,
    MIN_ANGLE_POINTS_DISTANCE,
} from "../enums";

let clickFunction = null;

/*
 * Mixin containing the logic for dealing with measurements.
 * Draws connections between atoms, calculate angles and distances, draws angles and labels.
 * Checks clicks and mouse movements.
 */
export const MeasurementMixin = (superclass) =>
    class extends superclass {
        constructor(config) {
            super(config);

            this.initRaycaster();
            this.selectedAtoms = [];
            this.intersected = null;

            this.atomConnections = new THREE.Group();
            this.angles = new THREE.Group();
            this.measurementLabels = new THREE.Group();
            this.currentSelectedLine = null;

            this.atomConnections.name = ATOM_CONNECTIONS_GROUP_NAME;
            this.angles.name = "Angles";
            this.measurementLabels.name = MEASUREMENT_LABELS_GROUP_NAME;
        }

        destroyListeners() {
            const canvas = this.renderer.domElement;
            canvas.removeEventListener("click", clickFunction);
        }

        /**
         * Function to initialize listeners for checking DOM events.
         * @param {Function} updateState - functions for updating data in react.
         * @param settings - measurements settings object, this object helps to define state in this class.
         */
        initListeners(updateState, settings) {
            this.measurementSettings = settings;
            clickFunction = this.onClick.bind(this, updateState);
            const canvas = this.renderer.domElement;
            canvas.addEventListener("click", clickFunction);
        }

        /**
         * Function that initialize raycaster, this raycaster is used for checking on which atom you are clicking.
         * Also checking mousemove events
         */
        initRaycaster() {
            this.raycaster = new THREE.Raycaster();
            this.raycaster.params.Line.threshold = 0.1;
            this.pointer = new THREE.Vector2();
        }

        /**
         * Function that collects all atomGroups that we have in structure groups
         */
        getAtomGroups() {
            const atomGroups = [];
            this.structureGroup.children.forEach((group) => {
                if (group.name === ATOM_GROUP_NAME) {
                    atomGroups.push(...group.children);
                }
            });

            return atomGroups;
        }

        /**
         * Function set color for connection line. Used for highlighting connections on mousemove event.
         * @Param intersectItem -> item on which mouse is pointing now
         */
        setHexForLine(intersectItem) {
            if (this.intersected !== intersectItem) {
                if (this.intersected) {
                    this.intersected.material.color.setHex(this.intersected.currentHex);
                }
                this.intersected = intersectItem;
                this.intersected.currentHex = this.intersected.material.color.getHex();
                this.intersected.material.color.setHex(COLORS.GREEN);
                this.renderer.render(this.scene, this.camera);
            }
        }

        /**
         * Function set color for atoms. Used for highlighting atoms on mousemove event.
         * @Param intersectItem -> item on which mouse is pointing now
         */
        setHexForAtom(intersectItem) {
            if (this.intersected !== intersectItem) {
                if (this.intersected) {
                    this.intersected.material.emissive?.setHex(this.intersected.currentHex);
                }
                this.intersected = intersectItem;
                this.intersected.currentHex = this.intersected.material.emissive.getHex();
                this.intersected.material.emissive.setHex(COLORS.RED);
                this.renderer.render(this.scene, this.camera);
            }
        }

        /**
         * Function set default color for connection.
         * Used for unsetting color when mouse is no longer points connection.
         */
        setDefaultHexForLine() {
            this.intersected.material.color.setHex(this.intersected.currentHex);
        }

        /**
         * Function set default color for atom.
         * Used for unsetting color when mouse is no longer points atom.
         */
        setDefaultHexForAtom() {
            this.intersected.material.emissive.setHex(this.intersected.currentHex);
        }

        /**
         * Function set default color for atom or connection.
         * Used for unsetting color when mouse is no longer points on atom or connection.
         */
        handleUnsetHex() {
            if (this.intersected && !this.intersected.userData.selected) {
                if (
                    this.intersected.name === ATOM_CONNECTION_LINE_NAME ||
                    this.intersected.name === ANGLE
                ) {
                    this.setDefaultHexForLine();
                } else {
                    this.setDefaultHexForAtom();
                }
                this.render();
            }
        }

        /**
         * Function checks and updates mouse pointer coordinates
         * @Param event -> simple javascript DOM event
         */
        checkMouseCoordinates(event) {
            const canvas = this.renderer.domElement;
            this.pointer.x = (event.layerX / canvas.width) * 2 - 1;
            this.pointer.y = -(event.layerY / canvas.height) * 2 + 1;
            this.raycaster.setFromCamera(this.pointer, this.camera);
        }

        /**
         * Function that deletes an angle with label.
         */
        deleteConnectionsUsingAngle() {
            const {
                userData: {
                    atomConnections: [connectionA, connectionB],
                    label,
                },
            } = this.currentSelectedLine;

            this.selectedAtoms.forEach((atom, index) => {
                const atomConnections = atom.userData.connections;
                if (!atomConnections) return;
                const isAtomUseThisConnection = atomConnections.some(
                    (connection) =>
                        connection === connectionA.uuid || connection === connectionB.uuid,
                );
                if (isAtomUseThisConnection) {
                    atom.userData.connections = atomConnections.filter(
                        (connection) =>
                            connection !== connectionA.uuid && connection !== connectionB.uuid,
                    );
                    this.selectedAtoms[index] = null;
                }
                if (!atom.userData.connections.length) {
                    atom.userData.selected = false;
                    atom.material.emissive.setHex(atom.currentHex);
                }
            });
            this.selectedAtoms = this.selectedAtoms.filter((atom) => atom);

            this.measurementLabels.remove(label);
            this.angles.remove(this.currentSelectedLine);
            this.atomConnections.remove(connectionA);
            this.atomConnections.remove(connectionB);
            this.currentSelectedLine = null;
            this.render();
        }

        /**
         * Function that deletes connection between to atoms.
         */
        deleteConnection() {
            if (!this.currentSelectedLine) return;
            if (this.currentSelectedLine.name === ANGLE) {
                return this.deleteConnectionsUsingAngle();
            }

            this.selectedAtoms.forEach((atom, index) => {
                const atomConnections = atom.userData.connections;
                if (!atomConnections) return;
                const isAtomUseThisConnection = atomConnections.some(
                    (connection) => connection === this.currentSelectedLine.uuid,
                );
                if (isAtomUseThisConnection) {
                    atom.userData.connections = atomConnections.filter(
                        (connection) => connection !== this.currentSelectedLine.uuid,
                    );
                    this.selectedAtoms[index] = null;
                }
                if (!atom.userData.connections.length) {
                    atom.userData.selected = false;
                    atom.material.emissive.setHex(atom.currentHex);
                }
            });
            this.selectedAtoms = this.selectedAtoms.filter((atom) => atom);

            this.measurementLabels.remove(this.currentSelectedLine.userData.label);
            this.atomConnections.remove(this.currentSelectedLine);
            this.currentSelectedLine = null;
            this.render();
        }

        /**
         * Function that handles clicks on some connection between to atoms.
         * @Param intersectItem -> current selected connection
         */
        handleConnectionClick(intersectItem) {
            if (this.currentSelectedLine?.userData.selected) {
                this.currentSelectedLine.userData.selected = false;
                this.currentSelectedLine.material.color.setHex(this.currentSelectedLine.currentHex);
            }
            this.currentSelectedLine = intersectItem;
            this.currentSelectedLine.userData.selected = true;
            this.render();
        }

        /**
         * Function that handles clicks. This function updates mouse coordinates,
         * gets all intersected objects and apply logic according to object type or name.
         * @Param updateState -> function for updating state in React;
         * @Param event -> js DOM event
         */
        onClick(updateState, event) {
            this.checkMouseCoordinates(event);
            const atomGroup = this.getAtomGroups();
            const searchedIntersects = [...atomGroup];
            if (this.measurementSettings.isDistanceShown) {
                searchedIntersects.push(...this.atomConnections.children);
            }
            if (this.measurementSettings.isAnglesShown) {
                searchedIntersects.push(...this.angles.children);
            }
            const intersects = this.raycaster.intersectObjects(searchedIntersects, false);
            for (let i = 0; i < intersects.length; i++) {
                const intersectItem = intersects[i].object;

                if (
                    intersectItem.name === ATOM_CONNECTION_LINE_NAME ||
                    intersectItem.name === ANGLE
                ) {
                    if (this.selectedAtoms.length % 2 && this.measurementSettings.isDistanceShown) {
                        this.deSelectAtom(this.selectedAtoms[this.selectedAtoms.length - 1]);
                    }
                    this.handleConnectionClick(intersectItem);
                    break;
                }

                if (intersectItem.type === "Mesh") {
                    const isAlreadySelected = intersectItem.userData.selected;
                    if (this.measurementSettings.isDistanceShown)
                        this.addIfLastNotSame(intersectItem);
                    if (this.measurementSettings.isAnglesShown)
                        this.addIfTwoLastNotSame(intersectItem);
                    if (!isAlreadySelected) {
                        this.handleSetSelected(intersectItem);
                    }
                    if (this.shouldCalculateAngles()) {
                        const lastThreeselectedAtoms = this.selectedAtoms.slice(-3);
                        const lineA = this.drawLineBetweenAtoms(lastThreeselectedAtoms.slice(0, 2));
                        const lineB = this.drawLineBetweenAtoms(lastThreeselectedAtoms.slice(-2));
                        const angle = this.calculateAngleBetweenAtoms(lastThreeselectedAtoms);
                        this.drawAngleCurveAndText(lastThreeselectedAtoms, angle, [lineA, lineB]);
                        updateState({ angle });
                    }
                    if (this.shouldCalculateDistance()) {
                        const lastselectedAtoms = this.selectedAtoms.slice(-2);
                        const isPairAlreadyExist = this.checkAtomPairExistence(
                            this.selectedAtoms.slice(0, -2),
                            lastselectedAtoms,
                        );
                        if (!isPairAlreadyExist) {
                            this.drawLineBetweenAtoms(lastselectedAtoms);
                            const distance = this.calculateDistanceBetweenAtoms(lastselectedAtoms);
                            this.drawDistanceText(distance);
                            updateState({ distance });
                        }
                    }
                    break;
                }
            }
        }

        /**
         *
         * @param {Array} atomArray - array to be checked
         * @param {Array} param1 - atom pair to checked
         * @returns boolean value - true if atom pair is already exist in array.
         */
        checkAtomPairExistence(atomArray, [atomA, atomB]) {
            for (let i = 0; i < atomArray.length; i += 2) {
                const currentAtom = atomArray[i];
                const nextAtom = atomArray[i + 1];

                if (
                    (currentAtom.uuid === atomA.uuid && atomB.uuid === nextAtom.uuid) ||
                    (currentAtom.uuid === atomB.uuid && nextAtom.uuid === atomA.uuid)
                ) {
                    this.selectedAtoms.pop();
                    this.selectedAtoms.pop();
                    return true;
                }
            }

            return false;
        }

        shouldCalculateDistance() {
            return (
                this.selectedAtoms.length &&
                !(this.selectedAtoms.length % 2) &&
                this.measurementSettings.isDistanceShown
            );
        }

        shouldCalculateAngles() {
            return (
                this.selectedAtoms.length &&
                !(this.selectedAtoms.length % 3) &&
                this.measurementSettings.isAnglesShown
            );
        }

        /**
         * Function that used for getting control points that used for drawing curve line.
         * @param {Number} angle - angle value between atoms.
         */
        getDistanceToControlPointByAngle(angle) {
            return angle / 100 + MIN_ANGLE_POINTS_DISTANCE;
        }

        /**
         * Function that gets points for drawing curve line
         * @param atomPositions - positions of the atoms between we calculating an angle.
         * @param {Number} angle - angle value between atoms.
         */
        getPointsForAngleDraw(atomPositions, angle) {
            const [positionA, positionB, positionC] = atomPositions;
            const distanceToControlPoints = this.getDistanceToControlPointByAngle(angle);
            const firstPoint = this.getPointInBetweenByLength(
                positionB,
                positionA,
                MIN_ANGLE_POINTS_DISTANCE,
            );
            const lastPoint = this.getPointInBetweenByLength(
                positionB,
                positionC,
                MIN_ANGLE_POINTS_DISTANCE,
            );
            const firstPointControl = this.getPointInBetweenByLength(
                positionB,
                positionA,
                distanceToControlPoints,
            );
            const secondPointControl = this.getPointInBetweenByLength(
                positionB,
                positionC,
                distanceToControlPoints,
            );
            const centerControlPoint = this.getPointInBetweenByPercentage(
                firstPointControl,
                secondPointControl,
                0.5,
            );

            return [firstPoint, centerControlPoint, lastPoint];
        }

        /**
         * Function that draws curved line and angle value on it
         * @param atomGroup - positions of the atoms between we calculating an angle.
         * @param {Number} angle - angle value between atoms.
         * @param atomConnections - array of connections that connects atoms.
         */
        drawAngleCurveAndText(atomGroup, angle, atomConnections) {
            const atomPositions = atomGroup.map((atom) =>
                new THREE.Vector3().setFromMatrixPosition(atom.matrixWorld),
            );
            const anglePoints = this.getPointsForAngleDraw(atomPositions, angle);
            const curvedParams = new THREE.QuadraticBezierCurve3(...anglePoints);
            const points = curvedParams.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: this.settings.colors.amber });
            const lineToDraw = new THREE.Line(geometry, material);
            lineToDraw.name = ANGLE;
            lineToDraw.userData.atomConnections = atomConnections;
            this.drawAngleText(angle, anglePoints[1], lineToDraw);
            this.angles.add(lineToDraw);
            this.scene.add(this.angles);
            this.render();
        }

        /**
         * Function that find point between pointA and pointB that is situated on the length
         * @param pointA
         * @param pointB
         * @param length
         * @return point that is situated on the length between to vectors
         */
        getPointInBetweenByLength(pointA, pointB, length) {
            const dir = pointB.clone().sub(pointA).normalize().multiplyScalar(length);
            return pointA.clone().add(dir);
        }

        /**
         * Function that find point between pointA and pointB that is situated on the percentage length
         * @param pointA
         * @param pointB
         * @param length
         * @return point that is situated on the percentage length between to vectors
         */
        getPointInBetweenByPercentage(pointA, pointB, percentage) {
            let dir = pointB.clone().sub(pointA);
            const len = dir.length();
            dir = dir.normalize().multiplyScalar(len * percentage);
            return pointA.clone().add(dir);
        }

        /**
         * Function that draws angle text.
         * @param angle - angle value that should be rendered
         * @param position - position on which text should be rendered.
         * @param line - on which this text is rendered.
         */
        drawAngleText(angle, position, line) {
            const label = this.createLabelSprite(`${angle}º`, `label-for-${angle}`);
            line.userData.label = label;
            label.position.set(...position);
            label.visible = true;
            label.scale.set(0.75, 0.75, 0.75);
            this.measurementLabels.add(label);
            this.scene.add(this.measurementLabels);
            this.render();
        }

        /**
         * Function that draws distance text.
         * @param distance - distance value that should be rendered.
         */
        drawDistanceText(distance) {
            const label = this.createLabelSprite(
                `${distance.toFixed(3)}Å`,
                `label-for-${distance}`,
            );
            const atomConnections = this.atomConnections.children;
            const line = atomConnections[atomConnections.length - 1];
            line.userData.label = label;
            label.position.set(...line.geometry.boundingSphere.center);
            label.visible = true;
            label.scale.set(0.75, 0.75, 0.75);
            this.measurementLabels.add(label);
            this.scene.add(this.measurementLabels);
            this.render();
        }

        handleSetSelected(intersectItem) {
            intersectItem.userData.selected = true;
            intersectItem.material.emissive.setHex("0xff0000");
            this.render();
        }

        /**
         * Function that deselects atom if it's clicked second time.
         * @param atom - atom that should be deselected.
         */
        deSelectAtom(atom) {
            if (!atom.userData.connections?.length) {
                atom.userData.selected = false;
                this.selectedAtoms.pop();
                atom.material.emissive.setHex(atom.currentHex);
                this.render();
            }
        }

        /**
         * Function that adds atoms to selected array if this atom is not same as last added atoms
         * @param intersectedAtom - atom that should be added
         */
        addIfTwoLastNotSame(intersectedAtom) {
            if (this.selectedAtoms.length % 2 || this.selectedAtoms.length === 1) {
                return this.addIfLastNotSame(intersectedAtom);
            }

            const lastAtoms = this.selectedAtoms.slice(-2);
            const haveSameAtom = lastAtoms.some((atom) => atom.uuid === intersectedAtom.uuid);
            if (haveSameAtom) {
                return;
            }
            this.selectedAtoms.push(intersectedAtom);
        }

        /**
         * Function that adds atoms to selected array if this atom is same as last selected atom
         * @param intersectedAtom - atom that should be added
         */
        addIfLastNotSame(intersectedAtom) {
            const lastAtom = this.selectedAtoms[this.selectedAtoms.length - 1];
            if (lastAtom?.uuid === intersectedAtom.uuid && this.selectedAtoms.length % 2) {
                return this.deSelectAtom(lastAtom);
            }
            this.selectedAtoms.push(intersectedAtom);
        }

        /**
         * Function that adds connection between atoms
         * @param atom - atom to which connection should be added
         * @param {String} uuid - id of the connection.
         */
        addConnection(atom, uuid) {
            if (Array.isArray(atom.userData.connections)) {
                atom.userData.connections.push(uuid);
                return;
            }
            atom.userData.connections = [uuid];
        }

        drawLineBetweenAtoms(lastselectedAtoms) {
            const [firstAtom, secondAtom] = lastselectedAtoms;
            const [firstAtomPoint, secondAtomPoint] = this.getPointsFromMatrixWorld(
                firstAtom.matrixWorld,
                secondAtom.matrixWorld,
            );
            const geometry = new THREE.BufferGeometry().setFromPoints([
                firstAtomPoint,
                secondAtomPoint,
            ]);
            const material = new THREE.LineBasicMaterial({ color: this.settings.colors.amber });
            const line = new THREE.Line(geometry, material);
            this.addConnection(firstAtom, line.uuid);
            this.addConnection(secondAtom, line.uuid);
            line.userData.atoms = [firstAtom.uuid, secondAtom.uuid];
            line.name = ATOM_CONNECTION_LINE_NAME;
            this.atomConnections.add(line);
            this.scene.add(this.atomConnections);
            this.renderer.render(this.scene, this.camera);

            return line;
        }

        resetMeasurements() {
            if (this.measurementSettings && this.measurementSettings.isDistanceShown) {
                const connections = [...this.atomConnections.children];
                connections.forEach((connection) => {
                    this.currentSelectedLine = connection;
                    this.deleteConnection();
                });
            } else {
                const lines = [...this.angles.children];
                lines.forEach((line) => {
                    this.currentSelectedLine = line;
                    this.deleteConnection();
                });
            }

            if (this.selectedAtoms.length) {
                this.selectedAtoms.forEach((atom) => {
                    atom.userData.selected = false;
                    atom.material.emissive.setHex(atom.currentHex);
                });
                this.selectedAtoms = [];
            }
            this.render();
        }

        /**
         * Function that gets points that related to the world.
         * Used for duplicated atoms.
         * @param firstMatrix - point world matrix
         * @param secondMatrix - point world matrix
         */
        getPointsFromMatrixWorld(firstMatrix, secondMatrix) {
            const firstPoint = new THREE.Vector3().setFromMatrixPosition(firstMatrix);
            const secondPoint = new THREE.Vector3().setFromMatrixPosition(secondMatrix);

            return [firstPoint, secondPoint];
        }

        /**
         * Function used for calculating distance between 2 atoms.
         * @atoms - 2 atoms between which distance should be calculated.
         */
        calculateDistanceBetweenAtoms(atoms) {
            const [firstAtom, secondAtom] = atoms;
            const [firstAtomPoint, secondAtomPoint] = this.getPointsFromMatrixWorld(
                firstAtom.matrixWorld,
                secondAtom.matrixWorld,
            );
            const distance = firstAtomPoint.distanceTo(secondAtomPoint);

            return distance;
        }

        radiansToDegrees(radians) {
            return radians * (180 / Math.PI);
        }

        /**
         * Function used for calculating angle between 3 atoms.
         * @atoms - 3 atoms between which angle should be calculated.
         */
        calculateAngleBetweenAtoms(atoms) {
            const [firstAtom, centerAtom, lastAtom] = atoms;
            const ab = this.calculateDistanceBetweenAtoms([firstAtom, centerAtom]);
            const bc = this.calculateDistanceBetweenAtoms([centerAtom, lastAtom]);
            const ac = this.calculateDistanceBetweenAtoms([firstAtom, lastAtom]);
            const angle = (ab ** 2 + bc ** 2 - ac ** 2) / (2 * ab * bc);

            return this.radiansToDegrees(Math.acos(angle)).toFixed(2);
        }
    };
