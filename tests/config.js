module.exports = {
    bail: 0,
    setupFiles: ["./setupFiles.js"],
    setupFilesAfterEnv: ["./setupFilesAfterEnv.js"],
    snapshotSerializers: ["enzyme-to-json/serializer"],
};
