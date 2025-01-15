const path = require("path");

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // Disable code splitting
            webpackConfig.optimization.splitChunks = {
                cacheGroups: {
                    default: false,
                },
            };

            webpackConfig.optimization.runtimeChunk = false;

            // Ensure output filename is a single file
            webpackConfig.output.filename = "static/js/[name].bundle.js";

            // Set the output directory to a specific folder
            webpackConfig.output.path = path.resolve(__dirname, "build");

            return webpackConfig;
        },
    },
};
