import expect from "expect";

import { ATOM_GROUP_NAME, MEASUREMENT_MODES } from "../../../src/enums";
import { getWaveInstance } from "../../enums";
import { createMouseEventFromPosition } from "../../utils";

// Mock clipboard API for tests
const mockClipboard = {
    writeText: jest.fn(() => Promise.resolve()),
};

// Store original clipboard if it exists
const originalClipboard = global.navigator?.clipboard;

// Helper to click on two atoms using our new approach
function clickOnTwoAtoms(manager, stateUpdate, atoms, camera, canvas) {
    const [atomA, atomB] = atoms;
    const event1 = createMouseEventFromPosition(atomA.position, camera, canvas);
    const event2 = createMouseEventFromPosition(atomB.position, camera, canvas);

    manager.onClick(stateUpdate, event1);
    manager.onClick(stateUpdate, event2);
}

describe("distance measurements", () => {
    let wave, atoms, camera, canvas, distanceManager;
    const stateUpdate = jest.fn();

    beforeEach(() => {
        if (!global.navigator) {
            global.navigator = {};
        }
        global.navigator.clipboard = mockClipboard;

        wave = getWaveInstance();
        wave.initializeMeasurementManagers(stateUpdate);

        wave.toggleMeasurementByType(MEASUREMENT_MODES.DISTANCE, stateUpdate);
        distanceManager = wave.getMeasurementManagerByType(MEASUREMENT_MODES.DISTANCE);

        const atomGroup = wave.scene.getObjectByName(ATOM_GROUP_NAME);
        camera = wave.camera;
        canvas = wave.renderer.domElement;
        atoms = atomGroup.children.filter((object) => object.type === "Mesh");
    });

    afterEach(() => {
        wave.resetAllMeasurements();

        if (originalClipboard) {
            global.navigator.clipboard = originalClipboard;
        } else {
            delete global.navigator.clipboard;
        }

        mockClipboard.writeText.mockClear();
    });

    test("onClick event for single atom", async () => {
        const event = createMouseEventFromPosition(atoms[1].position, camera, canvas);
        const activeManager = wave.getActiveMeasurementManager();
        activeManager.onClick(stateUpdate, event);

        expect(distanceManager.selectedAtoms.length).toEqual(1);
        expect(distanceManager.selectedAtoms[0]).toEqual(atoms[1]);
    });

    test("onClick event for 2 atoms", async () => {
        const [atomA, atomB] = atoms;
        const activeManager = wave.getActiveMeasurementManager();

        const event1 = createMouseEventFromPosition(atomA.position, camera, canvas);
        activeManager.onClick(stateUpdate, event1);

        const event2 = createMouseEventFromPosition(atomB.position, camera, canvas);
        activeManager.onClick(stateUpdate, event2);

        expect(distanceManager.selectedAtoms.length).toEqual(2);
        expect(distanceManager.selectedAtoms[0]).toEqual(atomA);
        expect(distanceManager.selectedAtoms[1]).toEqual(atomB);
        expect(distanceManager.linesManager.THREEGroup.children.length).toEqual(1);
    });

    test("onClick on connection line between atoms", async () => {
        const [atomA, atomB] = atoms;

        // Select two atoms to create a connection
        const event1 = getEventObjectBy3DPosition(atomA.position, camera, canvas);
        distanceManager.onClick(stateUpdate, event1);

        const event2 = getEventObjectBy3DPosition(atomB.position, camera, canvas);
        distanceManager.onClick(stateUpdate, event2);

        // Get the created connection line
        const connection = distanceManager.linesManager.group.children[0];
        const connectionClickEvent = getEventObjectBy3DPosition(
            connection.geometry.boundingSphere.center,
            camera,
            canvas,
        );
        distanceManager.onClick(stateUpdate, connectionClickEvent);

        expect(connection.userData.selected).toBeTruthy();
        expect(distanceManager.currentSelectedLine).toEqual(connection);
    });

    test("delete connection between 2 atoms", async () => {
        const [atomA, atomB] = atoms;

        // Select two atoms to create a connection
        const event1 = getEventObjectBy3DPosition(atomA.position, camera, canvas);
        distanceManager.onClick(stateUpdate, event1);

        const event2 = getEventObjectBy3DPosition(atomB.position, camera, canvas);
        distanceManager.onClick(stateUpdate, event2);

        // Get the created connection line and click on it
        const connection = distanceManager.linesManager.group.children[0];
        const connectionClickEvent = getEventObjectBy3DPosition(
            connection.geometry.boundingSphere.center,
            camera,
            canvas,
        );
        distanceManager.onClick(stateUpdate, connectionClickEvent);

        // Delete the connection
        distanceManager.deleteConnection();

        expect(distanceManager.selectedAtoms.length).toEqual(0);
        expect(distanceManager.currentSelectedLine).toEqual(null);
        expect(distanceManager.linesManager.group.children.length).toEqual(0);
    });

    test("full reset of measurements", async () => {
        const [atomA, atomB] = atoms;

        // Select two atoms to create a connection
        const event1 = getEventObjectBy3DPosition(atomA.position, camera, canvas);
        distanceManager.onClick(stateUpdate, event1);

        const event2 = getEventObjectBy3DPosition(atomB.position, camera, canvas);
        distanceManager.onClick(stateUpdate, event2);

        // Reset measurements
        distanceManager.resetMeasurements();

        expect(distanceManager.selectedAtoms.length).toEqual(0);
        expect(distanceManager.currentSelectedLine).toEqual(null);
        expect(distanceManager.linesManager.group.children.length).toEqual(0);
    });

    test("onPointerMove event on atom", async () => {
        const activeManager = wave.getActiveMeasurementManager();

        // Move pointer over atom
        const event = createMouseEventFromPosition(atoms[1].position, camera, canvas, "mousemove");
        activeManager.onPointerMove(event);

        // Check if atom is intersected
        expect(activeManager.intersectedAtom).toEqual(atoms[1]);
    });

    test("should correctly calculate the distance between atoms", async () => {
        const [atomA, atomB] = atoms;
        const activeManager = wave.getActiveMeasurementManager();
        const expectedDistance = atomA.position.distanceTo(atomB.position);

        // Select the atoms
        clickOnTwoAtoms(activeManager, stateUpdate, [atomA, atomB], camera, canvas);

        // Calculate the distance
        const distances = distanceManager.getLineLengthsFromSelectedAtoms();

        expect(distances[0]).toBeCloseTo(expectedDistance);
    });
});

