import expect from "expect";

import {
    parseViewSettingsFromUrlParams,
    serializeViewSettingsToUrlParams,
} from "../../../src/utils/viewSettingsUrl";

describe("parseViewSettingsFromUrlParams", () => {
    it("returns empty object for empty params", () => {
        expect(parseViewSettingsFromUrlParams({})).toEqual({});
    });

    it("ignores unknown params", () => {
        expect(parseViewSettingsFromUrlParams({ foo: "bar", xyz: "123" })).toEqual({});
    });

    it("parses atomRadiiScale as a number", () => {
        const result = parseViewSettingsFromUrlParams({ atomRadiiScale: "0.5" });
        expect(result.atomRadiiScale).toBe(0.5);
    });

    it("ignores invalid number values", () => {
        const result = parseViewSettingsFromUrlParams({ atomRadiiScale: "abc" });
        expect(result.atomRadiiScale).toBeUndefined();
    });

    it("parses chemicalConnectivityFactor", () => {
        const result = parseViewSettingsFromUrlParams({ chemicalConnectivityFactor: "1.2" });
        expect(result.chemicalConnectivityFactor).toBe(1.2);
    });

    it("parses connectivityFactor as alias for chemicalConnectivityFactor", () => {
        const result = parseViewSettingsFromUrlParams({ connectivityFactor: "0.8" });
        expect(result.chemicalConnectivityFactor).toBe(0.8);
    });

    describe("repetitions", () => {
        it("parses single number for all axes", () => {
            const result = parseViewSettingsFromUrlParams({ repetitions: "3" });
            expect(result.repetitionsAlongLatticeVectorA).toBe(3);
            expect(result.repetitionsAlongLatticeVectorB).toBe(3);
            expect(result.repetitionsAlongLatticeVectorC).toBe(3);
        });

        it("parses comma-separated values for individual axes", () => {
            const result = parseViewSettingsFromUrlParams({ repetitions: "2,3,1" });
            expect(result.repetitionsAlongLatticeVectorA).toBe(2);
            expect(result.repetitionsAlongLatticeVectorB).toBe(3);
            expect(result.repetitionsAlongLatticeVectorC).toBe(1);
        });

        it("ignores repetitions less than 1", () => {
            const result = parseViewSettingsFromUrlParams({ repetitions: "0" });
            expect(result.repetitionsAlongLatticeVectorA).toBeUndefined();
        });

        it("handles spaces in comma-separated values", () => {
            const result = parseViewSettingsFromUrlParams({ repetitions: "2, 3, 4" });
            expect(result.repetitionsAlongLatticeVectorA).toBe(2);
            expect(result.repetitionsAlongLatticeVectorB).toBe(3);
            expect(result.repetitionsAlongLatticeVectorC).toBe(4);
        });

        it("ignores two-value repetitions (neither 1 nor 3 values)", () => {
            const result = parseViewSettingsFromUrlParams({ repetitions: "2,3" });
            expect(result.repetitionsAlongLatticeVectorA).toBeUndefined();
        });
    });

    describe("boolean params", () => {
        it("parses string 'true' as true", () => {
            const result = parseViewSettingsFromUrlParams({ bonds: "true" });
            expect(result.bonds).toBe(true);
        });

        it("parses string 'false' as false", () => {
            const result = parseViewSettingsFromUrlParams({ bonds: "false" });
            expect(result.bonds).toBe(false);
        });

        it("parses '1' as true", () => {
            const result = parseViewSettingsFromUrlParams({ bonds: "1" });
            expect(result.bonds).toBe(true);
        });

        it("parses '0' as false", () => {
            const result = parseViewSettingsFromUrlParams({ bonds: "0" });
            expect(result.bonds).toBe(false);
        });

        it("accepts pre-parsed boolean values (from Iron Router)", () => {
            const result = parseViewSettingsFromUrlParams({ bonds: true });
            expect(result.bonds).toBe(true);
        });

        it("ignores invalid boolean values", () => {
            const result = parseViewSettingsFromUrlParams({ bonds: "maybe" });
            expect(result.bonds).toBeUndefined();
        });

        it("parses all boolean settings", () => {
            const result = parseViewSettingsFromUrlParams({
                orthographicCamera: "true",
                bonds: "true",
                axes: "true",
                autoRotate: "true",
                elementLabels: "true",
                coordinateLabels: "true",
                conventionalCell: "true",
                isViewAdjustable: "false",
            });
            expect(result.orthographicCamera).toBe(true);
            expect(result.bonds).toBe(true);
            expect(result.axes).toBe(true);
            expect(result.autoRotate).toBe(true);
            expect(result.elementLabels).toBe(true);
            expect(result.coordinateLabels).toBe(true);
            expect(result.conventionalCell).toBe(true);
            expect(result.isViewAdjustable).toBe(false);
        });
    });

    it("parses a realistic URL with mixed params", () => {
        const result = parseViewSettingsFromUrlParams({
            atomRadiiScale: "0.5",
            bonds: "true",
            repetitions: "2,2,2",
            orthographicCamera: "true",
        });
        expect(result).toEqual({
            atomRadiiScale: 0.5,
            bonds: true,
            repetitionsAlongLatticeVectorA: 2,
            repetitionsAlongLatticeVectorB: 2,
            repetitionsAlongLatticeVectorC: 2,
            orthographicCamera: true,
        });
    });

    it("ignores empty string values", () => {
        const result = parseViewSettingsFromUrlParams({ atomRadiiScale: "", bonds: "" });
        expect(result).toEqual({});
    });
});

