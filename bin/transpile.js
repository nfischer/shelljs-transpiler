#!/usr/bin/env node
var ohm = require('ohm-js');
var fs = require('fs');
var source2sourceSemantics = require('../semantics');
require('shelljs/global');

var contents = fs.readFileSync('bash.ohm');
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
