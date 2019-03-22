import * as THREE from "three";

import {UtilsMixin} from "./utils";

/*
 * Mixin containing the logic for simple mouse movements/actions.
 * Tracks mouse position, initializes its projection onto 3D with Raycaster, and inits selection-related variables.
 * TODO: consider isolating selection, intersection related functionality to their corresponding mixins.
 */
export const MouseInitMixin = (superclass) => class extends superclass {

    constructor(config) {
        super(config);
        this.initMouse();

        this.setCursorStyle = this.setCursorStyle.bind(this);
    }

    initMouse() {
        this.initRaycaster();
        this.mouse = new THREE.Vector2();               // in pixels
        this.mouseNormalized = new THREE.Vector2();     // in normalized coordinates from (-1, to 1)
        this.setCursorStyle();
    }

    initRaycaster() {
        // Raycaster is used to project mouse position onto 3D
        this.raycaster = new THREE.Raycaster();
        this.SELECTED_OBJECTS = [];
    }

    /**
     * Returns targets for mouse selection. One or more of them are to be selected on mouse click and drag.
     * @return {Array}
     */
    get mouseSelectionTargets() {
        return this.structureGroup.children || [];
    }

    /**
     * Calculates current cursor position in pixels relative to the container element
     * @param {event} event - DOM Event
     * @param {Object} mousePointer - Object representing mouse position, example: {x: 0, y: 0}
     */
    setRelativeMousePosition(event, mousePointer) {
        const canvasPosition = this.renderer.domElement.getBoundingClientRect();
        mousePointer.x = (event.clientX - canvasPosition.left);
        mousePointer.y = (event.clientY - canvasPosition.top);
    }

    updateMouse(event) {
        event.preventDefault();
        this.setRelativeMousePosition(event, this.mouse);
        this.mouseNormalized.x = (this.mouse.x / this.WIDTH) * 2 - 1;
        this.mouseNormalized.y = -(this.mouse.y / this.HEIGHT) * 2 + 1;
    }

    addEventListenersBase() {
        this.updateMouseBound = e => this.updateMouse(e);
        this.container.addEventListener('mousemove', this.updateMouseBound, false);
    }

    /**
     * Sets mouse cursor type.
     * @param {String} cursorType - CSS Cursor attribute (https://developer.mozilla.org/en-US/docs/Web/CSS/cursor).
     */
    setCursorStyle(cursorType) {
        if (!cursorType) {
            this.container.style.cursor = this.container.style.previousCursor || "default";
        } else if (cursorType !== this.container.style.cursor) {  // avoid setting cursor to same value twice
            this.container.style.previousCursor = this.container.style.cursor;
            this.container.style.cursor = cursorType;
        }
    }

};

/*
 * Mixin containing the logic for mouse intersection with 3D objects.
 * Tracks the nearest (first) intersected object inside `this.INTERSECTED_OBJECT` variable.
 */
export const MouseIntersectMixin = (superclass) => MouseInitMixin(class extends superclass {

    constructor(config) {
        super(config);
        // initially no object is intersected
        this.INTERSECTED_OBJECT = null;
        this.addEventListenersIntersection = this.addEventListenersIntersection.bind(this);
        this.removeEventListenersIntersection = this.removeEventListenersIntersection.bind(this);
    }

    /**
     * Helper function to track the currently intersected object (by raycaster).
     * Highlights the latter object by changing its color.
     */
    updateIntersection() {
        this.raycaster.setFromCamera(this.mouseNormalized, this.camera);
        const intersects = this.raycaster.intersectObjects(this.mouseSelectionTargets);
        if (intersects.length > 0) {
            if (this.INTERSECTED_OBJECT !== intersects[0].object) {
                // reset the color first to avoid artifacts with multiple objects inside an intersection
                if (this.INTERSECTED_OBJECT) this.INTERSECTED_OBJECT.material.emissive.setHex(this.INTERSECTED_OBJECT.currentHex);
                this.INTERSECTED_OBJECT = intersects[0].object;
                this.INTERSECTED_OBJECT.currentHex = this.INTERSECTED_OBJECT.material.emissive.getHex();
                this.INTERSECTED_OBJECT.material.emissive.setHex(0xff0000);
            }
        } else {
            if (this.INTERSECTED_OBJECT) this.INTERSECTED_OBJECT.material.emissive.setHex(this.INTERSECTED_OBJECT.currentHex);
            this.INTERSECTED_OBJECT = null;
        }
        this.render();
    }

    onMouseMoveIntersection(event) {
        this.updateIntersection();
    }

    onMouseDownIntersection(event) {
        this.INTERSECTED_OBJECT && this.removeAtoms([this.INTERSECTED_OBJECT]);
    }

    onContextMenuIntersection(event) {
        event.preventDefault();
        this.addAtoms([{}]);
    }

    addEventListenersIntersection() {
        this.onMouseMoveIntersectionBound = e => this.onMouseMoveIntersection(e);
        this.onMouseDownIntersectionBound = e => this.onMouseDownIntersection(e);
        this.onContextMenuIntersectionBound = e => this.onContextMenuIntersection(e);

        // TODO: add listeners for touch events
        this.container.addEventListener('mousemove', this.onMouseMoveIntersectionBound, false);
        this.container.addEventListener('mousedown', this.onMouseDownIntersectionBound, false);
        this.container.addEventListener('contextmenu', this.onContextMenuIntersectionBound, false);
        this.setCursorStyle('pointer');
    }

    removeEventListenersIntersection() {
        const clsInstance = this;
        [
            {mousemove: clsInstance.onMouseMoveIntersectionBound},
            {mousedown: clsInstance.onMouseDownIntersectionBound},
            {contextmenu: clsInstance.onContextMenuIntersectionBound},
        ].map(o => this.container.removeEventListener(Object.keys(o)[0], Object.values(o)[0], false));
        this.setCursorStyle();
    }

});

