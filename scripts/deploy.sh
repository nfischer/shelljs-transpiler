#!/bin/bash

# Deply the website to the gh-pages branch so that it's live
# This script was generated with this transpiler!
set -e
git checkout gh-pages
git rev-parse --abbrev-ref HEAD
git merge master --commit
git push origin gh-pages
git checkout -
echo 'Deployed to https://nfischer.github.io/BashToShellJS/'
