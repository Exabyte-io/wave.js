import {getWaveInstance, HEIGHT, WIDTH} from "../../enums";
import {dispatchMouseDownMoveOrUpEvent, takeSnapshotAndAssertEquality} from "../../utils";

test('addAtom', async () => {
    const wave = getWaveInstance();
    wave.toggleMouseIntersection();
    wave["onUpdate"] = jest.fn();  // mock onUpdate callback
    // move the mouse to click point (150, 150)
    dispatchMouseDownMoveOrUpEvent(wave.container, 'mousemove', 150, 150);
    // right click to add a new atom
    dispatchMouseDownMoveOrUpEvent(wave.container, 'contextmenu', 150, 150, 2);
    return takeSnapshotAndAssertEquality(wave.renderer.context, "addAtom");
});

test('removeAtom', async () => {
    const wave = getWaveInstance();
    wave.toggleMouseIntersection();
    wave["onUpdate"] = jest.fn();  // mock onUpdate callback
    // move the mouse to click point (center of the canvas where there is an atom)
    dispatchMouseDownMoveOrUpEvent(wave.container, 'mousemove', WIDTH / 2, HEIGHT / 2);
    // left click to remove the atom
    dispatchMouseDownMoveOrUpEvent(wave.container, 'mousedown', WIDTH / 2, HEIGHT / 2);
    return takeSnapshotAndAssertEquality(wave.renderer.context, "removeAtom");
});
