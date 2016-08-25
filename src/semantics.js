var reservedWords = [
  'abstract', 'arguments', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double',
  'else', 'enum', 'eval', 'export', 'extends', 'false', 'final', 'finally',
  'float', 'for', 'function', 'goto', 'if', 'implements', 'import', 'in',
  'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 'null',
  'package', 'private', 'protected', 'public', 'return', 'short', 'static',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient',
  'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield',
];

function warn(message) {
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    // Assume a Node environment
    console.warn('Warning:', message);
  } else {
    // Assume a browser environment
    // TODO(nate): provide a more sensible warning UI for the browser
    console.warn('Warning:', message);
  }
}

function testCmdHelper(negate, word1, operator, word2) {
  if (word1) {
    // binary command
    var ret = word1.toJS(0) + ' ' + operator.toJS(0) + ' ' + word2.toJS(0);
    return negate.sourceString ?
        '!(' + ret + ')' :
        ret;
  } else {
    // unary command
    var opString = operator.sourceString || operator;
    var negated = Boolean(negate.sourceString);

    if (opString === '-n') {
      opString = '-z';
      negated = !negated;
    }

    if (opString === '-z') {
      return negated ?
        word2.toJS(0) :
        '!(' + word2.toJS(0) + ')';
    } else {
      return (negated ? '!' : '' ) +
          "test('" + opString + "', " + word2.toJS(0) +")";
    }
  }
}

function cmd_helper(opts, args) {
  var params = [];
  if (opts && opts.sourceString)
    params.push(opts.toJS(0));
  if (args && args.sourceString) {
    var js_args = args.toJS(0);
    if (typeof js_args === 'string') {
      params.push(js_args);
    } else {
      js_args.forEach(function(word) {
        params.push(word);
      });
    }
  }
  return params.join(', ');
}

// Insert a new line, followed by ind_count number of indents
function nl(ind_count) {
  var ret = '\n';
  for (var k=0; k < ind_count; k++)
    ret += '  ';
  return ret;
}

