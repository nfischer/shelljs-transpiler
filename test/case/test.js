#!/usr/bin/env node
require('shelljs/global');
env.FRUIT = 'kiwi';


var $tmp0 = env.FRUIT;
switch ($tmp0) {
  case (/^a.*$/g.test($tmp0) ? $tmp0 : NaN) :
    echo('FFFF a');
    break; // this is a comment
  case (/^b.*$/g.test($tmp0) ? $tmp0 : NaN) :
    echo('FFFF b');
    echo('test');
    break;
  case (/^c.*$/g.test($tmp0) ? $tmp0 : NaN) :
  case 'kiwi':
    echo('FFFF c kiwi');
    break;
  case (/^.*$/g.test($tmp0) ? $tmp0 : NaN) :
    echo('FFFF other');
    break;
}
