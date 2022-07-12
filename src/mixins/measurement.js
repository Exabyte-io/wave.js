/* eslint-disable class-methods-use-this */
import * as THREE from "three";
import {
    ATOM_GROUP_NAME,
    ATOM_CONNECTIONS_GROUP_NAME,
    ATOM_CONNECTION_LINE_NAME,
    MIN_ANGLE_POINTS_DISTANCE,
    MEASURE_LABELS_GROUP_NAME,
} from "../enums";

let clickFunction = null;
let pointerMoveFunction = null;

/*
 * Mixin containing the logic for dealing with measures.
 * Draws connections between atoms, calculate angles and distances, draws angles and labels.
 * Checks clicks and mouse movements.
 */
export const MeasurementMixin = (superclass) =>
    class extends superclass {
        constructor(config) {
            super(config);

            this.initRaycaster();
            this.chosenAtoms = [];
            this.intersected = null;

            this.atomConnections = new THREE.Group();
            this.angles = new THREE.Group();
            this.measureLabels = new THREE.Group();
            this.currentChosenConnection = null;

            this.atomConnections.name = ATOM_CONNECTIONS_GROUP_NAME;
            this.angles.name = "Angles";
            this.measureLabels.name = MEASURE_LABELS_GROUP_NAME;
        }

        destroyListeners() {
            document.removeEventListener("click", clickFunction);
            document.removeEventListener("mousemove", pointerMoveFunction);
        }

        /**
         * Function to initialize listeners for checking DOM events.
         * @param {Function} updateState - functions for updating data in react.
         * @param settings - measurements settings object, this object helps to define state in this class.
         */
        initListeners(updateState, settings) {
            this.measureSettings = settings;
            clickFunction = this.onClick.bind(this, updateState);
            pointerMoveFunction = this.onPointerMove.bind(this);

            document.addEventListener("click", clickFunction);
            document.addEventListener("mousemove", pointerMoveFunction);
        }

        /**
         * Function that initialize raycaster, this raycaster is used for checking on which atom you are clicking.
         * Also checking mousemove events
         */
        initRaycaster() {
            this.raycaster = new THREE.Raycaster();
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
        setHexForConnectionLine(intersectItem) {
            if (this.intersected !== intersectItem) {
                if (this.intersected) {
                    this.intersected.material.color.setHex(this.intersected.currentHex);
                }
                this.intersected = intersectItem;
                this.intersected.currentHex = this.intersected.material.color.getHex();
                this.intersected.material.color.setHex("0x00ff00");
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
                this.intersected.material.emissive.setHex("0xff0000");
                this.renderer.render(this.scene, this.camera);
            }
        }

        /**
         * Function set default color for connection.
         * Used for unsetting color when mouse is no longer points connection.
         */
        setDefaultHexForConnection() {
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
            if (this.intersected && !this.intersected.userData.chosen) {
                if (this.intersected.name === ATOM_CONNECTION_LINE_NAME) {
                    this.setDefaultHexForConnection();
                } else {
                    this.setDefaultHexForAtom();
                }
                this.render();
            }
        }

        /**
         * Function checks pointer movements
         * @Param event -> simple javascript DOM event
         */
        onPointerMove(event) {
            this.checkMouseCoordinates(event);
            const atomGroup = this.getAtomGroups();
            const searchedIntersects = [...atomGroup, ...this.atomConnections.children];
            const intersects = this.raycaster.intersectObjects(searchedIntersects, false);
            for (let i = 0; i < intersects.length; i++) {
                const intersectItem = intersects[i].object;
                if (!intersectItem.userData?.chosen) {
                    if (intersectItem.name === ATOM_CONNECTION_LINE_NAME) {
                        this.setHexForConnectionLine(intersectItem);
                        break;
                    }
                    if (intersectItem.type === "Mesh") {
                        this.setHexForAtom(intersectItem);
                        break;
                    }
                }
            }
            if (!intersects.length) {
                this.handleUnsetHex();
                this.intersected = null;
            }
        }

        /**
         * Function checks and updates mouse pointer coordinates
         * @Param event -> simple javascript DOM event
         */
        checkMouseCoordinates(event) {
            this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.pointer, this.camera);
        }

        /**
         * Function that deletes connection between to atoms.
         */
        deleteConnection() {
            this.chosenAtoms.forEach((atom) => {
                const atomConnections = atom.userData.connections;
                const isAtomUseThisConnection = atomConnections.some(
                    (connection) => connection === this.currentChosenConnection.uuid,
                );
                if (isAtomUseThisConnection) {
                    atom.userData.connections = atomConnections.filter(
                        (connection) => connection !== this.currentChosenConnection.uuid,
                    );
                }
                if (!atom.userData.connections.length) {
                    atom.userData.chosen = false;
                    atom.material.emissive.setHex(atom.currentHex);
                }
            });
            this.chosenAtoms = this.chosenAtoms.filter((atom) => atom.userData.chosen);
            if (this.measureSettings.isAnglesShown) {
                const angles = [...this.angles.children];
                angles.forEach((angle) => {
                    const isConnectedByCurrentConnection = angle.userData.atomConnections.some(
                        (connection) => connection.uuid === this.currentChosenConnection.uuid,
                    );
                    if (isConnectedByCurrentConnection) {
                        this.measureLabels.remove(angle.userData.label);
                        this.angles.remove(angle);
                    }
                });
            }
            this.measureLabels.remove(this.currentChosenConnection.userData.label);
            this.atomConnections.remove(this.currentChosenConnection);
            this.render();
        }

        /**
         * Function that handles clicks on some connection between to atoms.
         * @Param intersectItem -> current chosen connection
         */
        handleConnectionClick(intersectItem) {
            if (this.currentChosenConnection?.userData.chosen) {
                this.currentChosenConnection.userData.chosen = false;
            }
            this.currentChosenConnection = intersectItem;
            this.currentChosenConnection.userData.chosen = true;
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
            const searchedIntersects = [...atomGroup, ...this.atomConnections.children];
            const intersects = this.raycaster.intersectObjects(searchedIntersects, false);
            for (let i = 0; i < intersects.length; i++) {
                const intersectItem = intersects[i].object;

                if (intersectItem.name === ATOM_CONNECTION_LINE_NAME) {
                    this.handleConnectionClick(intersectItem);
                    break;
                }

                if (intersectItem.type === "Mesh") {
                    const isAlreadyChosen = intersectItem.userData.chosen;
                    if (this.measureSettings.isDistanceShown) this.addIfLastNotSame(intersectItem);
                    if (this.measureSettings.isAnglesShown) this.addIfTwoLastNotSame(intersectItem);
                    if (!isAlreadyChosen) {
                        this.handleSetChosen(intersectItem);
                    }
                    if (this.shouldCalculateAngles()) {
                        const lastThreeChosenAtoms = this.chosenAtoms.slice(-3);
                        const lineA = this.drawLineBetweenAtoms(lastThreeChosenAtoms.slice(0, 2));
                        const lineB = this.drawLineBetweenAtoms(lastThreeChosenAtoms.slice(-2));
                        const angle = this.calculateAngleBetweenAtoms(lastThreeChosenAtoms);
                        this.drawAngleCurveAndText(lastThreeChosenAtoms, angle, [lineA, lineB]);
                        updateState({ angle });
                    }
                    if (this.shouldCalculateDistance()) {
                        const lastChosenAtoms = this.chosenAtoms.slice(-2);
                        this.drawLineBetweenAtoms(lastChosenAtoms);
                        const distance = this.calculateDistanceBetweenAtoms(lastChosenAtoms);
                        this.drawDistanceText(distance);
                        updateState({ distance });
                    }
                    break;
                }
            }
        }

        shouldCalculateDistance() {
            return (
                this.chosenAtoms.length &&
                !(this.chosenAtoms.length % 2) &&
                this.measureSettings.isDistanceShown
            );
        }

        shouldCalculateAngles() {
            return (
                this.chosenAtoms.length &&
                !(this.chosenAtoms.length % 3) &&
                this.measureSettings.isAnglesShown
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
            const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
            const lineToDraw = new THREE.Line(geometry, material);
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
            const label = this.createLabelSprite(angle, `label-for-${angle}`);
            line.userData.label = label;
            label.position.set(...position);
            label.visible = true;
            label.scale.set(0.75, 0.75, 0.75);
            this.measureLabels.add(label);
            this.scene.add(this.measureLabels);
            this.render();
        }

        /**
         * Function that draws distance text.
         * @param distance - distance value that should be rendered.
         */
        drawDistanceText(distance) {
            const label = this.createLabelSprite(distance.toFixed(8), `label-for-${distance}`);
            const line = this.atomConnections.children.at(-1);
            line.userData.label = label;
            label.position.set(...line.geometry.boundingSphere.center);
            label.visible = true;
            label.scale.set(1, 1, 1);
            this.measureLabels.add(label);
            this.scene.add(this.measureLabels);
            this.render();
        }

        handleSetChosen(intersectItem) {
            intersectItem.userData.chosen = true;
            intersectItem.material.emissive.setHex("0xff0000");
            this.render();
        }

        /**
         * Function that unset chosen for atom if it's clicked second time.
         * @param atom - atom that should be unchosen
         */
        unChoseAtom(atom) {
            if (!atom.userData.connections?.length) {
                atom.userData.chosen = false;
                this.chosenAtoms.pop();
                atom.material.emissive.setHex(atom.currentHex);
            }
        }

        /**
         * Function that adds atoms to chosen array if this atom is not same as last added atoms
         * @param intersectedAtom - atom that should be added
         */
        addIfTwoLastNotSame(intersectedAtom) {
            if (this.chosenAtoms.length % 2 || this.chosenAtoms.length === 1) {
                return this.addIfLastNotSame(intersectedAtom);
            }

            const lastAtoms = this.chosenAtoms.slice(-2);
            const haveSameAtom = lastAtoms.some((atom) => atom.uuid === intersectedAtom.uuid);
            if (haveSameAtom) {
                return;
            }
            this.chosenAtoms.push(intersectedAtom);
        }

        /**
         * Function that adds atoms to chosen array if this atom is same as last chosen atom
         * @param intersectedAtom - atom that should be added
         */
        addIfLastNotSame(intersectedAtom) {
            const lastAtom = this.chosenAtoms.at(-1);
            if (lastAtom?.uuid === intersectedAtom.uuid && this.chosenAtoms.length % 2) {
                return this.unChoseAtom(lastAtom);
            }
            this.chosenAtoms.push(intersectedAtom);
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

        drawLineBetweenAtoms(lastChosenAtoms) {
            const [firstAtom, secondAtom] = lastChosenAtoms;
            const [firstAtomPoint, secondAtomPoint] = this.getPointsFromMatrixWorld(
                firstAtom.matrixWorld,
                secondAtom.matrixWorld,
            );
            const geometry = new THREE.BufferGeometry().setFromPoints([
                firstAtomPoint,
                secondAtomPoint,
            ]);
            const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
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

        resetMeasures() {
            const connections = [...this.atomConnections.children];
            connections.forEach((connection) => {
                this.currentChosenConnection = connection;
                this.deleteConnection();
            });
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