describe("angles measurements", () => {
    let wave, atoms, camera, canvas, angleManager;
    const stateUpdate = jest.fn();

    const repetitionSettings = {
        atomRadiiScale: 0.2,
        repetitionsAlongLatticeVectorA: 3,
        repetitionsAlongLatticeVectorB: 1,
        repetitionsAlongLatticeVectorC: 1,
    };

    beforeEach(() => {
        wave = getWaveInstance({ ...repetitionSettings });
        wave.initializeMeasurementManagers(stateUpdate);

        // Get and activate the angle measurement manager
        angleManager = wave.getMeasurementManagerByType(MEASUREMENT_MODES.ANGLE);
        wave.toggleMeasurementByType(MEASUREMENT_MODES.ANGLE, stateUpdate);

        camera = wave.camera;
        canvas = wave.renderer.domElement;
        atoms = wave.collectAllAtoms().slice(-3);
    });

    afterEach(() => {
        wave.resetAllMeasurements();
    });

    test("onClick event for 3 atoms", async () => {
        // Click on each of the 3 atoms
        for (let i = 0; i < 3; i++) {
            const event = getEventObjectBy3DPosition(atoms[i].position, camera, canvas);
            angleManager.onClick(stateUpdate, event);
        }

        expect(angleManager.selectedAtoms.length).toEqual(3);
        expect(angleManager.selectedAtoms).toEqual(atoms);
        expect(angleManager.linesManager.group.children.length).toEqual(2);
        expect(angleManager.angleArcObjects.length).toEqual(1);
    });

    test("onClick on angle arc between atoms", async () => {
        // Click on each of the 3 atoms to create an angle
        for (let i = 0; i < 3; i++) {
            const event = getEventObjectBy3DPosition(atoms[i].position, camera, canvas);
            angleManager.onClick(stateUpdate, event);
        }

        // Get the angle arc and click on it
        const angleArc = angleManager.angleArcObjects[0];
        const angleClickEvent = getEventObjectBy3DPosition(angleArc.position, camera, canvas);
        angleManager.onClick(stateUpdate, angleClickEvent);

        expect(angleArc.userData.selected).toBeTruthy();
        expect(angleManager.currentSelectedLine).toEqual(angleArc);
    });

    test("onPointerMove event on angle arc", async () => {
        // Click on each of the 3 atoms to create an angle
        for (let i = 0; i < 3; i++) {
            const event = getEventObjectBy3DPosition(atoms[i].position, camera, canvas);
            angleManager.onClick(stateUpdate, event);
        }

        // Move pointer over the angle arc
        const angleArc = angleManager.angleArcObjects[0];
        const anglePointerMoveEvent = getEventObjectBy3DPosition(angleArc.position, camera, canvas);
        angleManager.onPointerMove(anglePointerMoveEvent);

        const color = angleArc.material.color.getHex();
        expect(color).toEqual(COLORS.GREEN);
    });

    test("should unset color when pointer moves out of angle arc", async () => {
        // Click on each of the 3 atoms to create an angle
        for (let i = 0; i < 3; i++) {
            const event = getEventObjectBy3DPosition(atoms[i].position, camera, canvas);
            angleManager.onClick(stateUpdate, event);
        }

        // Move pointer over and then away from the angle arc
        const angleArc = angleManager.angleArcObjects[0];
        const anglePointerMoveEvent = getEventObjectBy3DPosition(angleArc.position, camera, canvas);
        const randomPointerMoveEvent = getEventObjectBy3DPosition(
            new THREE.Vector3(),
            camera,
            canvas,
        );
        angleManager.onPointerMove(anglePointerMoveEvent);
        angleManager.onPointerMove(randomPointerMoveEvent);

        const { currentHex } = angleArc;
        const color = angleArc.material.color.getHex();

        expect(color).toEqual(currentHex);
    });
});
