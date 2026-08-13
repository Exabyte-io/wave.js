/**
 * Registers ESSE schemas for wave.js Jest tests.
 * Kept as CommonJS so Jest setupFiles can load it without ESM JSON import issues.
 * Library / host app code must not import `@mat3ra/esse/dist/js/schemas.json` from
 * wave `src/` — the host (materials-designer / web-app) registers schemas at startup.
 * made Material.clone()/toJSON() require `material-enhanced-hashed` via JSONSchemasInterface.
 */
const JSONSchemasInterface = require("@mat3ra/esse/dist/js/esse/JSONSchemasInterface").default;
const allSchemas = require("@mat3ra/esse/dist/js/schemas.json");

JSONSchemasInterface.setSchemas(allSchemas);
