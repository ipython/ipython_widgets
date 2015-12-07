// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

var path = require('path');

var spawn = require('spawn-sync');

var source = './static/widgets/less/widgets.less';
var css_destination = './static/widgets/css/widgets.css';
var min_destination = './static/widgets/css/widgets.min.css';

function run(cmd) {
    // run a command, with some help:
    // - echo command
    // - die on failure
    // - show stdout/err
    console.log('> ' + cmd.join(' '));
    var p = spawn(cmd[0], cmd.slice(1));
    process.stdout.write(p.stdout.toString());
    process.stderr.write(p.stderr.toString());
    if (p.status !== 0) {
        console.error("`%s` failed with status=%s", cmd.join(' '), p.status);
        process.exit(p.status);
    }
    return p.stdout.toString();
}

run(['lessc',
    '--include-path=./static/components',
    source,
    css_destination,
]);

run(['cleancss',
    '--source-map',
    '--skip-restructuring ',
    '-o',
    min_destination,
    css_destination]);
  
