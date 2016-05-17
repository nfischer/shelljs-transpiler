if true   ; then ls ; else pwd ; fi
if [ $foo ]; then
  ls
fi
if [ ! "" ]; then
  ls
fi
if [ "$foo" \< "l" ]; then
  cat file.txt
fi
