import {getWaveInstance, HEIGHT, WIDTH} from "../../enums";
import {dispatchMouseEvent, takeSnapshotAndAssertEquality} from "../../utils";

test('addAtom', async () => {
    const wave = getWaveInstance();
    wave.toggleMouseIntersection();
    wave["onUpdate"] = jest.fn();  // mock onUpdate
    dispatchMouseEvent(wave.container, 'mousemove', 150, 150);
    dispatchMouseEvent(wave.container, 'contextmenu', 150, 150, 2);
    return takeSnapshotAndAssertEquality(wave.renderer.context, "addAtom");
});

test('removeAtom', async () => {
    const wave = getWaveInstance();
    wave.toggleMouseIntersection();
    wave["onUpdate"] = jest.fn();  // mock onUpdate
    dispatchMouseEvent(wave.container, 'mousemove', WIDTH / 2, HEIGHT / 2);
    dispatchMouseEvent(wave.container, 'mousedown', WIDTH / 2, HEIGHT / 2);
    return takeSnapshotAndAssertEquality(wave.renderer.context, "removeAtom");
});
