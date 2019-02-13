import {getWaveInstance} from "../../enums";
import {takeSnapshotAndAssertEquality} from "../../utils";

test('addAtom', async () => {
    const wave = getWaveInstance();
    wave.toggleMouseIntersection();
    wave["onUpdate"] = jest.fn();  // mock onUpdate
    wave.container.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150
    }));
    wave.container.dispatchEvent(new MouseEvent('contextmenu', {
        button: 2,
        clientX: 150,
        clientY: 150
    }));
    return takeSnapshotAndAssertEquality(wave.renderer.context, "addAtom");
});
