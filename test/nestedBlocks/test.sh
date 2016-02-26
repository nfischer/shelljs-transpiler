if true; then
  echo 'hi'
fi

while true; do
  if [ -f file.txt ]; then
    echo 'foo'
# supports comments too

echo 'bar'
  elif [ -d dir/ ]; then
    echo 'baz'
  fi
done
