BashToShellJS
=============

[![Build Status](https://travis-ci.org/nfischer/BashToShellJS.svg?branch=master)](https://travis-ci.org/nfischer/BashToShellJS)

> *"Say goodbye to those gnarly Bash scripts!"
> -- @arturadib, [ShellJS
> README](https://github.com/shelljs/shelljs#shelljs---unix-shell-commands-for-nodejs)*

Want to try out [ShellJS](https://github.com/shelljs/shelljs) but don't want to
go through the effort of porting all your scripts? Look no further.

Automagically transpile your Bash scripts to ShellJS using [this web-based
transpiler](https://nfischer.github.io/BashToShellJS/), no downloads necessary.
Just type, copy-paste, or drag-and-drop your favorite shell script and copy
out the generated results.

Have a lot of scripts to transpile? Clone this repository to make use of the
`transpile.js` executable to programmatically transpile your scripts. Check out
the [Building the project](#building-the-project) section below for installation
steps.

ShellJS compatibility
---------------------

> What version of ShellJS is this compatible with? Can I run this code?

These are good questions... to which I have no good answer. I'm currently one of
the maintainers of ShellJS, so I have a tendency to translate to "what ShellJS
will soon become," instead of "what ShellJS currently is." The output here is
designed to be compatible with what will hopefully be ShellJS v0.7+.  This is
because v0.7 will have support for many more Bash features (pipes, globbing,
return codes, etc.), which makes for more interesting translations. I openly
admit that some of these translations are to features that I haven't actually
written yet for ShellJS.

The downside is that there are no guarantees that a given translation will
actually run on any current release of ShellJS. The upside is that as I develop
this translator, it opens my eyes to which language features ShellJS is
desperately lacking.

If you want to try running a translation, the most recent version of ShellJS is
your best bet. I'll keep `package.json` up to date with the latest version
dependency (since always fetching the latest is a little too unstable for my
taste).

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
