if (exec('true').code === 0) {
  echo('hi');
}

while (exec('true').code === 0) {
  if (test('-f', 'file.txt')) {
    echo('foo');
    // supports comments too
    
    echo('bar');
  } else if (test('-d', 'dir/')) {
    echo('baz');
  }
}
