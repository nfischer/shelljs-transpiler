if [ $? == 0 ]; then
  echo "$?"
else
  echo "${?}"
fi
