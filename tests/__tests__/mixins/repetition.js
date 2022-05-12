import { getWaveInstance } from "../../enums";
import { takeSnapshotAndAssertEqualityAsync } from "../../utils";

describe('Screen tests for axes', () => {
    const settings = {
        atomRadiiScale: 0.2,
        repetitions: 3,
    }
    test('XYZ axis', () => {
        const wave = getWaveInstance(settings);
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "XYZAxis");
    })
    test('X axis', () => {
        const wave = getWaveInstance({ ...settings, axisOfRepetitions: 'X' });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "XAxis");
    })
    test('Y axis', () => {
        const wave = getWaveInstance({ ...settings, axisOfRepetitions: 'Y' });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "YAxis");
    })
    test('Z axis', () => {
        const wave = getWaveInstance({ ...settings, axisOfRepetitions: 'Z' });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "ZAxis");
    })
    test('XY axis', () => {
        const wave = getWaveInstance({ ...settings, axisOfRepetitions: 'XY' });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "XYAxis");
    })
    test('XZ axis', () => {
        const wave = getWaveInstance({ ...settings, axisOfRepetitions: 'XZ' });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "XZAxis");
    })
    test('YZ axis', () => {
        const wave = getWaveInstance({ ...settings, axisOfRepetitions: 'YZ' });
        return takeSnapshotAndAssertEqualityAsync(wave.renderer.context, "YZAxis");
    })
})

describe('Calling the correct method', () => {
    const wave = getWaveInstance();
    const mockCoordinates = [[0,0,0], [1,1,1], [2,2,2]]
    const mockRepetitions = 2

    test('X axis method', () => {
        const spy = jest.spyOn(wave, 'getCoordinatesByXAxis')
        wave.coordinatesByAxis('X', mockCoordinates, mockRepetitions)
        expect(spy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith(mockCoordinates, mockRepetitions)
    })
    test('Y axis method', () => {
        const spy = jest.spyOn(wave, 'getCoordinatesByYAxis')
        wave.coordinatesByAxis('Y', mockCoordinates, mockRepetitions)
        expect(spy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith(mockCoordinates, mockRepetitions)
    })
    test('Z axis method', () => {
        const spy = jest.spyOn(wave, 'getCoordinatesByZAxis')
        wave.coordinatesByAxis('Z', mockCoordinates, mockRepetitions)
        expect(spy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith(mockCoordinates)
    })
    test('XY axis method', () => {
        const spy = jest.spyOn(wave, 'getCoordinatesByXYAxes')
        wave.coordinatesByAxis('XY', mockCoordinates, mockRepetitions)
        expect(spy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith(mockCoordinates, mockRepetitions)
    })
    test('XZ axis method', () => {
        const spy = jest.spyOn(wave, 'getCoordinatesByXZAxes')
        wave.coordinatesByAxis('XZ', mockCoordinates, mockRepetitions)
        expect(spy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith(mockCoordinates)
    })
    test('YZ axis method', () => {
        const spy = jest.spyOn(wave, 'getCoordinatesByYZAxes')
        wave.coordinatesByAxis('YZ', mockCoordinates, mockRepetitions)
        expect(spy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith(mockCoordinates, mockRepetitions)
    })
    test('Default case', () => {
        expect(wave.coordinatesByAxis('', mockCoordinates, mockRepetitions)).toEqual(mockCoordinates)
    })
})

describe('Methods for filtering by axis', () => {
    const wave = getWaveInstance();
    const mockCoordinates = [[0,0,0], [1,1,1], [2,2,2]]
    const mockRepetitions = 2

    test('X axis method', () => {
        expect(wave.getCoordinatesByXAxis(mockCoordinates, mockRepetitions)).toBeDefined()
        expect(wave.getCoordinatesByXAxis(mockCoordinates)).toEqual([])
        expect(wave.getCoordinatesByXAxis([])).toEqual([])
        expect(wave.getCoordinatesByXAxis(mockCoordinates, mockRepetitions)).toEqual([[0,0,0]])
    })

    test('Y axis method', () => {
        expect(wave.getCoordinatesByYAxis(mockCoordinates, mockRepetitions)).toBeDefined()
        expect(wave.getCoordinatesByYAxis(mockCoordinates)).toEqual([])
        expect(wave.getCoordinatesByYAxis([])).toEqual([])
        expect(wave.getCoordinatesByYAxis(mockCoordinates, mockRepetitions)).toEqual([[0,0,0], [2,2,2]])
    })

    test('Z axis method', () => {
        expect(wave.getCoordinatesByZAxis(mockCoordinates)).toBeDefined()
        expect(wave.getCoordinatesByZAxis([])).toEqual([])
        expect(wave.getCoordinatesByZAxis(mockCoordinates)).toEqual([[0,0,0]])
    })

    test('XZ axis method', () => {
        expect(wave.getCoordinatesByXZAxes(mockCoordinates)).toBeDefined()
        expect(wave.getCoordinatesByXZAxes([])).toEqual([])
        expect(wave.getCoordinatesByXZAxes(mockCoordinates)).toEqual([[0,0,0]])
    })

    test('XY axis method', () => {
        expect(wave.getCoordinatesByXYAxes(mockCoordinates, mockRepetitions)).toBeDefined()
        expect(wave.getCoordinatesByXYAxes(mockCoordinates)).toEqual([])
        expect(wave.getCoordinatesByXYAxes([])).toEqual([])
        expect(wave.getCoordinatesByXYAxes(mockCoordinates, mockRepetitions)).toEqual([[0,0,0], [2,2,2]])
    })

    test('YZ axis method', () => {
        expect(wave.getCoordinatesByYZAxes(mockCoordinates, mockRepetitions)).toBeDefined()
        expect(wave.getCoordinatesByYZAxes(mockCoordinates)).toEqual([])
        expect(wave.getCoordinatesByYZAxes([])).toEqual([])
        expect(wave.getCoordinatesByYZAxes(mockCoordinates, mockRepetitions)).toEqual([[0,0,0], [1,1,1], [2,2,2]])
    })
})