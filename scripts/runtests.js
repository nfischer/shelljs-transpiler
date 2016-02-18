#!/usr/bin/env node
var assert = require('assert');
var ohm = require('ohm-js');
var fs = require('fs');
var path = require('path');
var source2sourceSemantics = require('../src/semantics');
require('shelljs/global');
var ohmFile = path.join(__dirname, '..', 'src', 'bash.ohm');

config.fatal = true;
config.silent = true;

var contents = fs.readFileSync(ohmFile);
var bash = ohm.grammar(contents);
var s = bash.semantics();
s.addOperation(
  'toJS(indent)',
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

// Escaped characters
m = bash.match("echo \\'Hello  \\' world\\'");
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
assert.equal(s(m).toJS(0), "exec('git status')");
assert.ok(m.succeeded());

m = bash.match('git status\ngit add .\ngit commit -am "some sort of message"\n');
assert.equal(s(m).toJS(0), "exec('git status');\nexec('git add .');\nexec('git commit -am \"some sort of message\"');\n");
assert.ok(m.succeeded());

m = bash.match('#!/bin/bash\necho foo\n');
assert.equal(s(m).toJS(0), "#!/usr/bin/env node\nrequire('shelljs/global');\n\necho('foo');\n");
assert.ok(m.succeeded());

m = bash.match('# this is a comment\necho foo');
assert.ok(m.succeeded());

m = bash.match('# this is a comment | echo foo');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "// this is a comment | echo foo");

m = bash.match('# this is a comment ; echo foo');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "// this is a comment ; echo foo");

m = bash.match('#   this   is a comment ; echo foo');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "//   this   is a comment ; echo foo");

m = bash.match('echo $myvar');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "echo(myvar)");

m = bash.match('echo ${myvar}');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "echo(myvar)");

m = bash.match('ls ${myvar} $othervar');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "ls(myvar, othervar)");

m = bash.match('ln -s ${myvar} $othervar');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "ln('-s', myvar, othervar)");

m = bash.match("echo 'Hello  \" world'");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "echo('Hello  \" world')");

// Convert to single-quote strings & escape the single quote
m = bash.match("echo \"Hello  ' world\"");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "echo('Hello  \\' world')");

// Escaped characters
m = bash.match("echo \"Hello  \\\" world\"");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "echo('Hello  \" world')");

m = bash.match("#!/bin/bash\nwhile [ 'foo' = 'bar' ]; do\n  echo 'hi'\ndone");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "#!/usr/bin/env node\n" +
                            "require('shelljs/global');\n\n" +
                            "while ('foo' === 'bar') {\n" +
                            "  echo('hi');\n}");


config.silent = false;
echo('All tests passed!');