/*
 * Mixin containing the logic for mouse selection with respect to 3D objects.
 * Uses a frustum to project a 2D selection onto 3D.
 * Tracks selected objects inside `this.SELECTED_OBJECTS` variable.
 * The logic for selection is implemented through a semi-transparent DOM Element `this.selectionContainer`.
 * Upon mouse click and drag the container is resized to highlight the current selection area.
 */
export const MouseSelectMixin = (superclass) => MouseInitMixin(class extends superclass {

    constructor(config) {
        super(config);
        this.SELECTED_OBJECTS = [];
        this.initSelection();
        this.addEventListenersSelection = this.addEventListenersSelection.bind(this);
        this.removeEventListenersSelection = this.removeEventListenersSelection.bind(this);
    }

    initSelection() {
        this.startMouse = new THREE.Vector2();  // to track where selection started
        // create rectangular selection element
        const selectionContainer = document.createElement("div");
        selectionContainer.setAttribute("class", "three-renderer-selection");
        this.selectionContainer = selectionContainer;
        this.container.appendChild(this.selectionContainer);

    }

    updateSelection(frustum) {
        // NOTE: intersectsObject could be used as well: https://threejs.org/docs/#api/math/Frustum
        this.SELECTED_OBJECTS = this.mouseSelectionTargets.filter(object => frustum.containsPoint(object.position));
        this.SELECTED_OBJECTS.forEach(o => {
            o.currentHex = o.material.emissive.getHex();
            o.material.emissive.setHex(0x0000ff);
        });
        this.render();
    }

    resetSelection() {
        this.SELECTED_OBJECTS.forEach(o => o.material.emissive.setHex(o.currentHex));
        this.SELECTED_OBJECTS = [];
        this.render();  // to reset colors for previously selected objects
    }

    /**
     * Project the 2D rectangular selection onto 3D.
     * @param {Number} x1 - Top left corner of selection, x coordinate.
     * @param {Number} x2 - Bottom right corner of selection, x coordinate.
     * @param {Number} y1 - Same as above for x1.
     * @param {Number} y2 - Same as above for x2.
     */
    makeSelection(x1, x2, y1, y2) {
        const rx1 = (x1 / this.WIDTH) * 2 - 1;
        const rx2 = (x2 / this.WIDTH) * 2 - 1;
        const ry1 = -(y1 / this.HEIGHT) * 2 + 1;
        const ry2 = -(y2 / this.HEIGHT) * 2 + 1;

        const projectionMatrix = new THREE.Matrix4();
        projectionMatrix.makePerspective(rx1, rx2, ry1, ry2, this.camera.near, this.camera.far);

        this.camera.updateMatrixWorld();
        this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);

        const viewProjectionMatrix = new THREE.Matrix4();
        viewProjectionMatrix.multiplyMatrices(projectionMatrix, this.camera.matrixWorldInverse);

        const frustum = new THREE.Frustum();
        frustum.setFromMatrix(viewProjectionMatrix);

        this.resetSelection();
        this.updateSelection(frustum);
    }

    /**
     * "Create" the selection DOM element based on current mouse position.
     * @param event
     */
    onMouseDownSelection(event) {
        this.resetSelection();
        this.selecting = true;
        this.setRelativeMousePosition(event, this.startMouse);
        const x1 = this.startMouse.x;
        const y1 = this.startMouse.y;
        Object.assign(this.selectionContainer.style, {
            left: x1 + "px",
            top: y1 + "px",
            width: "1px",
            height: "1px",
            visibility: "visible",
        });
    }

    /**
     * Update the size of the selection DOM element based on current mouse position.
     * @param event
     */
    onMouseMoveSelection(event) {
        if (!this.selecting) return;

        this.setRelativeMousePosition(event, this.mouse);

        const x1 = this.startMouse.x;
        const x2 = this.mouse.x;
        const y1 = this.startMouse.y;
        const y2 = this.mouse.y;

        Object.assign(this.selectionContainer.style, {
            left: Math.min(x1, x2) + "px",
            top: Math.min(y1, y2) + "px",
            width: Math.abs(x2 - x1) + "px",
            height: Math.abs(y2 - y1) + "px",
        });

        this.makeSelection(x1, x2, y1, y2);
    }

    /**
     * Hide selection element on mouse up.
     * @param event
     */
    onMouseUpSelection(event) {
        this.selecting = false;
        this.selectionContainer.style.visibility = "hidden";
    }

    addEventListenersSelection() {
        this.onMouseMoveSelectionBound = e => this.onMouseMoveSelection(e);
        this.onMouseDownSelectionBound = e => this.onMouseDownSelection(e);
        this.onMouseUpSelectionBound = e => this.onMouseUpSelection(e);

        // TODO: add listeners for touch events
        this.container.addEventListener('mousemove', this.onMouseMoveSelectionBound, false);
        this.container.addEventListener('mousedown', this.onMouseDownSelectionBound, false);
        this.container.addEventListener('mouseup', this.onMouseUpSelectionBound, false);
        this.setCursorStyle('crosshair');
    }

    removeEventListenersSelection() {
        const clsInstance = this;
        [
            {mousemove: clsInstance.onMouseMoveSelectionBound},
            {mousedown: clsInstance.onMouseUpSelectionBound},
            {mouseup: clsInstance.onMouseDownSelectionBound}
        ].map(o => this.container.removeEventListener(Object.keys(o)[0], Object.values(o)[0], false));
        this.setCursorStyle();
    }

});

