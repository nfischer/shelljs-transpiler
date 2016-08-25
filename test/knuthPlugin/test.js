#!/usr/bin/env node
require('shelljs/global');
cat('input.txt')
  .tr('-cs', 'A-Za-z', '\n')
  .tr('A-Z', 'a-z')
  .sort()
  .uniq('-c')
  .sort('-rn')
  .head('-n', process.argv[2]);
