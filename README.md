# shelljs-transpiler

[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/nfischer/shelljs-transpiler/main.yml?style=flat-square&logo=github)](https://github.com/nfischer/shelljs-transpiler/actions/workflows/main.yml)
[![Codecov](https://img.shields.io/codecov/c/github/nfischer/shelljs-transpiler.svg?style=flat-square)](https://codecov.io/gh/nfischer/shelljs-transpiler)
[![npm version](https://img.shields.io/npm/v/shelljs-transpiler.svg?style=flat-square)](https://www.npmjs.com/package/shelljs-transpiler)
[![npm downloads](https://img.shields.io/npm/dt/shelljs-transpiler.svg?style=flat-square)](https://www.npmjs.com/package/shelljs-transpiler)
[![Try online](https://img.shields.io/badge/try_it-online!-yellow.svg?style=flat-square)](https://nfischer.github.io/shelljs-transpiler/)

> *"Say goodbye to those gnarly Bash scripts!"
> -- @arturadib, [ShellJS
> README](https://github.com/shelljs/shelljs#shelljs---unix-shell-commands-for-nodejs)*

Want to try out [ShellJS](https://github.com/shelljs/shelljs) but don't want to
go through the effort of porting all your scripts? Look no further.

Easily transpile your Bash scripts to ShellJS. Try it out [here on the
web](https://nfischer.github.io/shelljs-transpiler/). Just type, copy-paste, or
drag-and-drop your favorite shell script and see the results.

Have a lot of scripts to transpile? Install this globally to use `sh2js` to
transpile scripts from the command line.

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

## Installation

**Note:** this may not handle all Bash syntax until v1.0. If your script doesn't
get translated successfully, please file a Github issue.

```
$ npm install -g shelljs-transpiler # this lets you use `sh2js`
```

## ShellJS and NodeJS compatibility

*What version of ShellJS is this compatible with? Can I run this code? Do I need
a special version of Node? Will this translate anything correctly?*

Your best bet are the latest versions of NodeJS and ShellJS. Some translations
are significantly easier to do using ES6 features, so I use them where
convenient. Also, ShellJS is still under development, so we're always adding new
features to help give it the best of both JavaScript and Bash.

I'll sometimes write translations that take advantage of my not-yet-implemented
ShellJS feature ideas--some of which may never get implemented. If your
translated script relies on a feature that doesn't exist yet in ShellJS, let me
know and I'll fix the transpiler to use a ShellJS feature that's available here
and now.

## `sh2js` CLI tool

The `sh2js` CLI transpiler is still somewhat experimental, but feel free to
check it out! Usage:

```
$ sh2js [options] <shell script input> [JavaScript output]
```

If you want to take advantage of shelljs plugins in the translated script,
you're free to do so! Simply use the `--plugins` flag to supply a
space-separated list of the plugins you want to use.

### options

| short option | long option | behavior |
|:---:| --- | --- |
| `-v` | `--version` | Output version information and quit |
| `-h` | `--help` | Output help information and quit |
| N/A  | `--plugins="<names>"` | Use each ShellJS plugin listed in the space-separated list `<names>` |

Ex. usage:

```bash
$ sh2js testFile.sh outputFile.js # overwrites outputFile.js
$ sh2js testFile.sh # writes to stdout
$ sh2js --plugins="tr open clear" testFile.sh # takes advantage of these plugins
```

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

Next, run it in the browser using `npm start`, run unit tests using `npm test`,
or try a script with `path/to/shelljs-transpiler/bin/sh2js someScript.sh`.
