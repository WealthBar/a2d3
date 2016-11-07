var path = require('path');
var webpack = require('webpack');

/*
 * Config
 */
module.exports = {
  devtool: 'source-map',

  entry: [
    __dirname + '/src/angularD3/index.ts'
  ],

  output: {
    path: __dirname + '/dist',
    filename: 'index.js',
    library: 'a2d3',
    libraryTarget: 'umd',
    sourceMapFilename: 'index.map'
  },

  externals: {
    "@angular": true,
    "@angular/core": true,
    "d3": true,
    'lodash.clonedeep': true,
  },

  resolve: {
    modules: ["src", "node_modules"],
    extensions: ['.js', '.ts'],
  },

  module: {
    exprContextCritical: false,
    loaders: [
      // Support for .ts files.
      {
        test: /\.ts$/,
        loader: 'ts',
        query: { configFileName: "tsconfig.build.json" },
      },
    ],
  },
};
