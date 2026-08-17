import expect from "expect";

/**
 * The standalone entry point registers the ESSE schemas itself.
 *
 * Since @mat3ra/made 2026.8.13-0 (#202) `Material.clone()` resolves `material-enhanced-hashed`
 * through `JSONSchemasInterface`, and `ThreeDEditor`'s constructor clones the material it is given.
 * Registration is the host application's job, and `src/index.jsx` is the host for the standalone
 * build - without it the demo threw before React mounted anything, leaving a blank page.
 *
 * The rest of the suite cannot catch this: `jest.config.js` lists `tests/register-esse-schemas.cjs`
 * in `setupFiles`, so every other test starts with a populated registry. That is why 461 tests
 * stayed green while the deployed page was blank.
 */
describe("standalone entry point", () => {
    /**
     * A fresh module graph with an empty registry.
     *
     * `resetModules` so importing the entry point actually re-runs its registration rather than
     * returning the already-evaluated module. The cache is emptied with `schemasCache.clear()`
     * rather than `setSchemas([])` because, despite the name, `setSchemas` only ever *adds* - an
     * empty array is a no-op and would leave these tests asserting nothing.
     */
    const freshWithEmptyRegistry = async () => {
        jest.resetModules();
        const JSONSchemasInterface = (
            await import("@mat3ra/esse/dist/js/esse/JSONSchemasInterface")
        ).default;
        JSONSchemasInterface.schemasCache.clear();
        return JSONSchemasInterface;
    };

    it("has nothing registered once the harness's own registration is cleared", async () => {
        // Guards the guard: if clearing stops working, the assertions below would pass for the
        // wrong reason and this file would silently stop testing anything.
        const JSONSchemasInterface = await freshWithEmptyRegistry();
        expect(JSONSchemasInterface.getSchemaById("material-enhanced-hashed")).toBeUndefined();
    });

    it("registers the schemas on import, before anything renders", async () => {
        const JSONSchemasInterface = await freshWithEmptyRegistry();
        await import("../../src/index");
        expect(JSONSchemasInterface.getSchemaById("material-enhanced-hashed")).toBeDefined();
    });

    it("leaves a Material cloneable, which is the thing that actually broke", async () => {
        await freshWithEmptyRegistry();
        const { Made } = await import("@mat3ra/made");
        const material = new Made.Material(Made.defaultMaterialConfig);
        // Unregistered, this is the exact failure the deployed page hit.
        expect(() => material.clone()).toThrow(/material-enhanced-hashed/);

        await import("../../src/index");
        expect(() => material.clone()).not.toThrow();
    });
});
