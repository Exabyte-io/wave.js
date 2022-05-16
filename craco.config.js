const CracoAlias = require("craco-alias");

module.exports = {
    plugins: [
        {
            plugin: CracoAlias,
            options: {
                source: "options",
                baseUrl: "./",
                aliases: {
                    "three": "./node_modules/@exabyte-io/three"
                }
            }
        }
    ]
}

