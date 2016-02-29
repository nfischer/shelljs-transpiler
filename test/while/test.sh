#!/bin/bash

while [ $x -ne 1 ]; do
  echo 'hi'
done
pwd

while [ 'foo' = 'bar' ]; do
  echo 'hi'
done
for k in $(ls); do
  echo 'hi'
done
