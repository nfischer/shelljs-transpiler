foo='hi'
foo=bar
foo='hello'
myvar=$foo
myvar=prefix$foo
myvar=$foo"suffix1"suffix2
myvar=${foo}suffix1"suffix2"
myvar="${foo}suffix1"$foo
