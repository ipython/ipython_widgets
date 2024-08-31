// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Here we generate the /dist files that allow widget embedding

var path = require('path');

var options = {
  devtool: 'source-map',
  mode: 'production',
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      // required to load font-awesome
      { test: /\.(woff|woff2|eot|ttf|otf)$/i, type: 'asset/resource' },
      { test: /\.svg$/i, type: 'asset' },
    ],
  },
};

module.exports = [
  {
    // script that renders widgets using the standard embedding and can only render standard controls
    entry: './lib/embed.js',
    output: {
      filename: 'embed.js',
      path: path.resolve(__dirname, 'dist'),
    },
    ...options,
  },
  {
    // script that renders widgets using the amd embedding and can render third-party custom widgets
    entry: './lib/embed-amd-render.js',
    output: {
      filename: 'embed-amd-render.js',
      path: path.resolve(__dirname, 'dist', 'amd'),
    },
    ...options,
  },
  {
    // embed library that depends on requirejs, and can load third-party widgets dynamically
    entry: ['./amd-public-path.js', './lib/libembed-amd.js'],
    output: {
      library: '@jupyter-widgets/html-manager/dist/libembed-amd',
      filename: 'libembed-amd.js',
      path: path.resolve(__dirname, 'dist', 'amd'),
      libraryTarget: 'amd',
      publicPath: '', // Set in amd-public-path.js
    },
    // 'module' is the magic requirejs dependency used to set the publicPath
    externals: ['module'],
    ...options,
  },
  {
    // @jupyter-widgets/html-manager
    entry: ['./amd-public-path.js', './lib/index.js'],
    output: {
      library: '@jupyter-widgets/html-manager',
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist', 'amd'),
      libraryTarget: 'amd',
      publicPath: '', // Set in amd-public-path.js
    },
    // 'module' is the magic requirejs dependency used to set the publicPath
    externals: ['@jupyter-widgets/base', '@jupyter-widgets/controls', 'module'],
    ...options,
  },
  {
    // @jupyter-widgets/base
    entry: ['./amd-public-path.js', '@jupyter-widgets/base/lib/index'],
    output: {
      library: '@jupyter-widgets/base',
      filename: 'base.js',
      path: path.resolve(__dirname, 'dist', 'amd'),
      libraryTarget: 'amd',
      publicPath: '', // Set in amd-public-path.js
    },
    // 'module' is the magic requirejs dependency used to set the publicPath
    externals: ['module'],
    ...options,
  },
  {
    // @jupyter-widgets/controls
    entry: ['./amd-public-path.js', '@jupyter-widgets/controls/lib/index'],
    output: {
      library: '@jupyter-widgets/controls',
      filename: 'controls.js',
      path: path.resolve(__dirname, 'dist', 'amd'),
      libraryTarget: 'amd',
      publicPath: '', // Set in amd-public-path.js
    },
    // 'module' is the magic requirejs dependency used to set the publicPath
    externals: ['@jupyter-widgets/base', 'module'],
    ...options,
  },
  {
    // @jupyter-widgets/base ipywidgets 7
    entry: ['./amd-public-path.js', '@jupyter-widgets/base7/lib/index'],
    output: {
      library: '@jupyter-widgets/base7',
      filename: 'base7.js',
      path: path.resolve(__dirname, 'dist', 'amd'),
      libraryTarget: 'amd',
      publicPath: '', // Set in amd-public-path.js
    },
    // 'module' is the magic requirejs dependency used to set the publicPath
    externals: ['module'],
    ...options,
  },
  {
    // @jupyter-widgets/controls
    entry: ['./amd-public-path.js', '@jupyter-widgets/controls7/lib/index'],
    output: {
      library: '@jupyter-widgets/controls7',
      filename: 'controls7.js',
      path: path.resolve(__dirname, 'dist', 'amd'),
      libraryTarget: 'amd',
      publicPath: '', // Set in amd-public-path.js
    },
    // 'module' is the magic requirejs dependency used to set the publicPath
    externals: ['@jupyter-widgets/base7', 'module'],
    ...options,
  },
];
