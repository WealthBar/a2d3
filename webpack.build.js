const path = require('path');

module.exports = {
  debug: false,
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
    root: path.resolve('./src'),
    extensions: ['', '.ts', '.js'],
  },

  module: {
    preLoaders: [ { test: /\.ts$/, loader: 'tslint-loader' } ],
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts'
      },
    ],
  },

  ts: {
    configFileName: "tsconfig.build.json",
  },

  tslint: {
    emitErrors: true,
    failOnHint: true,
    resourcePath: 'src'
  },
};
