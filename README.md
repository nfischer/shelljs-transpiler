BashToShellJS
=============

This is a source-to-source translator from Bash to
[ShellJS](https://github.com/shelljs/shelljs). You can **try out the translator
live in your browser** at
[https://nfischer.github.io/BashToShellJS/](https://nfischer.github.io/BashToShellJS/).

You can also download the npm package to translate files on your local machine
directly with the `transpile.js` executable.

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
