#!/usr/bin/env node
require('shelljs/global');
// code block
{ls();
}
{

  pwd();
  cat('file.txt');
}
// function declarations
function foo(..._$args) {
  echo('hi');
  echo(_$args[0]);
}
function bar(..._$args) {
  cat('file2.txt');
}
function baz(..._$args) {ls();
}
// function calls
foo('there');
