#!/usr/bin/env node
require('shelljs/global');

// Deply the website to the gh-pages branch so that it's live
// This script was generated with this transpiler!
set('-e');
exec('git checkout gh-pages');
exec('git rev-parse --abbrev-ref HEAD');
exec('git merge master --commit');
exec('git push origin gh-pages');
exec('git checkout -');
echo('Deployed to https://nfischer.github.io/BashToShellJS/');
