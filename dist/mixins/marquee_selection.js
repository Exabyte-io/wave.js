import { DRAG_THRESHOLD_PX } from "./interactive_editor_constants";
const MARQUEE_FILL_COLOR = "rgba(84, 174, 255, 0.15)";
const MARQUEE_BORDER_COLOR = "#54aeff";
/**
 * Mixin providing rubber-band marquee selection for InteractiveStructureEditorMixin: pressing
 * down on empty space in edit mode and dragging past the click/drag threshold draws a
 * screen-space rectangle and selects every atom whose projected position falls inside it on
 * release. Composed alongside InteractiveStructureEditorMixin (which owns the pointer capture
 * handlers that call into this mixin's updateMarqueeState_/finishMarqueeSelection_) and shares
 * its `this` - selectedMeshes_, setSelectedAtomMeshes, collectSelectableAtoms, etc. all live on
 * the base mixin.
 */
export const MarqueeSelectionMixin = (superclass) => class extends superclass {
    constructor(config) {
        super(config);
        this.marqueeStartScreen_ = null;
        this.isMarqueeSelecting_ = false;
        this.marqueeOverlayElement_ = null;
        this.marqueeModifierAdd_ = false;
        this.marqueeModifierToggle_ = false;
    }
    /**
     * Grows the marquee's screen-space rectangle as the pointer moves, activating it (and
     * showing the overlay) only once the drag exceeds the same click-vs-drag threshold used
     * for atom dragging, so a plain click on empty space still falls through to
     * finishMarqueeSelection_'s deselect path instead of drawing a zero-size box.
     */
    updateMarqueeState_(event) {
        if (!this.marqueeStartScreen_)
            return;
        const distance = Math.sqrt((event.clientX - this.marqueeStartScreen_.x) ** 2 +
            (event.clientY - this.marqueeStartScreen_.y) ** 2);
        if (!this.isMarqueeSelecting_) {
            if (distance < DRAG_THRESHOLD_PX)
                return;
            this.isMarqueeSelecting_ = true;
            this.showMarqueeOverlay_();
        }
        this.updateMarqueeOverlay_(event.clientX, event.clientY);
    }
    showMarqueeOverlay_() {
        if (!this.marqueeOverlayElement_) {
            const element = document.createElement("div");
            element.style.position = "absolute";
            element.style.border = `1px solid ${MARQUEE_BORDER_COLOR}`;
            element.style.backgroundColor = MARQUEE_FILL_COLOR;
            element.style.pointerEvents = "none";
            element.style.zIndex = "10";
            this.container.appendChild(element);
            this.marqueeOverlayElement_ = element;
        }
        this.marqueeOverlayElement_.style.display = "block";
        if (this.marqueeStartScreen_) {
            this.updateMarqueeOverlay_(this.marqueeStartScreen_.x, this.marqueeStartScreen_.y);
        }
    }
    updateMarqueeOverlay_(currentX, currentY) {
        if (!this.marqueeOverlayElement_ || !this.marqueeStartScreen_)
            return;
        const containerRect = this.container.getBoundingClientRect();
        const left = Math.min(this.marqueeStartScreen_.x, currentX) - containerRect.left;
        const top = Math.min(this.marqueeStartScreen_.y, currentY) - containerRect.top;
        const width = Math.abs(currentX - this.marqueeStartScreen_.x);
        const height = Math.abs(currentY - this.marqueeStartScreen_.y);
        this.marqueeOverlayElement_.style.left = `${left}px`;
        this.marqueeOverlayElement_.style.top = `${top}px`;
        this.marqueeOverlayElement_.style.width = `${width}px`;
        this.marqueeOverlayElement_.style.height = `${height}px`;
    }
    hideMarqueeOverlay_() {
        if (this.marqueeOverlayElement_)
            this.marqueeOverlayElement_.style.display = "none";
    }
    /**
     * Returns every atom whose projected screen position falls within the given
     * (unordered) screen-space rectangle. Atoms behind the camera (or beyond the far
     * plane) are excluded via the projected z check.
     */
    getAtomsInScreenRect_(rect) {
        const boundingRectangle = this.renderer.domElement.getBoundingClientRect();
        return this.collectSelectableAtoms().filter((atom) => {
            const projected = atom.position.clone().project(this.camera);
            if (projected.z < -1 || projected.z > 1)
                return false;
            const screenX = boundingRectangle.left + ((projected.x + 1) / 2) * boundingRectangle.width;
            const screenY = boundingRectangle.top + ((1 - projected.y) / 2) * boundingRectangle.height;
            return (screenX >= rect.left &&
                screenX <= rect.right &&
                screenY >= rect.top &&
                screenY <= rect.bottom);
        });
    }
    /**
     * Resolves a completed (or abandoned) marquee gesture. A release before crossing the
     * drag threshold is just a plain click on empty space, so it falls through to the
     * existing handlePointerDown click-to-deselect/select path rather than selecting an
     * empty rectangle.
     */
    finishMarqueeSelection_(event) {
        const wasSelecting = this.isMarqueeSelecting_;
        const startScreen = this.marqueeStartScreen_;
        const addModifier = this.marqueeModifierAdd_;
        const toggleModifier = this.marqueeModifierToggle_;
        this.hideMarqueeOverlay_();
        this.marqueeStartScreen_ = null;
        this.isMarqueeSelecting_ = false;
        if (!wasSelecting || !startScreen) {
            this.handlePointerDown(event);
            return;
        }
        const rect = {
            left: Math.min(startScreen.x, event.clientX),
            right: Math.max(startScreen.x, event.clientX),
            top: Math.min(startScreen.y, event.clientY),
            bottom: Math.max(startScreen.y, event.clientY),
        };
        const hits = this.getAtomsInScreenRect_(rect);
        let nextSelection;
        if (toggleModifier) {
            const hitSet = new Set(hits);
            const kept = this.selectedMeshes_.filter((mesh) => !hitSet.has(mesh));
            const added = hits.filter((mesh) => !this.selectedMeshes_.includes(mesh));
            nextSelection = [...kept, ...added];
        }
        else if (addModifier) {
            const added = hits.filter((mesh) => !this.selectedMeshes_.includes(mesh));
            nextSelection = [...this.selectedMeshes_, ...added];
        }
        else {
            nextSelection = hits;
        }
        this.setSelectedAtomMeshes(nextSelection);
        if (this.settings.onSelectionChanged) {
            this.settings.onSelectionChanged(nextSelection.map((mesh) => mesh.userData.atomicIndex));
        }
        this.render();
    }
};
