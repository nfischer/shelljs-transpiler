#!/bin/bash
# code block
{ ls; }
{

  pwd
  cat file.txt
}
# function declarations
foo(){
  echo 'hi'
  echo "$1"
}
function bar
{
  cat file2.txt
}
function baz (){ ls; }
# function calls
foo 'there'
