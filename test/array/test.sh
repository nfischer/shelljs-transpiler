foo=(hello ${goodbye} so $long)
foo=()
for k in ${foo[@]}; do
  echo $k
done
echo ${#foo[@]}
