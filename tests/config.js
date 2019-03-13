/**
 * Jest Configuration.
 * Source: https://jestjs.io/docs/en/configuration
 */

module.exports = {

    // Tell Jest to stop running tests after first failure.
    bail: false,

    // A list of paths to modules that run some code to configure or set up the testing environment.
    setupFiles: ["./setupFiles.js"],

    // A list of paths to modules that run some code to configure or set up the testing framework before each test.
    setupFilesAfterEnv: ["./setupFilesAfterEnv.js"],

    // mock css files: https://jestjs.io/docs/en/webpack#handling-static-assets
    moduleNameMapper: {
        "\\.(css|sass|scss)$": "<rootDir>/__tests__/__mocks__/styleMock.js"
    }
};
