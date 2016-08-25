#!/usr/bin/env node
require('shelljs/global');
var foo = 'hi';
var bar = 'hi';

if (!(process.argv[2])) {
  foo = 'default';
} else {
  foo = process.argv[2];
}

if (!(process.argv[2])) {
  foo = 'default';
} else {
  foo = process.argv[2];
}

if (process.argv[3]) {
  bar = process.argv[3];
} else {
  bar = 'no good';
}

if (process.argv[3]) {
  bar = process.argv[3];
} else {
  bar = 'no good';
}

echo(foo + bar);
