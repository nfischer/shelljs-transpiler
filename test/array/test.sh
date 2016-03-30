#!/bin/bash
goodbye='there'
long='bye'
foo=()
foo=(hello ${goodbye} so $long)
for k in ${foo[@]}; do
  echo $k
done
echo ${#foo[@]}
