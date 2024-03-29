import expect from "expect";
import * as THREE from "three";

import { ATOM_GROUP_NAME, COLORS } from "../../../src/enums";
import { getWaveInstance } from "../../enums";
import { getEventObjectBy3DPosition, makeClickOn3Atoms, makeClickOnTwoAtoms } from "../../utils";

describe("distance measurements", () => {
    let wave, atoms, camera, canvas;
    const stateUpdate = jest.fn();
    const measurementSettings = {
        isDistanceShown: true,
        isAnglesShown: false,
        measurementLabelsShown: false,
        distance: 0,
        angle: 0,
    };

    beforeEach(() => {
        wave = getWaveInstance();
        wave.initListeners(stateUpdate, measurementSettings);
        const atomGroup = wave.scene.getObjectByName(ATOM_GROUP_NAME);
        camera = wave.camera;
        canvas = wave.renderer.domElement;
        atoms = atomGroup.children.filter((object) => object.type === "Mesh");
    });

    afterEach(() => {
        wave.destroyListeners();
        wave.resetMeasurements();
    });

    test("onClick event for single atom", async () => {
        const event = getEventObjectBy3DPosition(atoms[1].position, camera, canvas);
        wave.onClick(stateUpdate, event);
        expect(wave.selectedAtoms.length).toEqual(1);
        expect(wave.selectedAtoms[0]).toEqual(atoms[1]);
    });

    test("onClick event for 2 atoms", async () => {
        const [atomA, atomB] = atoms;
        makeClickOnTwoAtoms(wave, atoms, stateUpdate);
        const { selectedAtoms, atomConnections, measurementLabels } = wave;

        expect(selectedAtoms.length).toEqual(2);
        expect(selectedAtoms[0]).toEqual(atomA);
        expect(selectedAtoms[1]).toEqual(atomB);
        expect(atomConnections.children.length).toEqual(1);
        expect(measurementLabels.children.length).toEqual(1);
    });

    test("onClick on connection line between atoms", async () => {
        makeClickOnTwoAtoms(wave, atoms, stateUpdate);
        const { atomConnections } = wave;
        const connection = atomConnections.children[0];
        const connectionClickEvent = getEventObjectBy3DPosition(
            connection.geometry.boundingSphere.center,
            camera,
            canvas,
        );
        wave.onClick(stateUpdate, connectionClickEvent);

        expect(connection.userData.selected).toBeTruthy();
        expect(wave.currentSelectedLine).toEqual(connection);
    });

    test("delete connection between 2 atoms", async () => {
        makeClickOnTwoAtoms(wave, atoms, stateUpdate);
        const { atomConnections } = wave;
        const connection = atomConnections.children[0];
        const connectionClickEvent = getEventObjectBy3DPosition(
            connection.geometry.boundingSphere.center,
            camera,
            canvas,
        );
        wave.onClick(stateUpdate, connectionClickEvent);
        wave.deleteConnection();

        expect(wave.selectedAtoms.length).toEqual(0);
        expect(wave.currentSelectedLine).toEqual(null);
        expect(atomConnections.children.length).toEqual(0);
    });

    test("full reset of measurements", async () => {
        makeClickOnTwoAtoms(wave, atoms, stateUpdate);
        const { atomConnections } = wave;
        const connection = atomConnections.children[0];
        const connectionClickEvent = getEventObjectBy3DPosition(
            connection.geometry.boundingSphere.center,
            camera,
            canvas,
        );
        wave.onClick(stateUpdate, connectionClickEvent);
        wave.resetMeasurements();

        expect(wave.selectedAtoms.length).toEqual(0);
        expect(wave.currentSelectedLine).toEqual(null);
        expect(atomConnections.children.length).toEqual(0);
    });

    test("onPointerMove event on atom", async () => {
        const event = getEventObjectBy3DPosition(atoms[1].position, camera, canvas);
        wave.onPointerMove(event);
        const color = atoms[1].material.emissive.getHex();

        expect(wave.selectedAtoms.length).toEqual(0);
        expect(color).toEqual(COLORS.RED);
    });

    test("should unset hex when pointer moves out of atom", async () => {
        const event = getEventObjectBy3DPosition(atoms[1].position, camera, canvas);
        const randomEvent = getEventObjectBy3DPosition(new THREE.Vector3(), camera, canvas);
        wave.onPointerMove(event);
        wave.onPointerMove(randomEvent);
        const { currentHex } = atoms[1];
        const color = atoms[1].material.emissive.getHex();

        expect(wave.selectedAtoms.length).toEqual(0);
        expect(color).toEqual(currentHex);
    });

    test("should unset selected atom if clicked again", async () => {
        const event = getEventObjectBy3DPosition(atoms[1].position, camera, canvas);
        wave.onClick(stateUpdate, event);
        wave.onClick(stateUpdate, event);
        const color = atoms[1].material.emissive.getHex();

        expect(wave.selectedAtoms.length).toEqual(0);
        expect(color).toEqual(0);
    });

    test("onPointerMove event on line", async () => {
        makeClickOnTwoAtoms(wave, atoms, stateUpdate);
        const { atomConnections } = wave;
        const connection = atomConnections.children[0];
        const connectionPointerMoveEvent = getEventObjectBy3DPosition(
            connection.geometry.boundingSphere.center,
            camera,
            canvas,
        );
        wave.onPointerMove(connectionPointerMoveEvent);
        const color = wave.atomConnections.children[0].material.color.getHex();

        expect(color).toEqual(COLORS.GREEN);
    });

    test("should correctly calculate the distance between atoms", async () => {
        const [atomA, atomB] = atoms;
        const expectedDistance = atomA.position.distanceTo(atomB.position);

        const receivedDistance = wave.calculateDistanceBetweenAtoms(atoms);
        expect(receivedDistance).toEqual(expectedDistance);
    });
});

