#!/usr/bin/env node
var assert = require('assert');
var ohm = require('ohm-js');
var fs = require('fs');
require('shelljs/global');

var ohm_file = __dirname + '/../bash.ohm';

var contents = fs.readFileSync(ohm_file);
var bash = ohm.grammar(contents);

var m;

//
// Invalids
//
// m = bash.match('#!/bin/bash');
// assert.ok(m.failed());
m = bash.match('echo|');
assert.ok(m.failed());
m = bash.match('|echo|');
assert.ok(m.failed());

//
// Valids
//
m = bash.match('echo foo\n');
assert.ok(m.succeeded());
m = bash.match('echo foo');
assert.ok(m.succeeded());
m = bash.match('echo foo | echo bar');
assert.ok(m.succeeded());
m = bash.match('echo foo ; echo bar;');
assert.ok(m.succeeded());
m = bash.match('if true; then ls; else pwd; fi');
assert.ok(m.succeeded());
m = bash.match('echo ;');
assert.ok(m.succeeded());
m = bash.match('git status');
assert.ok(m.succeeded());
m = bash.match('git status\ngit add .\ngit commit -am I love it');
assert.ok(m.succeeded());
m = bash.match('#!/bin/bash\necho foo');
assert.ok(m.succeeded());
m = bash.match('# this is a comment\necho foo');
assert.ok(m.succeeded());




echo('All tests passed!');
