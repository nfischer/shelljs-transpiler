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

// Shebang
m = bash.match('#!/bin/bash\necho foo\n');
assert.equal(s(m).toJS(0), "#!/usr/bin/env node\n" +
                           "require('shelljs/global');\n\n" +
                           "echo('foo');\n");

m = bash.match('#starts with comment\n#!/bin/sh\necho foo\n');
assert.equal(s(m).toJS(0), "//starts with comment\n" +
                           "#!/usr/bin/env node\n" +
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

// References
m = bash.match('echo $v1 ${v2} "$v3" "${v4}"\n');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "echo(v1, v2, v3, v4);\n");

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
m = bash.match("#!/bin/bash\n" +
               "while [ 'foo' = 'bar' ]; do\n" +
               "  echo 'hi'\n" +
               "done\n");
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

m = bash.match("if [ -f foo.txt ]; then\n" +
               "  echo hi\n" +
               "fi\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "if (test('-f', 'foo.txt')) {\n" +
                           "  echo('hi');\n" +
                           "}\n");

m = bash.match("if test -f foo.txt; then\n" +
               "  echo hi\n" +
               "fi\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "if (test('-f', 'foo.txt')) {\n" +
                           "  echo('hi');\n" +
                           "}\n");

m = bash.match("if test foo == foo.txt; then\n" +
               "  echo hi\n" +
               "fi\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "if ('foo' === 'foo.txt') {\n" +
                           "  echo('hi');\n" +
                           "}\n");

m = bash.match("if [ foo -ne 'foo.txt' ]; then\n" +
               "  echo hi\n" +
               "fi\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "if ('foo' !== 'foo.txt') {\n" +
                           "  echo('hi');\n" +
                           "}\n");

m = bash.match("while true; do\n" +
               "  echo hi\n" +
               "done\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "while (exec('true').code === 0) {\n" +
                           "  echo('hi');\n" +
                           "}\n");

m = bash.match("while test -f foo.txt; do\n" +
               "  echo hi\n" +
               "done\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "while (test('-f', 'foo.txt')) {\n" +
                           "  echo('hi');\n" +
                           "}\n");

m = bash.match("while [ -f foo.txt ]; do\n" +
               "  echo hi\n" +
               "done\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "while (test('-f', 'foo.txt')) {\n" +
                           "  echo('hi');\n" +
                           "}\n");

// Empty script
m = bash.match("\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "\n");

// TODO(nate): check leading white space
// Comments
m = bash.match("  # this is   a comment\n");
assert.ok(m.succeeded());

m = bash.match("exit\n")
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "exit(0);\n");

m = bash.match("exit  -43\n")
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "exit(-43);\n");

m = bash.match("sed    's/foo/bar' file.txt\n")
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "sed(/foo/, 'bar', 'file.txt');\n");

m = bash.match("sed    's/foo/bar/' file.txt\n")
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "sed(/foo/, 'bar', 'file.txt');\n");

m = bash.match("sed    's/foo/bar/g' file.txt\n")
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "sed(/foo/g, 'bar', 'file.txt');\n");

m = bash.match("grep    'foo' file.txt\n")
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "grep('foo', 'file.txt');\n");

m = bash.match("test -d file.txt\n")
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "test('-d', 'file.txt');\n");

// For each loops
m = bash.match("for k in `ls path/to/dir/`; do\n" +
               "  echo \"$k\"\n" +
               "done\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "ls('path/to/dir/').forEach(function (k) {\n" +
                           "  echo(k);\n" +
                           "});\n");

m = bash.match("for k in $(ls path/to/dir/); do\n" +
               "  echo \"$k\"\n" +
               "done\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "ls('path/to/dir/').forEach(function (k) {\n" +
                           "  echo(k);\n" +
                           "});\n");

// Assignment
m = bash.match("foo='hi'\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "var foo = 'hi';\n");

m = bash.match("foo='hi'\n" +
               "foo='bar'\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "var foo = 'hi';\n" +
                           "foo = 'bar';\n");

m = bash.match("local foo='hi'\n" +
               "foo='bar'\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "var foo = 'hi';\n" +
                           "foo = 'bar';\n");

m = bash.match("readonly foo='hi'\n" +
               "foo='bar'\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "const foo = 'hi';\n" +
                           "foo = 'bar';\n");

// Calls
m = bash.match("foo=$(pwd)\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "var foo = pwd();\n");

m = bash.match("foo=`pwd`\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "var foo = pwd();\n");

m = bash.match("foo=\"$(pwd)\"\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "var foo = pwd();\n");

m = bash.match("foo=\"`pwd`\"\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "var foo = pwd();\n");

// Newlines are preserved
m = bash.match("\nreadonly foo='hi'\n\n\n" +
               "foo='bar'\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "\nconst foo = 'hi';\n\n\n" +
                           "foo = 'bar';\n");

// Pipes and redirects
m = bash.match("cat file.txt | grep 'foo' | sed 's/o/a/g' > out.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "cat('file.txt').grep('foo').sed(/o/g, 'a').to('out.txt');\n");

// With goofy formatting
m = bash.match("cat file.txt   | grep 'foo'|sed 's/o/a/g'>out.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "cat('file.txt').grep('foo').sed(/o/g, 'a').to('out.txt');\n");

// Mistyped cp, rm, etc. evaluate to an exec()
m = bash.match("cpfile.txt dest\nrmfile.txt\nmkdirdirname\nmva b\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "exec('cpfile.txt dest');\n" +
                           "exec('rmfile.txt');\n" +
                           "exec('mkdirdirname');\n" +
                           "exec('mva b');\n");

// Trailing semicolons? No problem
m = bash.match("cat file.txt;;;\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "cat('file.txt');\n");

// $? -> error()
m = bash.match("if [ $? == 0 ]; then\n" +
               "  echo \"$?\"\n" +
               "else\n" +
               "  echo \"${?}\"\n" +
               "fi\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "if (error() === 0) {\n" +
                           "  echo(error());\n" +
                           "} else {\n" +
                           "  echo(error());\n" +
                           "}\n");

// Env variables
m = bash.match("BASH=/bin/sh\nexport NEWENV='foo'\necho $PATH\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "env.BASH = '/bin/sh';\n" +
                           "env.NEWENV = 'foo';\n" +
                           "echo(env.PATH);\n");

// Really weird variable concatentation
m = bash.match("echo hi there$foo $bar ${foo}hi${bar}\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "echo('hi', 'there' + foo, bar, foo + 'hi' + bar);\n");

m = bash.match('echo "${baz}${bar}"\n' +
               'echo "foo\\nbar"\n' +
               'echo "foo\\tbar"\n' +
               'echo "foo\'bar"\n' +
               'echo "foo\\"bar"\n' +
               'echo "${k}"\n');
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "echo(baz + bar);\n" +
                           "echo('foo\\nbar');\n" +
                           "echo('foo\\tbar');\n" +
                           "echo('foo\\\'bar');\n" +
                           "echo('foo\"bar');\n" +
                           "echo(k);\n");

m = bash.match("sed 's/foo/bar/' foo.txt bar.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "sed(/foo/, 'bar', 'foo.txt', 'bar.txt');\n");

// Sed supports double-quotes
m = bash.match("sed \"s/foo/bar/\" foo.txt bar.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "sed(/foo/, 'bar', 'foo.txt', 'bar.txt');\n");

// TestCmd tests
m = bash.match("[ -f file.txt ]\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "test('-f', 'file.txt');\n");

m = bash.match("test -f file.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "test('-f', 'file.txt');\n");

m = bash.match("[ ! -f file.txt ]\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "!test('-f', 'file.txt');\n");

m = bash.match("test ! -f file.txt\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "!test('-f', 'file.txt');\n");

m = bash.match("[ ! $x = $y ]\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "!(x === y);\n");

m = bash.match("echo\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "echo();\n");

// Variable names can have weird-ish characters
m = bash.match("MY_var123='hi'\n");
assert.ok(m.succeeded());
assert.equal(s(m).toJS(0), "var MY_var123 = 'hi';\n");


config.silent = false;
echo('All tests passed!');
