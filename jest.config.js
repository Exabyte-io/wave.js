/**
 * Jest Configuration.
 * Source: https://jestjs.io/docs/en/configuration
 */

module.exports = {
    // Tell Jest to stop running tests after first failure.
    bail: false,

    // use jsdom env
    testEnvironment: "jsdom",

    // coverage reports
    collectCoverage: true,
    // Must cover TypeScript too: src/ is now majority TS, so the previous "src/**/*.js"
    // glob measured under half the codebase and reported ~9% for a suite actually
    // covering ~82%.
    collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}", "!src/**/*.d.ts"],
    coverageDirectory: "tests/coverage",

    // Floor set just under the measured baseline, to be ratcheted up rather than
    // silently eroded.
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 65,
            functions: 75,
            lines: 80,
        },
    },

    // A list of paths to modules that run some code to configure or set up the testing environment.
    setupFiles: ["./tests/register-esse-schemas.cjs", "./tests/setupFiles.js"],

    // Adding this config to accommodate for new TS files
    // https://jestjs.io/docs/getting-started#using-typescript
    transform: {
        "^.+\\.[t|j]sx?$": "babel-jest",
    },

    transformIgnorePatterns: ["<rootDir>/node_modules/(?!(three|color-diff|@mat3ra/cove)/)"],

    // mock css files: https://jestjs.io/docs/en/webpack#handling-static-assets
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
            "<rootDir>/tests/fileMock.js",
        "\\.(css|sass|scss)$": "<rootDir>/tests/styleMock.js",
    },
};
