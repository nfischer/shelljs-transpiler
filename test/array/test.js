#!/usr/bin/env node
require('shelljs/global');
var goodbye = 'there';
var _$long = 'bye';
var foo = [];
foo = ['hello', goodbye, 'so', _$long];
foo.forEach(function (k) {
  echo(k);
});
echo(foo.length);
