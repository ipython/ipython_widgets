// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

var fs = require('fs');

// Make a script file that defines all of the relevant AMD modules
var files = [
  'base.js',
  'controls.js',
  'base7.js',
  'controls7.js',
  'index.js',
  'libembed-amd.js',
];
var output = files
  .map((f) => {
    return fs.readFileSync('./dist/amd/' + f).toString();
  })
  .join(';\n\n');
fs.writeFileSync('./dist/libembed-amd.js', output);

// Make a script that has all of the above AMD modules and runs a function which
// renders all of the widgets on page load automatically.
files = [
  'base.js',
  'controls.js',
  'base7.js',
  'controls7.js',
  'index.js',
  'libembed-amd.js',
  'embed-amd-render.js',
];
var output = files
  .map((f) => {
    return fs.readFileSync('./dist/amd/' + f).toString();
  })
  .join(';\n\n');
fs.writeFileSync('./dist/embed-amd.js', output);