function convertSed() {
  var args = Array.prototype.slice.call(arguments, 0);
  var match = args[0].match(/^(')s\/([^/]*)\/([^/]*)(\/(g?))?\1$/);
  if (!match) {
    throw new Error('Unable to match sed');
  } else {
    return "sed(/" +
      match[2] + "/" + (match[5] || '') +
      ", '" + match[3] + "'" +
      (args.length > 1 ? ', ' + args.slice(1).join(', ') : '') +
      ')';
  }
}

function ind(ind_count) {
  var ret = '';
  for (var k=0; k < ind_count; k++)
    ret += '  ';
  return ret;
}

function env(str) {
  return (globalInclude.value ? '' : 'shell.') + 'env.' + str;
}

function arrayName() {
  return inFunctionBody ? '_$args' : 'process.argv';
}

function envGuess(str) {
  if (str === '?')
    return (globalInclude.value ? '' : 'shell.') + 'error()';
  if (str === '#')
    return arrayName() + '.length-1';
  else if (str.match(/^\d+$/))
    return arrayName() + '[' + (JSON.parse(str)+(inFunctionBody ? -1 : 1)) + ']';
  else if (str === str.toUpperCase())
    return (globalInclude.value ? '' : 'shell.') + 'env.' + str; // assume it's an environmental variable
  else
    return str;
}

var globalInclude = {
  value: true
};

function PluginManager() {
  this.knownPlugins = {
    tr: { opts: 'cds', arity: [2, 3], },
    open: { opts: '', arity: [1], }, // no opts
    clear: { opts: '', arity: [0], }, // no opts
  };
  this.exposedPlugins = {};

  this.enable = function (name) {
    if (this.knownPlugins[name])
      this.exposedPlugins[name] = this.knownPlugins[name];
    else
      throw new Error('Unknown plugin: ' + name);
  };
  this.disable = function (name) {
    delete this.exposedPlugins[name];
  };
  this.reset = function () {
    this.exposedPlugins = {};
  };
  this.use = function (cmds) {
    Object.assign(cmds, this.exposedPlugins);
  };
}

var plugins = new PluginManager();
var inFunctionBody = false;
var globalEnvironment = {};
var allFunctions = {};

// Don't append a semicolon after transpiling these commands
var semicolonCmdNames = [
  'PipeCmd',
  'Export',
  'Assignment',
  'SimpleCmd'
];

var source2sourceSemantics = {
  Cmd: function(e) {
    return (
      this.sourceString && e.toJS(this.args.indent) +
      (semicolonCmdNames.indexOf(e.ctorName) > -1 ? ';' : '')
    );
  },
  IfCommand: function(ic, eit, elc, ef) {
    return ic.toJS(this.args.indent) +
      eit.toJS(this.args.indent) +
      elc.toJS(this.args.indent) +
      ef.toJS(this.args.indent);
  },
  IfCase: function(_if, _s, cond, _sc, _then, _s2, cmds) {
    return 'if (' + cond.toJS(this.args.indent) + ') {' + nl(this.args.indent+1) +
        cmds.toJS(this.args.indent+1);
  },
  ElseIfThen: function(_sc1, _ei, _s, cond, _sc2, _then, _s2, cmd) {
    return nl(this.args.indent) + '} else if (' + cond.toJS(this.args.indent) +
        ') {' + nl(this.args.indent+1) + cmd.toJS(this.args.indent+1);
  },
  ElseCase: function(_sc, _else, _space, cmd) {
    return nl(this.args.indent) + '} else {' + nl(this.args.indent+1) +
        cmd.toJS(this.args.indent+1);
  },
  EndIf: function(_sc, _fi) {
    return nl(this.args.indent) + '}';
  },
  ForCommand: function(f) { return f.toJS(this.args.indent); },
  ForCommand_c_style: function(_for, _op, ctrlstruct, _cp, _sc3, _do, _s, cmd, done) {
    return 'for (' + ctrlstruct.toJS(0) + ') {' +
        nl(this.args.indent+1) + cmd.toJS(this.args.indent+1) +
        nl(this.args.indent) + '}';
  },
  ControlStruct: function(assign, _sc1, id, binop, val, _sc2, update) {
    return assign.toJS(0) + ';' + id.sourceString + binop.toJS(0) + val.toJS(0) +
      ';' + update.sourceString;
  },
  ForCommand_for_each: function(_for, id, _in, call, _sc, _do, _s, cmd2, done) {
    var mycall = call.toJS(this.args.indent).replace(/\.replace\(.*\)/, '');
    return mycall + '.forEach(function (' + id.sourceString + ') {' +
        nl(this.args.indent+1) + cmd2.toJS(this.args.indent+1) +
        nl(this.args.indent) + '});';
  },
  WhileCommand: function(_w, _s, cond, _sc, _do, _s2, cmd, done) {
    return 'while (' + cond.toJS(this.args.indent) + ') {' +
        nl(this.args.indent+1) + cmd.toJS(this.args.indent+1) +
        done.toJS(this.args.indent);
  },
  Done: function(_sc, _) {
    return nl(this.args.indent) + '}';
  },
  FunctionDecl: function(_fun, _sp1, id, _paren, _sp2, block) {
    var idStr = id.toJS(0);
    allFunctions[idStr] = true;

    inFunctionBody = true;
    var blockString = block.toJS(this.args.indent);
    inFunctionBody = false;

    return 'function ' + idStr + '(..._$args) ' + blockString;
  },
  TestCmd_cmd: function(_, insides) {
    return insides.toJS(0);
  },
  TestCmd_singleBracket: function(_ob, _spaces, insides, _cb) {
    return insides.toJS(0);
  },
  TestCmd_doubleBracket: function(_ob, _spaces, insides, _cb) {
    return insides.toJS(0);
  },
  TestInsides_unary: function(negate, binop, bw) {
    return testCmdHelper(negate, null, binop, bw);
  },
  TestInsides_binary: function(negate, bw1, binop, bw2) {
    return testCmdHelper(negate, bw1, binop, bw2);
  },
  TestInsides_str: function(negate, bw) {
    return testCmdHelper(negate, null, '-n', bw);
  },
  Conditional_test: function(sc) {
    var ret = sc.toJS(0);
    if (!globalInclude.value && ret.indexOf('test') > -1)
      ret = ret.replace('test(', 'shell.test(');
    return ret;
  },
  Conditional_cmd: function(sc) {
    return sc.toJS(0) + '.code === 0';
  },
  CodeBlock: function(_b1, s1, commandSequence, _s2, _b2) {
    var spaceIc = s1.sourceString;
    return ind(this.args.indent) + '{' +
        (spaceIc && (spaceIc + ind(this.args.indent+1))) +
        commandSequence.toJS(this.args.indent+1).replace(/ *$/, '') + '}';
  },
  BinaryOp: function(op) {
    var opTable = {
      '=='  : '===',
      '='   : '===',
      '-eq' : '===',
      '!='  : '!==',
      '-ne' : '!==',
      '\\<' : '<',
      '-lt' : '<',
      '\\>' : '>',
      '-gt' : '>',
      '-le' : '<=',
      '-ge' : '>=',
    };
    var ret = opTable[this.sourceString];
    if (typeof ret === 'undefined')
      throw new Error('Unknown binary infix operator');
    return ret;
  },
  Script: function(shebang, space, cmds, _trailing) {
    // Initialze values
    globalEnvironment = {};
    allFunctions = {};

    return (this.sourceString.match(/^(\s)*$/) ?
          '' :
          shebang.toJS(this.args.indent) +
        space.sourceString +
        cmds.toJS(this.args.indent));
  },
  Shebang: function(_a, _b, _c) {
    var lines = ['#!/usr/bin/env node'];
    Object.keys(plugins.exposedPlugins).forEach(function (name) {
      lines.push("require('shelljs-plugin-" + name + "');");
    });

    lines.push(globalInclude.value ? "require('shelljs/global');" : "var shell = require('shelljs');");

    lines.push(''); // extra newline
    return lines.join('\n');
  },
  CmdSequence: function(list) {
    return list.toJS(this.args.indent).join(nl(this.args.indent));
  },
  PipeCmd: function(c1, _, spaces, c2) {
    var newlines = spaces.sourceString.replace(/[^\n]/g, '');
    return c1.toJS(this.args.indent) +
        (newlines ? newlines + ind(this.args.indent+1) : '') +
        '.' +
        c2.toJS(0).replace(/^shell\./, '');
  },
  SimpleCmd: function(scb, redirects, ampersand) {
    var ret = scb.toJS(this.args.indent) +
        redirects.toJS(this.args.indent).join('');
    if (ampersand.sourceString)
      ret = ret.replace(')', ', {async: true})');
    if (!globalInclude.value) ret = 'shell.' + ret;
    return ret;
  },
  SimpleCmdBase: function(scb) { return scb.toJS(this.args.indent); },
  SimpleCmdBase_std: function(firstword, args) {
    var cmd = firstword.sourceString;
    var argList = args.toJS(0);
    var cmdLookup = {
      cp: { opts: 'fnrRLP', arity: [1], },
      rm: { opts: 'frR', arity: [1], },
      mkdir: { opts: 'p', arity: [1], },
      mv: { opts: 'fn', arity: [1], },
      grep: { opts: 'vl', arity: [1], },
      cd: { opts: '', arity: [0, 1], }, // no opts
      pwd: { opts: '', arity: [0, 0], }, // no opts
      ls: { opts: 'RAdl', arity: [0], },
      find: { opts: '', arity: [1], }, // no opts
      cat: { opts: '', arity: [0], }, // no opts
      which: { opts: '', arity: [1, 1], }, // no opts
      echo: { opts: 'e', arity: [0], },
      head: { opts: 'n', arity: [0], },
      tail: { opts: 'n', arity: [0], },
      pushd: { opts: 'n', arity: [0, 2], },
      popd: { opts: 'n', arity: [0, 2], },
      dirs: { opts: 'c', arity: [0, 1], },
      ln: { opts: 'sf', arity: [2, 3], },
      exit: { opts: '', arity: [0, 1], }, // no opts
      chmod: { opts: 'vcR', arity: [2], },
      touch: { opts: 'acmdr', arity: [1], },
      sort: { opts: 'rn', arity: [0], },
      uniq: { opts: 'icd', arity: [0], },
      set: { opts: 'evf', arity: [1, 1], },
      sed: { opts: 'i', arity: [1], },
    };
    plugins.use(cmdLookup);
    var thisCmd = cmdLookup[cmd] || {};
    var arity = thisCmd.arity;
    var opts = thisCmd.opts;

    var match = argList[0] && argList[0].match(/^-([a-zA-Z]+)$/);
    if (match) {
      match[1].split('').forEach(function (usedFlag) {
        // if the used flag isn't a ShellJS flag, give a warning
        if (opts.indexOf(usedFlag) === -1)
          warn(cmd + ' does not support flag: -' + usedFlag);
      });
    }
    if (arity && arity[0] <= argList.length && (!arity.hasOwnProperty(1) || arity[1] >= argList.length)) {
      if (cmd === 'sed') {
        return convertSed.apply(this, argList);
      } else {
        return cmd + '(' + argList.join(', ') + ')';
      }
    } else {
      if (allFunctions[cmd]) // if this is a function call
        return cmd + '(' + argList.join(', ') + ')';
      else
        return "exec('" +
            this.sourceString
              .replace(/\\/g, '\\\\') // back slashes
              .replace(/'/g, "\\'") +   // quotes
              "')";
    }
  },
  Redirect: function(arrow, bw) {
    return (arrow.sourceString.match('>>') ? '.toEnd(' : '.to(') +
        bw.toJS(0) + ')';
  },
  CmdWithComment: function(cmd, comment) {
    return cmd.toJS(this.args.indent) + '; ' + comment.toJS(this.args.indent);
  },
  // TODO(nate): make this preserve leading whitespace
  comment: function(leadingWs, _, msg) { return leadingWs.sourceString + '//' + msg.sourceString; },
  Bashword: function(val) {
    return val.toJS(0);
  },
  ArrayLiteral: function(_op, _sp1, bws, _sp2, _cp) {
    return '[' + bws.toJS(0).join(', ') + ']';
  },
  reference: function(r) { return r.toJS(0); },
  reference_simple: function(_, id) {
    return '$$' + envGuess(id.toJS(0));
  },
  reference_wrapped: function(_, id, _2) {
    return '$$' + envGuess(id.toJS(0));
  },
  reference_substr: function(_ob, id, _col, dig, _col2, dig2, _cb) {
    return '$$' + id.toJS(0) + '.substr(' + dig.sourceString +
        (dig2.sourceString ? ', ' + dig2.sourceString : '') +
        ')';
  },
  reference_substit: function(_ob, id, _sl1, pat, _sl2, sub, _cb) {
    var patStr = _sl1.sourceString === "//" ?
        new RegExp(pat.sourceString, 'g').toString() :
        JSON.stringify(pat.sourceString);
    return '$$' + id.toJS(0) + '.replace(' +
        patStr + ', ' +
        JSON.stringify((sub.sourceString) || '') + ')';
  },
  reference_length: function(_ob, id, _cb) {
    return '$$' + id.toJS(0) + '.length';
  },
  notDoubleQuote_escape: function(_, _2) { return this.sourceString; },
  bareWord: function(chars) {
    return ("'" + chars.toJS(0).join('') + "'").replace(/^'' \+ /g, '').replace(/ \+ ''/g, '');
  },
  barewordChar: function(ch) { return ch.toJS(0); },
  barewordChar_str: function(mystring) {
    return "' + " + mystring.toJS(0) + " + '";
  },
  barewordChar_normal: function(atom) {
    atom = atom.toJS(0);
    if (atom.substr(0, 2) === '$$') { // a hack
      // This is a variable
      return "' + " + atom.slice(2) + " + '";
    } else {
      // This is just a character in the bareWord
      return atom;
    }
  },
  barewordChar_escape: function(_, c) {
    return c.toJS(0);
  },
  stringLiteral: function(string) { return string.toJS(this.args.indent); },
  singleString: function(_sq, val, _eq) {
    return "'" + val.sourceString.replace(/\n/g, '\\n') + "'";
  },
  doubleString: function(_sq, val, _eq) {
    var ret = '';
    val.toJS(0).forEach(function (atom) {
      if (atom.substr(0, 2) === '$$') { // a hack
        // This is a variable
        ret += "' + " + atom.slice(2) + " + '";
      } else {
        // This is just a character in the string
        if (atom === '\\"')
          ret += '"';
        else if (atom === "'")
          ret += "\\'";
        else
          ret += atom;
      }
    });
    // Clean it up
    ret = ("'" + ret + "'").replace(/^'' \+ /g, '').replace(/ \+ ''/g, '')
        .replace(/\n/g, '\\n');
    return ret;
  },
  any: function(_) {
    return this.sourceString;
  },
  id: function(_) {
    var ret = envGuess(this.sourceString);
    if (reservedWords.indexOf(ret) > -1)
      ret = '_$' + ret; // this can't be a valid bash id, so we avoid conflicts
    return ret;
  },
  id_std: function(_1, _2) {
    var ret = envGuess(this.sourceString);
    if (reservedWords.indexOf(ret) > -1)
      ret = '_$' + ret; // this can't be a valid bash id, so we avoid conflicts
    return ret;
  },
  Call: function(_s, cmd, _e) {
    return cmd.toJS(0).replace(/;$/, '') + ".replace(/\\n+$/, '')";
  },
  arrayReference: function(_s, arrId, _e) { return arrId.toJS(0); },
  arrayLength: function(_s, arrId, _e) { return arrId.toJS(0) + '.length'; },
  Export: function(e) {
    return e.toJS(this.args.indent);
  },
  Export_bare: function(_, id) {
    id_str = id.toJS(0);
    return (id_str.match(/env\./) ? id_str : env(id_str)) +
        ' = ' + id_str;
  },
  Export_assign: function(_, assign) {
    assign_str = assign.toJS(0).replace(/^(var|const) /, '');
    var id = assign_str.match(/^([^ ]+) =/)[1];
    return (id.match(/env\./) ? '' : env(id) + ' = ') +
        assign_str;
  },
  Assignment: function(varType, name, _eq, expr) {
    // Check if this variable is assigned already. If not, stick it in the
    // environment
    var ret;
    var varName = name.toJS(0).trim();
    if (varName.match(/^(shell.)?env.|^process.argv.|^_\$args./) || globalEnvironment[varName]) {
      ret = '';
    } else {
      ret = varType.sourceString.indexOf('readonly') > -1 ? 'const ' : 'var ';
      globalEnvironment[varName] = true; // mark it as declared
    }

    var myexpr = expr.toJS(this.args.indent).toString();
    var ic = expr.sourceString;
    ret += varName + " = " + (myexpr || "''");
    return ret;
  },
  allwhitespace: function(_) {
    return this.sourceString;
  },
  NonemptyListOf: function(x, sep, xs) {
    return [x.toJS(this.args.indent)].concat(xs.toJS(this.args.indent));
  },
  EmptyListOf: function() {
    return [];
  },
  number: function(_1, _2) { return this.sourceString; },
  semicolon: function(_) {
    if (true)
      return 'foo';
    else
      return this.sourceString;
  }
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports.source2sourceSemantics = source2sourceSemantics;
  module.exports.globalInclude = globalInclude;
  module.exports.plugins = plugins;
}
