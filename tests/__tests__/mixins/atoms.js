import {getWaveInstance, HEIGHT, WIDTH} from "../../enums";
import {dispatchMouseDownMoveOrUpEvent, takeSnapshotAndAssertEqualityAsync} from "../../utils";

test('addAtom', async () => {
    const wave = getWaveInstance();
    wave.toggleMouseIntersection();
    wave["onUpdate"] = jest.fn();  // mock onUpdate callback
    // move the mouse to click point (close to center of the canvas)
    dispatchMouseDownMoveOrUpEvent(wave.container, 'mousemove', (WIDTH / 2) - 20, (HEIGHT / 2) - 20);
    // right click to add a new atom
    dispatchMouseDownMoveOrUpEvent(wave.container, 'contextmenu', (WIDTH / 2) - 20, (HEIGHT / 2) - 20, 2);
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "addAtom");
});

test('removeAtom', async () => {
    const wave = getWaveInstance();
    wave.toggleMouseIntersection();
    wave["onUpdate"] = jest.fn();  // mock onUpdate callback
    // move the mouse to click point (center of the canvas where there is an atom)
    dispatchMouseDownMoveOrUpEvent(wave.container, 'mousemove', WIDTH / 2, HEIGHT / 2);
    // left click to remove the atom
    dispatchMouseDownMoveOrUpEvent(wave.container, 'mousedown', WIDTH / 2, HEIGHT / 2);
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "removeAtom");
});
