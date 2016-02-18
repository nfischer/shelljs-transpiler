#!/usr/bin/env node

'use strict';

var assert = require('assert');
var ohm = require('ohm-js');
var fs = require('fs');
var path = require('path');
var semantics = require('../src/semantics');
require('shelljs/global');
var ohmFile = path.join(__dirname, '..', 'src', 'bash.ohm');

config.fatal = true;
config.silent = true;

var contents = fs.readFileSync(ohmFile);
var bash = ohm.grammar(contents);
var s = bash.semantics();
s.addOperation(
  'toJS(indent)',
  semantics.source2sourceSemantics);

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

// Escaped characters
m = bash.match("echo \\'Hello  \\' world\\'");
assert.ok(m.failed());

//
// Valids
//
m = bash.match('echo foo\n');
assert.equal(s(m).toJS(0), "echo('foo');\n");

m = bash.match('echo foo | cat\n');
assert.equal(s(m).toJS(0), "echo('foo').cat();\n");

m = bash.match('echo foo ; echo bar\n');
assert.equal(s(m).toJS(0), "echo('foo'); echo('bar');\n");

m = bash.match('if true; then ls; else pwd; fi');
assert.ok(m.succeeded());

m = bash.match('echo ;');
assert.ok(m.succeeded());

m = bash.match('git status\n');
assert.equal(s(m).toJS(0), "exec('git status');\n");

m = bash.match('git status\n' +
               'git add .\n' +
               'git commit -am "some sort of message"\n');
assert.equal(s(m).toJS(0),
          "exec('git status');\n" +
          "exec('git add .');\n" +
          "exec('git commit -am \"some sort of message\"');\n");

m = bash.match('#!/bin/bash\necho foo\n');
assert.equal(s(m).toJS(0), "#!/usr/bin/env node\n" +
                           "require('shelljs/global');\n\n" +
                           "echo('foo');\n");

m = bash.match('# this is a comment\necho foo\n');
assert.equal(s(m).toJS(0), "// this is a comment\necho('foo');\n");

m = bash.match('#this is a comment | echo foo\n');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "//this is a comment | echo foo\n");

m = bash.match('# this is a comment ; echo foo');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "// this is a comment ; echo foo");

m = bash.match('#   this   is a comment ; echo foo');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "//   this   is a comment ; echo foo");

m = bash.match('echo $myvar\n');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "echo(myvar);\n");

// m = bash.match('echo "$myvar"\n');
// assert.ok(m.succeeded());
// assert.equal(s(m).toJS(0), "echo(myvar);\n");

m = bash.match('echo ${myvar}\n');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "echo(myvar);\n");

m = bash.match('ls ${myvar} $othervar\n');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "ls(myvar, othervar);\n");

m = bash.match('ln -s ${myvar} $othervar\n');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "ln('-s', myvar, othervar);\n");

m = bash.match("echo 'Hello  \" world'\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "echo('Hello  \" world');\n");

// Convert to single-quote strings & escape the single quote
m = bash.match("echo \"Hello  ' world\"\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "echo('Hello  \\' world');\n");

// Escaped characters
m = bash.match("echo \"Hello  \\\" world\"");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "echo('Hello  \" world')");

// While ends without a semicolon
m = bash.match("#!/bin/bash\nwhile [ 'foo' = 'bar' ]; do\n  echo 'hi'\ndone\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "#!/usr/bin/env node\n" +
                           "require('shelljs/global');\n\n" +
                           "while ('foo' === 'bar') {\n" +
                           "  echo('hi');\n" +
                           "}\n");

m = bash.match("while [ $x -ne 1 ]; do\n echo 'hi'\ndone\npwd\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "while (x !== 1) {\n" +
                           "  echo('hi');\n" +
                           "}\n" +
                           "pwd();\n");


config.silent = false;
echo('All tests passed!');
