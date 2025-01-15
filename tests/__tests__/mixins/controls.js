import { getWaveInstance } from "../../enums";
import { dispatchMouseDownMoveOrUpEvent, takeSnapshotAndAssertEqualityAsync } from "../../utils";

test("toggleAxes", async () => {
    const wave = getWaveInstance();
    wave.toggleAxes();
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "toggleAxes");
});

test("zoomIn", async () => {
    const wave = getWaveInstance();
    wave.toggleOrbitControls();
    wave.renderer.domElement.dispatchEvent(new WheelEvent("wheel", { deltaY: 1 }));
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "zoomIn");
});

test("zoomOut", async () => {
    const wave = getWaveInstance();
    wave.toggleOrbitControls();
    wave.renderer.domElement.dispatchEvent(new WheelEvent("wheel", { deltaY: -1 }));
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "zoomOut");
});

// The mouse event logic of this test is incorrect. It should be fixed.
test.skip("rotate", async () => {
    const wave = getWaveInstance();
    wave.toggleOrbitControls();
    dispatchMouseDownMoveOrUpEvent(wave.renderer.domElement, "mousedown", 10, 10);
    // three-orbit-controls adds the mousemove/up handlers directly to the document!
    dispatchMouseDownMoveOrUpEvent(document, "mousemove", 100, 10);
    dispatchMouseDownMoveOrUpEvent(document, "mouseup", 100, 10);
    return takeSnapshotAndAssertEqualityAsync(wave.renderer.getContext(), "rotate");
});
