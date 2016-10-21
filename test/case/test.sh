#!/bin/sh
FRUIT="kiwi"

case "$FRUIT" in
  a*) echo "FFFF a" ;; # this is a comment
  b*) echo "FFFF b" ;
  echo "test";;
  c*|kiwi) echo "FFFF c kiwi" ;;
  *) echo "FFFF other" ;;
esac
