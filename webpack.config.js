var path = require('path');
var webpack = require('webpack');
// Webpack Plugins
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

/*
 * Config
 */
module.exports = {
  // for faster builds use 'eval'
  devtool: 'source-map',
  debug: true, // remove in production

  entry: {
    'vendor': './src/vendor.ts',
    'app': './src/bootstrap.ts', // our angular app
  },

  // Config for our build files
  output: {
    path: 'docs',
    filename: '[name].js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id].chunk.js',
    publicPath: './'
  },

  resolve: {
    // ensure loader extensions match
    extensions: ['','.ts','.js','.json', '.css', '.html', '.scss']
  },

  module: {
    preLoaders: [ { test: /\.ts$/, loader: 'tslint-loader' } ],
    loaders: [
      // Support for .ts files.
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: [ /\.(spec|e2e)\.ts$/ ]
      },

      // Support for *.json files.
      { test: /\.json$/,  loader: 'json-loader' },

      // Support for CSS as raw text
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.scss$/, loader: 'style!css!sass' },

      // support for .html as raw text
      { test: /\.html$/,  loader: 'raw-loader' },
      { test: /\.(ttf|svg|png|gif|jpg|woff|woff2|eot|csv)$/, loader: "file" },
    ],
    noParse: [ /.+zone\.js\/dist\/.+/, /.+angular2\/bundles\/.+/ ]
  },

  plugins: [
    new CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.js', minChunks: Infinity }),
    new CommonsChunkPlugin({ name: 'common', filename: 'common.js', minChunks: 2, chunks: ['app', 'vendor'] }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
    }),
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
  ],

  // Other module loader config
  tslint: {
    emitErrors: false,
    failOnHint: false
  },
  // our Webpack Development Server config
  devServer: {
    historyApiFallback: true,
    contentBase: 'docs',
  }
};

// Helper functions

function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}

function rootNode(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return root.apply(path, ['node_modules'].concat(args));
}
