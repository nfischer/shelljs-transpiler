# shelljs-transpiler

[![Travis](https://img.shields.io/travis/nfischer/shelljs-transpiler.svg?style=flat-square)](https://travis-ci.org/nfischer/shelljs-transpiler)
[![Codecov](https://img.shields.io/codecov/c/github/nfischer/shelljs-transpiler.svg?style=flat-square)](https://codecov.io/gh/nfischer/shelljs-transpiler)
[![npm](https://img.shields.io/npm/v/shelljs-transpiler.svg?style=flat-square)](https://www.npmjs.com/package/shelljs-transpiler)

> *"Say goodbye to those gnarly Bash scripts!"
> -- @arturadib, [ShellJS
> README](https://github.com/shelljs/shelljs#shelljs---unix-shell-commands-for-nodejs)*

Want to try out [ShellJS](https://github.com/shelljs/shelljs) but don't want to
go through the effort of porting all your scripts? Look no further.

Easily transpile your Bash scripts to ShellJS. Try it out [here on the
web](https://nfischer.github.io/shelljs-transpiler/). Just type, copy-paste, or
drag-and-drop your favorite shell script and see the results.

Have a lot of scripts to transpile? Download this package to use the
`transpile.js` binary.  Check out the [Building the
project](#building-the-project) section below for installation steps.

## Think this is cool?

Let me know by giving it a star on Github.

### Think this is really cool? :sunglasses:

Contributions would be awesome! I'd really like to propel this
project forward, but don't have much time. You can help me out by:

 - sending me scripts you'd like to be able to translate, but haven't been able
   to
 - finding bugs or thinking of features
 - taking up one of the [help-wanted
issues](https://github.com/nfischer/shelljs-transpiler/labels/help%20wanted)
 - helping [refactor the
grammar](https://github.com/nfischer/shelljs-transpiler/issues/11) so that other
   people can use it too.
 - spreading the word (more awareness = more contributors)

## ShellJS compatibility

> What version of ShellJS is this compatible with? Can I run this
> code? Will this translate anything correctly?

These are good questions... to which I have no good answer.

I'm currently helping maintain ShellJS. Whenever I see something
that's easier to do in Bash than in ShellJS, I usually brainstorm a
new syntax for how to put it in the package. Eventually, I even get
around to implementing it upstream.

This means I usually write this translator for "what I see ShellJS
becoming" instead of what ShellJS currently is. This is mostly
compatible with ShellJS v0.7+. If you'd like to try running a
translation, the latest version of ShellJS is your best bet.

## Contributing

As stated above, contributions are welcome! If you're interested in
helping out, let me know by posting an issue or shooting me an
email.

## Running the project

First, install it (**and the git submodule dependencies!**)

```Bash
$ git clone --recursive https://github.com/nfischer/shelljs-transpiler.git
$ cd shelljs-transpiler/
$ npm install
```

Next, run it in the browser using `npm start`
