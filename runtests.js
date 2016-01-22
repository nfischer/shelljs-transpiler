#!/usr/bin/env node
var assert = require('assert');
var ohm = require('ohm-js');
var fs = require('fs');
var source2sourceSemantics = require('./semantics');
require('shelljs/global');
var ohm_file = __dirname + '/bash.ohm';

config.fatal = true;
config.silent = true;

var contents = fs.readFileSync(ohm_file);
var bash = ohm.grammar(contents);
var s = bash.semantics();
s.addOperation(
  'toJS',
  source2sourceSemantics);

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
assert.equal(s(m).toJS(), "exec('git status')");
assert.ok(m.succeeded());

m = bash.match('git status\ngit add .\ngit commit -am "some sort of message"\n');
assert.equal(s(m).toJS(), "exec('git status');\nexec('git add .');\nexec('git commit -am \"some sort of message\"');\n");
assert.ok(m.succeeded());

m = bash.match('#!/bin/bash\necho foo\n');
assert.equal(s(m).toJS(), "#!/usr/bin/env node\nrequire('shelljs/global');\n\necho('foo');\n");
assert.ok(m.succeeded());

m = bash.match('# this is a comment\necho foo');
assert.ok(m.succeeded());

m = bash.match('# this is a comment | echo foo');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(), "// this is a comment | echo foo");

m = bash.match('# this is a comment ; echo foo');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(), "// this is a comment ; echo foo");

m = bash.match('#   this   is a comment ; echo foo');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(), "//   this   is a comment ; echo foo");

m = bash.match('echo $myvar');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(), "echo(myvar)");

m = bash.match('echo ${myvar}');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(), "echo(myvar)");

m = bash.match('ls ${myvar} $othervar');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(), "ls(myvar, othervar)");

m = bash.match('ln -s ${myvar} $othervar');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(), "ln('-s', myvar, othervar)");

m = bash.match("echo 'Hello  \" world'")
assert.ok(m.succeeded());
assert.equal(s(m).toJS(), "echo('Hello  \" world')");

m = bash.match("echo \"Hello  ' world\"")
assert.ok(m.succeeded());
assert.equal(s(m).toJS(), "echo(\"Hello  ' world\")");
































config.silent = false;
echo('All tests passed!');
