#!/usr/bin/env node

'use strict';

var ohm = require('ohm-js');
var fs = require('fs');
var path = require('path');
var source2sourceSemantics = require('../src/semantics');
require('shelljs/global');

var contents = fs.readFileSync(path.join(__dirname, '..', 'src', 'bash.ohm'));
var bash = ohm.grammar(contents);

// Load in script, ensure a trailing newline
var inputFile = process.argv[2];
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
  source2sourceSemantics);

var n = s(m);

console.log(n.toJS(0));
