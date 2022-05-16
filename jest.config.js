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

    transform: {
        ".*/three/examples/.*.js": "babel-jest",
        ".*/three/editor/.*.js": "babel-jest",
        "\\.[jt]sx?$": "babel-jest",
    },

    transformIgnorePatterns: [
        "<rootDir>/node_modules/(?!(@exabyte-io/three)/)"
    ],

    // mock css files: https://jestjs.io/docs/en/webpack#handling-static-assets
    moduleNameMapper: {
        "\\.(css|sass|scss)$": "<rootDir>/tests/styleMock.js",
        "^three/editor(.*)$": "<rootDir>/node_modules/@exabyte-io/three/editor/$1",
        "^three(.*)$": "<rootDir>/node_modules/@exabyte-io/three$1"
    }
};
