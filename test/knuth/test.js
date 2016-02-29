#!/usr/bin/env node
require('shelljs/global');
cat('input.txt')
  .exec('tr -cs A-Za-z \'\\n\'')
  .exec('tr A-Z a-z')
  .sort()
  .exec('uniq -c')
  .sort('-rn')
  .head('-n', process.argv[2]);