describe("serializeViewSettingsToUrlParams", () => {
    it("returns empty object for default settings", () => {
        expect(serializeViewSettingsToUrlParams({})).toEqual({});
    });

    it("serializes non-default atomRadiiScale", () => {
        const params = serializeViewSettingsToUrlParams({ atomRadiiScale: 0.5 });
        expect(params.atomRadiiScale).toBe("0.5");
    });

    it("does not serialize default atomRadiiScale (0.2)", () => {
        const params = serializeViewSettingsToUrlParams({ atomRadiiScale: 0.2 });
        expect(params.atomRadiiScale).toBeUndefined();
    });

    it("serializes uniform repetitions as single number", () => {
        const params = serializeViewSettingsToUrlParams({
            repetitionsAlongLatticeVectorA: 3,
            repetitionsAlongLatticeVectorB: 3,
            repetitionsAlongLatticeVectorC: 3,
        });
        expect(params.repetitions).toBe("3");
    });

    it("serializes non-uniform repetitions as comma-separated", () => {
        const params = serializeViewSettingsToUrlParams({
            repetitionsAlongLatticeVectorA: 2,
            repetitionsAlongLatticeVectorB: 3,
            repetitionsAlongLatticeVectorC: 1,
        });
        expect(params.repetitions).toBe("2,3,1");
    });

    it("serializes boolean true values", () => {
        const params = serializeViewSettingsToUrlParams({ bonds: true, axes: true });
        expect(params.bonds).toBe("true");
        expect(params.axes).toBe("true");
    });

    it("serializes boolean false values", () => {
        const params = serializeViewSettingsToUrlParams({ bonds: false });
        expect(params.bonds).toBe("false");
    });

    it("round-trips: parse(serialize(settings)) === settings", () => {
        const original = {
            atomRadiiScale: 0.5,
            bonds: true,
            orthographicCamera: true,
            repetitionsAlongLatticeVectorA: 2,
            repetitionsAlongLatticeVectorB: 3,
            repetitionsAlongLatticeVectorC: 1,
        };
        const serialized = serializeViewSettingsToUrlParams(original);
        const parsed = parseViewSettingsFromUrlParams(serialized);
        expect(parsed).toEqual(original);
    });
});
