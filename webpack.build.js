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
    "@angular/core": "@angular/core",
    "d3": "d3",
    'lodash.clonedeep': "lodash.clonedeep",
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
        loader: 'ts-loader',
        query: { configFileName: "tsconfig.build.json" },
      },
    ],
  },
};
