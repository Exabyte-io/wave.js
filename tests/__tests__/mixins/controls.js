import {getWaveInstance} from "../../enums";
import {dispatchMouseDownMoveOrUpEvent, takeSnapshotAndAssertEqualityAsync} from "../../utils";

test('toggleAxes', async () => {
    const wave = getWaveInstance();
    wave.toggleAxes();
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "toggleAxes");
});

test('zoomIn', async () => {
    const wave = getWaveInstance();
    wave.toggleOrbitControls();
    wave.renderer.domElement.dispatchEvent(new WheelEvent('wheel', {deltaY: 1}));
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "zoomIn");
});

test('zoomOut', async () => {
    const wave = getWaveInstance();
    wave.toggleOrbitControls();
    wave.renderer.domElement.dispatchEvent(new WheelEvent('wheel', {deltaY: -1}));
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "zoomOut");
});

test('toggleTransformControls', async () => {
    const wave = getWaveInstance();
    wave.toggleTransformControls();
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "toggleTransformControls");
});

test('rotate', async () => {
    const wave = getWaveInstance();
    wave.toggleOrbitControls();
    dispatchMouseDownMoveOrUpEvent(wave.renderer.domElement, 'mousedown', 10, 10);
    // three-orbit-controls adds the mousemove/up handlers directly to the document!
    dispatchMouseDownMoveOrUpEvent(document, 'mousemove', 100, 10);
    dispatchMouseDownMoveOrUpEvent(document, 'mouseup', 100, 10);
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "rotate");
});
