import {getWaveInstance} from "../../enums";
import {dispatchMouseEvent, takeSnapshotAndAssertEquality} from "../../utils";

test('toggleAxes', async () => {
    const wave = getWaveInstance();
    wave.toggleAxes();
    return takeSnapshotAndAssertEquality(wave.renderer.context, "toggleAxes");
});

test('zoomIn', async () => {
    const wave = getWaveInstance();
    wave.toggleOrbitControls();
    wave.renderer.domElement.dispatchEvent(new WheelEvent('wheel', {deltaY: 1}));
    return takeSnapshotAndAssertEquality(wave.renderer.context, "zoomIn");
});

test('zoomOut', async () => {
    const wave = getWaveInstance();
    wave.toggleOrbitControls();
    wave.renderer.domElement.dispatchEvent(new WheelEvent('wheel', {deltaY: -1}));
    return takeSnapshotAndAssertEquality(wave.renderer.context, "zoomOut");
});

test('toggleTransformControls', async () => {
    const wave = getWaveInstance();
    wave.toggleTransformControls();
    return takeSnapshotAndAssertEquality(wave.renderer.context, "toggleTransformControls");
});

test('rotate', async () => {
    const wave = getWaveInstance();
    wave.toggleOrbitControls();
    dispatchMouseEvent(wave.renderer.domElement, 'mousedown', 10, 10);
    // three-orbit-controls adds the mousemove/up handlers directly to the document!
    dispatchMouseEvent(document, 'mousemove', 100, 10);
    dispatchMouseEvent(document, 'mouseup', 100, 10);
    return takeSnapshotAndAssertEquality(wave.renderer.context, "rotate");
});
