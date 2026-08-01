import expect from "expect";
import * as THREE from "three";

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

        const event1 = createMouseEventFromPosition(atomA.position, camera, canvas);
        distanceManager.onClick(stateUpdate, event1);

        const event2 = createMouseEventFromPosition(atomB.position, camera, canvas);
        distanceManager.onClick(stateUpdate, event2);

        const connection = distanceManager.linesManager.THREEGroup.children[0];

        const midpoint = new THREE.Vector3()
            .addVectors(atomA.position, atomB.position)
            .multiplyScalar(0.5);

        const connectionClickEvent = createMouseEventFromPosition(midpoint, camera, canvas);
        distanceManager.onClick(stateUpdate, connectionClickEvent);

        expect(connection.userData.selected).toBeTruthy();
        expect(distanceManager.currentSelectedLine).toEqual(connection);
    });

    test("delete connection between 2 atoms", async () => {
        const [atomA, atomB] = atoms;

        // Select two atoms to create a connection
        const event1 = createMouseEventFromPosition(atomA.position, camera, canvas);
        distanceManager.onClick(stateUpdate, event1);

        const event2 = createMouseEventFromPosition(atomB.position, camera, canvas);
        distanceManager.onClick(stateUpdate, event2);

        const midpoint = new THREE.Vector3()
            .addVectors(atomA.position, atomB.position)
            .multiplyScalar(0.5);

        const connectionClickEvent = createMouseEventFromPosition(midpoint, camera, canvas);
        distanceManager.onClick(stateUpdate, connectionClickEvent);

        distanceManager.deleteSelectedLine();

        expect(distanceManager.selectedAtoms.length).toEqual(0);
        expect(distanceManager.currentSelectedLine).toEqual(null);
    });

    test("full reset of measurements", async () => {
        const [atomA, atomB] = atoms;

        // Select two atoms to create a connection
        const event1 = createMouseEventFromPosition(atomA.position, camera, canvas);
        distanceManager.onClick(stateUpdate, event1);

        const event2 = createMouseEventFromPosition(atomB.position, camera, canvas);
        distanceManager.onClick(stateUpdate, event2);

        wave.resetAllMeasurements();
        const measurementGroup = wave.structureGroup.children[2].children;

        expect(distanceManager.selectedAtoms.length).toEqual(0);
        expect(distanceManager.currentSelectedLine).toEqual(null);
        expect(measurementGroup.length).toEqual(0);
    });

    test("onPointerMove event on atom", async () => {
        const activeManager = wave.getActiveMeasurementManager();
        const event = createMouseEventFromPosition(atoms[1].position, camera, canvas, "mousemove");
        activeManager.onPointerMove(event);

        expect(activeManager.intersectedObject).toEqual(atoms[1]);
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
        if (!global.navigator) {
            global.navigator = {};
        }
        global.navigator.clipboard = mockClipboard;

        wave = getWaveInstance({ ...repetitionSettings });
        wave.initializeMeasurementManagers(stateUpdate);
        wave.toggleMeasurementByType(MEASUREMENT_MODES.ANGLE, stateUpdate);

        angleManager = wave.getMeasurementManagerByType(MEASUREMENT_MODES.ANGLE);

        camera = wave.camera;
        canvas = wave.renderer.domElement;
        // getAtomGroups() (not collectAllAtoms()) is what the measurement feature itself uses
        // to let a user click a periodic repetition image, not just a base atom - matching that
        // is what makes this "3 atoms" from a 2-atom base material with repetitions enabled.
        atoms = wave.getAtomGroups().slice(-3);
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

    test("onClick event for 3 atoms", async () => {
        const activeManager = wave.getActiveMeasurementManager();

        for (let i = 0; i < 3; i++) {
            const event = createMouseEventFromPosition(atoms[i].position, camera, canvas);
            activeManager.onClick(stateUpdate, event);
        }

        expect(angleManager.selectedAtoms.length).toEqual(3);

        angleManager.selectedAtoms.forEach((atom) => {
            expect(atom.userData.selected).toBe(true);
        });

        const anglesMeasurementGroup = wave.structureGroup.children[2].children;

        expect(anglesMeasurementGroup.length).toEqual(2);

        const angles = angleManager.getAnglesFromSelectedAtoms();
        expect(angles.length).toEqual(1);
        expect(typeof angles[0]).toBe("number");
        expect(!Number.isNaN(angles[0])).toBe(true);
    });
});
