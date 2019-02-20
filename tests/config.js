/**
 * Jest Configuration.
 * Source: https://jestjs.io/docs/en/configuration
 */

module.exports = {

    // Tell Jest to stop running tests after first failure.
    bail: 0,

    // A list of paths to modules that run some code to configure or set up the testing environment.
    setupFiles: ["./setupFiles.js"],

    // A list of paths to modules that run some code to configure or set up the testing framework before each test.
    setupFilesAfterEnv: ["./setupFilesAfterEnv.js"],

    // https://jestjs.io/docs/en/webpack#handling-static-assets
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
        "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js"
    }
};
