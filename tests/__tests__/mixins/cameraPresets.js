import expect from "expect";
import * as THREE from "three";

import { getWaveInstance } from "../../enums";

/**
 * Camera presets (U-10). Exercised against a real Wave instance rather than a stub, so the cell
 * vectors, orbit controls and camera are the real objects the method mutates.
 */
describe("setCameraAlongCellVector", () => {
    let wave;

    beforeEach(() => {
        wave = getWaveInstance();
        // Orbit controls have to exist for a camera move to be meaningful.
        if (!wave.orbitControls) wave.initOrbitControls?.(true);
    });

    const directionFromTarget = () =>
        wave.camera.position.clone().sub(wave.orbitControls.target).normalize();

    const cellVector = (axis) => {
        const c = wave._cell;
        const raw = {
            a: [c.ax, c.ay, c.az],
            b: [c.bx, c.by, c.bz],
            c: [c.cx, c.cy, c.cz],
            111: [c.ax + c.bx + c.cx, c.ay + c.by + c.cy, c.az + c.bz + c.cz],
        }[axis];
        return new THREE.Vector3(...raw).normalize();
    };

    ["a", "b", "c", "111"].forEach((axis) => {
        it(`puts the camera on the ${axis} direction from the cell centre`, () => {
            wave.setCameraAlongCellVector(axis);
            const expected = cellVector(axis);
            const actual = directionFromTarget();
            // Same direction, to within float noise.
            expect(actual.dot(expected)).toBeCloseTo(1, 5);
        });
    });

    it("targets the cell centre, so the structure is framed rather than off to one side", () => {
        wave.setCameraAlongCellVector("a");
        const { center } = wave.getCellViewParams();
        expect(wave.orbitControls.target.x).toBeCloseTo(center[0], 6);
        expect(wave.orbitControls.target.y).toBeCloseTo(center[1], 6);
        expect(wave.orbitControls.target.z).toBeCloseTo(center[2], 6);
    });

    it("stands far enough back to see the cell", () => {
        wave.setCameraAlongCellVector("a");
        const distance = wave.camera.position.distanceTo(wave.orbitControls.target);
        const { maxSize } = wave.getCellViewParams();
        expect(distance).toBeGreaterThan(maxSize);
        expect(Number.isFinite(distance)).toBe(true);
    });

    it("produces no NaN in the camera transform", () => {
        wave.setCameraAlongCellVector("111");
        expect(wave.camera.position.toArray().every((v) => Number.isFinite(v))).toBe(true);
    });

    it("ignores an unknown axis rather than moving the camera somewhere arbitrary", () => {
        wave.setCameraAlongCellVector("a");
        const before = wave.camera.position.clone();
        wave.setCameraAlongCellVector("z");
        wave.setCameraAlongCellVector(undefined);
        expect(wave.camera.position.distanceTo(before)).toBeCloseTo(0, 9);
    });

    it("leaves the camera alone for a degenerate cell vector instead of emitting NaN", () => {
        wave.setCameraAlongCellVector("a");
        const before = wave.camera.position.clone();
        const cell = wave._cell;
        const saved = [cell.ax, cell.ay, cell.az];
        Object.assign(cell, { ax: 0, ay: 0, az: 0 });
        wave.setCameraAlongCellVector("a");
        expect(wave.camera.position.distanceTo(before)).toBeCloseTo(0, 9);
        [cell.ax, cell.ay, cell.az] = saved;
    });

    it("keeps working after the orthographic toggle, using the frustum for framing", () => {
        wave.toggleOrthographicCamera();
        expect(wave.isCameraOrthographic).toBe(true);
        wave.setCameraAlongCellVector("c");
        const expected = cellVector("c");
        expect(directionFromTarget().dot(expected)).toBeCloseTo(1, 5);
        expect(Number.isFinite(wave.camera.left)).toBe(true);
    });
});