/*
 * Mixin containing the logic for enabling/disabling mouse listeners.
 * Aggregates Selection and Intersection mixins. Includes a helper Utils Mixin.
 * Holds the current state for the mouse listeners - ie. selection/intersection enablement - and initializes the
 *  key event listeners for the triggers.
 */
export const MouseMixin = (superclass) => UtilsMixin(MouseSelectMixin(MouseIntersectMixin(class extends superclass {

    constructor(config) {
        super(config);
        this.initMouse();
        this.initMouseBooleans();
        this.initListenersSwitchFromKeyboard();

        this.getMouseState = this.getMouseState.bind(this);
        this.toggleMouseSelection = this.toggleMouseSelection.bind(this);
        this.toggleMouseIntersection = this.toggleMouseIntersection.bind(this);
    }

    initMouseBooleans() {
        this.isSelectionEnabled = false;
        this.isIntersectionEnabled = false;
    }

    getMouseState() {
        return {
            isSelectionEnabled: this.isSelectionEnabled,
            isIntersectionEnabled: this.isIntersectionEnabled,
        }
    }

    setMouseState(s = {}) {
        this.isSelectionEnabled = s.isSelectionEnabled || false;
        this.isIntersectionEnabled = s.isIntersectionEnabled || false;
    }

    toggleMouseSelection(skipStateUpdate = false) {
        const initialState = this.getMouseState();
        this.toggleBoolean("isSelectionEnabled", ["isIntersectionEnabled"]);
        !skipStateUpdate && this.updateMouseFromState(initialState, this.getMouseState());
    }

    toggleMouseIntersection(skipStateUpdate = false) {
        const initialState = this.getMouseState();
        this.toggleBoolean("isIntersectionEnabled", ["isSelectionEnabled"]);
        !skipStateUpdate && this.updateMouseFromState(initialState, this.getMouseState());
    }

    initListenersSwitchFromKeyboard() {

        this.addEventListenersBase();

        window.addEventListener('keydown', (event) => {

            const initialState = Object.assign({}, this.getMouseState());

            switch (event.keyCode) {
                case 83: // S
                    this.toggleMouseSelection(true);
                    break;
                case 73: // I
                    this.toggleMouseIntersection(true);
                    break;
                default:
                    this.setMouseState();
            }

            const finalState = this.getMouseState();
            this.updateMouseFromState(initialState, finalState);

        });
    }

    updateMouseFromState(initialState, finalState) {
        if (!this.areTwoObjectsShallowEqual(initialState, finalState)) {

            const diffObject = this.getTwoObjectsShallowDifferentKeys(initialState, finalState);

            diffObject.isSelectionEnabled &&
            (this.isSelectionEnabled ? this.addEventListenersSelection() : this.removeEventListenersSelection());

            diffObject.isIntersectionEnabled &&
            (this.isIntersectionEnabled ? this.addEventListenersIntersection() : this.removeEventListenersIntersection());
        }
        this.render();
    }

})));
