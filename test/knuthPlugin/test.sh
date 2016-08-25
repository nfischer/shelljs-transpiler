#!/bin/bash
cat input.txt |
tr -cs A-Za-z '\n' |
tr A-Z a-z |
sort |
uniq -c |
sort -rn |
head -n $1
