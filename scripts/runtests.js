#!/usr/bin/env node

'use strict';

var assert = require('assert');
var ohm = require('../lib/ohm/dist/ohm');
var fs = require('fs');
var path = require('path');
var semantics = require('../src/semantics');
var shell = require('shelljs');
var ohmFile = path.join(__dirname, '..', 'src', 'bash.ohm');
require('colors');

shell.set('-e');
shell.config.silent = true;

var contents = fs.readFileSync(ohmFile);
var bash = ohm.grammar(contents);
var s = bash.createSemantics();
s.addOperation('toJS(indent, ctx)', semantics.source2sourceSemantics);

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
m = bash.match("echo 'Hello  \\' world'");
assert.ok(m.failed());

//
// Valids
//

m = bash.match('# this is a comment\necho foo\n');
assert.equal(s(m).toJS(0, {}), "// this is a comment\necho('foo');\n");

m = bash.match('#this is a comment | echo foo\n');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "//this is a comment | echo foo\n");

m = bash.match('# this is a comment ; echo foo');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "// this is a comment ; echo foo");

m = bash.match("if [ -f foo.txt ]; then\n" +
               "  echo hi\n" +
               "fi\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "if (test('-f', 'foo.txt')) {\n" +
                           "  echo('hi');\n" +
                           "}\n");

m = bash.match("if test -f foo.txt; then\n" +
               "  echo hi\n" +
               "fi\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "if (test('-f', 'foo.txt')) {\n" +
                           "  echo('hi');\n" +
                           "}\n");

m = bash.match("if test foo == foo.txt; then\n" +
               "  echo hi\n" +
               "fi\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "if ('foo' === 'foo.txt') {\n" +
                           "  echo('hi');\n" +
                           "}\n");

m = bash.match("if [ foo -ne 'foo.txt' ]; then\n" +
               "  echo hi\n" +
               "fi\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "if ('foo' !== 'foo.txt') {\n" +
                           "  echo('hi');\n" +
                           "}\n");

m = bash.match("while true; do\n" +
               "  echo hi\n" +
               "done\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "while (exec('true').code === 0) {\n" +
                           "  echo('hi');\n" +
                           "}\n");

m = bash.match("while test -f foo.txt; do\n" +
               "  echo hi\n" +
               "done\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "while (test('-f', 'foo.txt')) {\n" +
                           "  echo('hi');\n" +
                           "}\n");

m = bash.match("while [ -f foo.txt ]; do\n" +
               "  echo hi\n" +
               "done\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "while (test('-f', 'foo.txt')) {\n" +
                           "  echo('hi');\n" +
                           "}\n");

// test non-global include
semantics.globalInclude.value = false;
m = bash.match("while [ -f foo.txt ]; do\n" +
               "  echo hi\n" +
               "  echo $?\n" +
               "done\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "while (shell.test('-f', 'foo.txt')) {\n" +
                           "  shell.echo('hi');\n" +
                           "  shell.echo(shell.error());\n" +
                           "}\n");
semantics.globalInclude.value = true;

// // Empty script
// m = bash.match("\n");
// assert.ok(m.succeeded());
// assert.equal(s(m).toJS(0, {}), "\n");

// TODO(nate): check leading white space
// Comments
m = bash.match("  # this is   a comment\n");
assert.ok(m.succeeded());

m = bash.match("exit\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "exit();\n");

m = bash.match("exit  -43\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "exit(-43);\n");

m = bash.match("sed    's/foo/bar' file.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "sed(/foo/, 'bar', 'file.txt');\n");

m = bash.match("sed    's/foo/bar/' file.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "sed(/foo/, 'bar', 'file.txt');\n");

m = bash.match("sed    's/foo/bar/g' file.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "sed(/foo/g, 'bar', 'file.txt');\n");

m = bash.match("grep    'foo' file.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "grep('foo', 'file.txt');\n");

m = bash.match("test -d file.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "test('-d', 'file.txt');\n");

// Assignment
m = bash.match("local foo='hi'\n" +
               "foo='bar'\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "var foo = 'hi';\n" +
                           "foo = 'bar';\n");

m = bash.match("readonly foo='hi'\n" +
               "foo='bar'\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "const foo = 'hi';\n" +
                           "foo = 'bar';\n");

// Newlines are preserved
m = bash.match("\nreadonly foo='hi'\n\n\n" +
               "foo='bar'\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "\nconst foo = 'hi';\n\n\n" +
                           "foo = 'bar';\n");

// Pipes and redirects
m = bash.match("cat file.txt | grep 'foo' | sed 's/o/a/g' > out.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "cat('file.txt').grep('foo').sed(/o/g, 'a').to('out.txt');\n");

// With goofy formatting
m = bash.match("cat file.txt   | grep 'foo'|sed 's/o/a/g'>out.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "cat('file.txt').grep('foo').sed(/o/g, 'a').to('out.txt');\n");

m = bash.match("sed 's/foo/bar/' foo.txt bar.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "sed(/foo/, 'bar', 'foo.txt', 'bar.txt');\n");

// Sed supports double-quotes
m = bash.match("sed \"s/foo/bar/\" foo.txt bar.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "sed(/foo/, 'bar', 'foo.txt', 'bar.txt');\n");

// TestCmd tests
m = bash.match("[ -f file.txt ]\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "test('-f', 'file.txt');\n");

m = bash.match("test -f file.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "test('-f', 'file.txt');\n");

m = bash.match("[ ! -f file.txt ]\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "!test('-f', 'file.txt');\n");

m = bash.match("test ! -f file.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "!test('-f', 'file.txt');\n");

m = bash.match("[ ! $x = $y ]\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "!(x === y);\n");

m = bash.match("echo\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "echo();\n");

// Variable names can have weird-ish characters
m = bash.match("MY_var123='hi'\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "var MY_var123 = 'hi';\n");

// Multi-line pipes
m = bash.match("echo hi |\ncat |\ncat\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0, {}), "echo('hi')\n  .cat()\n  .cat();\n");

shell.set('+e');
var retStatus = 0;
shell.cd(path.join(__dirname, '..', 'test'));

var greenCheckmark = '\u2713'.green.bold;
var redX = '\u2717'.red.bold;

shell.ls().forEach(function (test) {
  shell.cd(test);
  if (shell.error())
    /* istanbul ignore next */
    shell.echo(test + 'is not a directory');
  /* istanbul ignore next */
  try {
    if (shell.test('-f', 'config.json')) {
      JSON.parse(shell.cat('config.json').toString())
        .plugins
        .forEach(function (name) {
          semantics.plugins.enable(name);
      });
    }
    m = bash.match(shell.cat(shell.ls('*.sh')[0]).toString());
    if (m.failed()) {
      console.error('Unable to parse ' + test);
      throw new Error('Unable to parse');
    } else {
      assert.ok(m.succeeded());
      assert.equal(s(m).toJS(0, {}), shell.cat(shell.ls('*.js')[0]));
    }
    console.log(greenCheckmark + ' ' + test);
  } catch (e) {
    retStatus = 1;
    console.log(redX + ' ' + test);
    shell.echo('actual:   ' + JSON.stringify(e.actual));
    shell.echo('expected: ' + JSON.stringify(e.expected));
  }
  semantics.plugins.reset();
  shell.cd('-');
});

shell.config.silent = false;

/* istanbul ignore next */
if (retStatus === 0)
  shell.echo('All tests passed!');
shell.exit(retStatus);
