import * as THREE from "three";
/**
 * Mixin providing rubber-band marquee selection for InteractiveStructureEditorMixin: pressing
 * down on empty space in edit mode and dragging past the click/drag threshold draws a
 * screen-space rectangle and selects every atom whose projected position falls inside it on
 * release. Composed alongside InteractiveStructureEditorMixin (which owns the pointer capture
 * handlers that call into this mixin's updateMarqueeState_/finishMarqueeSelection_) and shares
 * its `this` - selectedMeshes_, setSelectedAtomMeshes, collectSelectableAtoms, etc. all live on
 * the base mixin.
 */
export declare const MarqueeSelectionMixin: (superclass: any) => {
    new (config: any): {
        [x: string]: any;
        marqueeStartScreen_: {
            x: number;
            y: number;
        } | null;
        isMarqueeSelecting_: boolean;
        marqueeOverlayElement_: HTMLDivElement | null;
        marqueeModifierAdd_: boolean;
        marqueeModifierToggle_: boolean;
        /**
         * Grows the marquee's screen-space rectangle as the pointer moves, activating it (and
         * showing the overlay) only once the drag exceeds the same click-vs-drag threshold used
         * for atom dragging, so a plain click on empty space still falls through to
         * finishMarqueeSelection_'s deselect path instead of drawing a zero-size box.
         */
        updateMarqueeState_(event: PointerEvent): void;
        showMarqueeOverlay_(): void;
        updateMarqueeOverlay_(currentX: number, currentY: number): void;
        hideMarqueeOverlay_(): void;
        /**
         * Returns every atom whose projected screen position falls within the given
         * (unordered) screen-space rectangle. Atoms behind the camera (or beyond the far
         * plane) are excluded via the projected z check.
         */
        getAtomsInScreenRect_(rect: {
            left: number;
            right: number;
            top: number;
            bottom: number;
        }): THREE.Mesh[];
        /**
         * Resolves a completed (or abandoned) marquee gesture. A release before crossing the
         * drag threshold is just a plain click on empty space, so it falls through to the
         * existing handlePointerDown click-to-deselect/select path rather than selecting an
         * empty rectangle.
         */
        finishMarqueeSelection_(event: PointerEvent): void;
    };
    [x: string]: any;
};
