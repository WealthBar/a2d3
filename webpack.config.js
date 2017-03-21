var path = require('path');
var webpack = require('webpack');

// Webpack Plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');

/*
 * Config
 */
module.exports = {
  entry: {
    'app': './src/bootstrap.ts', // our angular app
  },


  output: {
    path: root('docs'),
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
        loader: 'awesome-typescript-loader',
        exclude: [/\.(spec|e2e)\.ts$/]
      },

      // Support for *.json files.
      { test: /\.json$/, loader: 'json-loader' },

      // Support for CSS as raw text
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },

      // support for .html as raw text
      { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.(ttf|svg|png|gif|jpg|woff|woff2|eot|csv)$/, loader: "file-loader" },
    ],
  },

  plugins: [
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
