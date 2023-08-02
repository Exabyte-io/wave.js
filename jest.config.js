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

    // A list of paths to modules that run some code to configure or set up the testing environment.
    setupFiles: ["./tests/setupFiles.js"],

    // Adding this config to accommodate for new TS files
    // https://jestjs.io/docs/getting-started#using-typescript
    transform: {
        "^.+\\.[t|j]sx?$": "babel-jest",
    },

    transformIgnorePatterns: ["<rootDir>/node_modules/(?!(three|@exabyte-io/cove.js)/)"],

    // mock css files: https://jestjs.io/docs/en/webpack#handling-static-assets
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
            "<rootDir>/tests/fileMock.js",
        "\\.(css|sass|scss)$": "<rootDir>/tests/styleMock.js",
    },
};
