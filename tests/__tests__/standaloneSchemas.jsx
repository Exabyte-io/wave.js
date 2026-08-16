import expect from "expect";

/**
 * The standalone entry point has to register the ESSE schemas itself.
 *
 * Since @mat3ra/made 2026.8.13-0 (SOF-7926, #202) `Material.clone()` and `toJSON()` resolve
 * `material-enhanced-hashed` through `JSONSchemasInterface`, and `ThreeDEditor`'s constructor clones
 * the material it is handed. Registration is the host application's job - materials-designer and
 * web-app each do it at startup - and `src/index.jsx` *is* the host for the standalone build that
 * ships to GitHub Pages. Without it the demo threw before React mounted anything: a blank page, and
 * not even an error card, because the throw happens above `ViewerErrorBoundary` rather than inside.
 *
 * This suite exists because the rest of the suite structurally cannot catch that. `jest.config.js`
 * lists `tests/register-esse-schemas.cjs` in `setupFiles`, so every other test starts with a fully
 * populated registry - which is why 461 tests stayed green while the deployed page was blank.
 */
describe("standalone entry point", () => {
    /**
     * A fresh module graph plus an empty registry.
     *
     * `resetModules` matters because `src/index` memoises its registration in a module-level
     * promise - correct for a host that registers once at startup, but it means a second test in
     * the same graph would get the already-settled promise and never re-register.
     *
     * The cache is emptied with `schemasCache.clear()` rather than `setSchemas([])` because, despite
     * the name, `setSchemas` only ever *adds* - it is `schema.forEach(s => this.addSchema(s))` with
     * no reset - so an empty array is a no-op and would leave these tests asserting nothing.
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
        // Guards the guard: if clearing ever stops working, the assertions below would pass for the
        // wrong reason and this file would silently stop testing anything.
        const JSONSchemasInterface = await freshWithEmptyRegistry();
        expect(JSONSchemasInterface.getSchemaById("material-enhanced-hashed")).toBeUndefined();
    });

    it("registers the schemas that Material.clone needs", async () => {
        const JSONSchemasInterface = await freshWithEmptyRegistry();
        const { renderThreeDEditor } = await import("../../src/index");
        await renderThreeDEditor(undefined, document.createElement("div"));
        expect(JSONSchemasInterface.getSchemaById("material-enhanced-hashed")).toBeDefined();
    });

    it("leaves a Material cloneable afterwards, which is the thing that actually broke", async () => {
        await freshWithEmptyRegistry();
        const { Made } = await import("@mat3ra/made");
        const material = new Made.Material(Made.defaultMaterialConfig);
        // Unregistered, this is the exact failure the deployed page hit.
        expect(() => material.clone()).toThrow(/material-enhanced-hashed/);

        const { renderThreeDEditor } = await import("../../src/index");
        await renderThreeDEditor(undefined, document.createElement("div"));
        expect(() => material.clone()).not.toThrow();
    });
});
