BashToShellJS
=============

[![Build Status](https://travis-ci.org/nfischer/BashToShellJS.svg?branch=master)](https://travis-ci.org/nfischer/BashToShellJS)

> *"Say goodbye to those gnarly Bash scripts!"
> -- @arturadib, [ShellJS
> README](https://github.com/shelljs/shelljs#shelljs---unix-shell-commands-for-nodejs)*

This is a source-to-source translator from Bash to
[ShellJS](https://github.com/shelljs/shelljs). Try it out [live on the
web!](https://nfischer.github.io/BashToShellJS/).

You can also clone this repository to translate files on your local machine
directly with the `transpile.js` executable:

```Bash
# Make sure to use --recursive to download the submodule
$ git clone --recursive https://github.com/nfischer/BashToShellJS.git
```

Building the project
--------------------

This project uses `gulp` as its task-runner. It depends on a git submodule and
some npm packages, which can be installed like so:

```Bash
$ git clone --recursive https://github.com/nfischer/BashToShellJS.git
$ cd BashToShellJS/
$ npm install -g gulp-cli
$ npm install
$ gulp # This compiles index.html from src/index.generator.html
```

Getting Ohm to work in Node and the browser
-------------------------------------------

This project exposes the ohm grammar to both Node and the browser. This is
somewhat challenging to get right, because the HTML `<script>` tag doesn't let
`.ohm` files be imported with the `src` attribute. To work around this, I wrote
my own cross-platform tool to effectively do the replacement. This tool splices
together `src/index.generator.html` and `src/bash.ohm` to generate the top-level
`index.html` file.

This lets me work with my grammar in a separate file, and also expose its
contents to node more easily. Aside from the convenience of allowing my grammar
to be in a separate file, this makes it pretty straightforward to run unit
tests, which is tremendously helpful.
