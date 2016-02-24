#!/usr/bin/env node
require('shelljs/global');


while ('foo' === 'bar') {
  echo('hi');
}
ls().forEach(function (k) {
  echo('hi');
});
