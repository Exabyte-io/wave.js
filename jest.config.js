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
    collectCoverageFrom: ["src/**/*.js"],
    coverageDirectory: "tests/coverage",

    // Jest 27 migrated to jest-circus as default
    testRunner: "jest-jasmine2",

    // A list of paths to modules that run some code to configure or set up the testing environment.
    setupFiles: ["./tests/setupFiles.js"],

    // A list of paths to modules that run some code to configure or set up the testing framework before each test.
    setupFilesAfterEnv: ["./tests/setupFilesAfterEnv.js"],

    // mock css files: https://jestjs.io/docs/en/webpack#handling-static-assets
    moduleNameMapper: {
        "\\.(css|sass|scss)$": "<rootDir>/__tests__/__mocks__/styleMock.js"
    }
};