describe("angles measurements", () => {
    let wave,
        atoms,
        camera,
        // eslint-disable-next-line no-unused-vars
        atomGroup,
        canvas;
    const stateUpdate = jest.fn();
    const measurementSettings = {
        isDistanceShown: false,
        isAnglesShown: true,
        measurementLabelsShown: false,
        distance: 0,
        angle: 0,
    };

    const repetitionSettings = {
        atomRadiiScale: 0.2,
        repetitionsAlongLatticeVectorA: 3,
        repetitionsAlongLatticeVectorB: 1,
        repetitionsAlongLatticeVectorC: 1,
    };

    beforeEach(() => {
        wave = getWaveInstance({ ...repetitionSettings });
        wave.initListeners(stateUpdate, measurementSettings);
        atomGroup = wave.scene.getObjectByName(ATOM_GROUP_NAME);
        camera = wave.camera;
        canvas = wave.renderer.domElement;
        atoms = wave.collectAllAtoms().slice(-3);
    });

    afterEach(() => {
        wave.destroyListeners();
        wave.resetMeasurements();
    });

    test("onClick event for 3 atoms", async () => {
        makeClickOn3Atoms(wave, atoms, stateUpdate);
        const { selectedAtoms, atomConnections, angles } = wave;

        expect(selectedAtoms.length).toEqual(3);
        expect(selectedAtoms).toEqual(atoms);
        expect(atomConnections.children.length).toEqual(2);
        expect(angles.children.length).toEqual(1);
    });

    test("onClick on angle line between atoms", async () => {
        makeClickOn3Atoms(wave, atoms, stateUpdate);
        const { angles } = wave;
        const angle = angles.children[0];
        const angleClickEvent = getEventObjectBy3DPosition(
            angle.geometry.boundingSphere.center,
            camera,
            canvas,
        );
        wave.onClick(stateUpdate, angleClickEvent);

        expect(angle.userData.selected).toBeTruthy();
        expect(wave.currentSelectedLine).toEqual(angle);
    });

    test("onPointerMove event on angle line", async () => {
        makeClickOn3Atoms(wave, atoms, stateUpdate);
        const { angles } = wave;
        const angle = angles.children[0];
        const anglePointerMoveEvent = getEventObjectBy3DPosition(
            angle.geometry.boundingSphere.center,
            camera,
            canvas,
        );
        wave.onPointerMove(anglePointerMoveEvent);
        const color = wave.angles.children[0].material.color.getHex();

        expect(color).toEqual(COLORS.GREEN);
    });

    test("should unset color when pointer moves out of line", async () => {
        makeClickOn3Atoms(wave, atoms, stateUpdate);
        const { angles } = wave;
        const angle = angles.children[0];
        const anglePointerMoveEvent = getEventObjectBy3DPosition(
            angle.geometry.boundingSphere.center,
            camera,
            canvas,
        );
        const randomPointerMoveEvent = getEventObjectBy3DPosition(
            new THREE.Vector3(),
            camera,
            canvas,
        );
        wave.onPointerMove(anglePointerMoveEvent);
        wave.onPointerMove(randomPointerMoveEvent);
        const { currentHex } = wave.angles.children[0];
        const color = wave.angles.children[0].material.color.getHex();

        expect(color).toEqual(currentHex);
    });
});
