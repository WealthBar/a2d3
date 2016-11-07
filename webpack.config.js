var path = require('path');
var webpack = require('webpack');

// Webpack Plugins
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

/*
 * Config
 */
module.exports = {
  entry: {
    'vendor': './src/vendor.ts',
    'app': './src/bootstrap.ts', // our angular app
  },


  output: {
    filename: '[name].[hash].js',
    chunkFilename: '[id].[hash].chunk.js'
  },

  devServer: {
    stats: 'minimal',
    port: 4000,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },

  resolve: {
    modules: ["src", "node_modules"],
    extensions: ['.js', '.ts', '.html', '.css', '.scss', '.json'],
  },

  module: {
    exprContextCritical: false,
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
};

// Helper functions

function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}
