#!/bin/bash
foo=hi
bar=hi

if [ -z "$1" ]; then
  foo="default"
else
  foo="$1"
fi

if [ ! "$1" ]; then
  foo="default"
else
  foo="$1"
fi

if [ -n "$2" ]; then
  bar="$2"
else
  bar="no good"
fi

if [ "$2" ]; then
  bar="$2"
else
  bar="no good"
fi

echo "$foo$bar"
