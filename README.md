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

This project exposes the ohm grammar to both Node and the browser. Because the
HTML `<script>` tag doesn't let ohm files be imported with the `src` attribute,
I wrote my own tool to effectively do the replacement.

To build the project with this custom step, you only need to run:

```Bash
$ git clone --recursive https://github.com/nfischer/BashToShellJS.git
$ cd BashToShellJS/
$ npm install -g gulp-cli
$ npm install
$ gulp # This compiles index.html from src/index.generator.html
```
