import {getWaveInstance} from "../../enums";
import {takeSnapshotAndAssertEquality} from "../../utils";

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

    wave.renderer.domElement.dispatchEvent(new MouseEvent('mousedown', {
        button: 0,
        clientX: 10,
        clientY: 10
    }));

    // three-orbit-controls adds the mousemove/up handlers directly to the root element,
    // hence document.dispatchEvent instead of wave.renderer.domElement.dispatchEvent!
    document.dispatchEvent(new MouseEvent('mousemove', {
        button: 0,
        clientX: 100,
        clientY: 10,
    }));

    document.dispatchEvent(new MouseEvent('mouseup', {
        button: 0,
        clientX: 100,
        clientY: 10
    }));

    return takeSnapshotAndAssertEquality(wave.renderer.context, "rotate");
});
