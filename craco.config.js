const CracoAlias = require("craco-alias");

//const path = require('path');
//
//module.exports = {
//  //...
//  resolve: {
//    alias: {
//      xyz$: path.resolve(__dirname, 'path/to/file.js'),
//    },
//  },
//};

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

