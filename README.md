shelljs-transpiler
==================

[![Build Status](https://travis-ci.org/nfischer/shelljs-transpiler.svg?branch=master)](https://travis-ci.org/nfischer/shelljs-transpiler)

> *"Say goodbye to those gnarly Bash scripts!"
> -- @arturadib, [ShellJS
> README](https://github.com/shelljs/shelljs#shelljs---unix-shell-commands-for-nodejs)*

Want to try out [ShellJS](https://github.com/shelljs/shelljs) but don't want to
go through the effort of porting all your scripts? Look no further.

Automagically transpile your Bash scripts to ShellJS. Try it out [here on the
web](https://nfischer.github.io/shelljs-transpiler/), no downloads necessary.
Just type, copy-paste, or drag-and-drop your favorite shell script and copy out
the generated results.

Have a lot of scripts to transpile? Clone this repository to make use of the
`transpile.js` executable to programmatically transpile your scripts. Check out
the [Building the project](#building-the-project) section below for installation
steps.

### Like the project?

Feel free to
[contribute](file:///home/nate/programming/Transpiler/README.md#contributing) or
give it a star on Github.

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

If you want to try running a translation, the most recent release of ShellJS is
your best bet. I'll keep `package.json` up to date with the latest version.

Getting Ohm to work in Node and the browser
-------------------------------------------

Check out [nfischer/ohm-builder](https://github.com/nfischer/ohm-builder) to see
how I did it.

Contributing
------------

Want to contribute to this? Awesome! I'd love to receive any pull requests. Take
a look at the [list of help-wanted
issues](https://github.com/nfischer/shelljs-transpiler/labels/help%20wanted) if
you're looking for a place to start, or feel free to think of your own ideas and
work on those. Things that would make for good contributions would be:

 - Generalizing the Bash grammar (it's currently very specific to the task of
   translating bash to ShellJS).
 - Making the grammar stricter (it will sometimes accept things that aren't
   allowed in Bash for the sake of keeping code simple, but this should get
   resolved).
 - Translating more stuff (adding support for things like functions, which
   aren't supported yet).
 - Expanding the grammar itself (ex. adding support for things like env-vars
   declared before a command of the form `LS_COLORS= ls foo/`). This doesn't
   have to include features that necessarily translate well into ShellJS, since
   I'm also interested in making a better Bash PEG.

If you're going to be working on an issue, please either comment on the github
issue (so I know you're tackling it), or post a new issue for the feature
request (so I can provide input before you start implementing, to cut down on
wasted time).

Building the project
--------------------

This project uses `gulp` as its task-runner. It also depends on a git submodule
and some npm packages, which can be installed via:

```Bash
$ git clone --recursive https://github.com/nfischer/shelljs-transpiler.git
$ cd shelljs-transpiler/
$ npm install -g gulp-cli
$ npm install
$ gulp # This compiles index.html from src/index.generator.html
```
