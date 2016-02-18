BashToShellJS
=============

This is a source-to-source translator from Bash to
[ShellJS](https://github.com/shelljs/shelljs). To run this, you can either
download the package and run the `transpile.js` executable, or you can test it
out in the web!

Building the project
--------------------

This project exposes the ohm grammar to both Node and the browser. Because the
HTML `<script>` tag doesn't let ohm files be imported with the `src` attribute,
I wrote my own tool to effectively do the replacement.

To build the project with this custom step, you only need to run:

```Bash
$ npm install -g gulp-cli
$ npm install
$ gulp # the actual build step
```
