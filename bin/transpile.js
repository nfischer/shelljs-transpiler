#!/usr/bin/env node

'use strict';

var ohm = require('../lib/ohm/dist/ohm');
var fs = require('fs');
var path = require('path');
var semantics = require('../src/semantics');
require('shelljs/global');

var argv = require('minimist')(process.argv.slice(2));

var contents = fs.readFileSync(path.join(__dirname, '..', 'src', 'bash.ohm'));
var bash = ohm.grammar(contents);

// Load in script, ensure a trailing newline
var inputFile = argv._[0]
if (!inputFile) {
  console.error('Usage: node transpile.js <input>');
  process.exit(1);
}
var script = cat(inputFile).trim() + '\n';

var m = bash.match(script);
if (m.failed()) {
  console.error('Invalid script');
  exit(1);
}

var s = bash.semantics();
s.addOperation(
  'toJS(indent)',
  semantics.source2sourceSemantics);

var n = s(m);

var shellOutput = n.toJS(0);
if (argv['r']) { // run it!
  exec('node -e ' + JSON.stringify(shellOutput
      .replace(/#!.*\n/, '')
      .replace(/\n/g, '')));
} else {
  process.stdout.write(shellOutput);
}
