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

function cmd_helper(opts, args) {
  var params = [];
  if (opts && opts.interval.contents)
    params.push(opts.toJS(0));
  if (args && args.interval.contents) {
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

function ind(ind_count) {
  var ret = '';
  for (var k=0; k < ind_count; k++)
    ret += '  ';
  return ret;
}

function env(str) {
  return (globalInclude ? '' : 'shell.') + 'env.' + str;
}

function envGuess(str) {
  if (str === '?')
    return (globalInclude ? '' : 'shell.') + 'error()';
  else if (str.match(/^\d+$/))
    return 'process.argv[' + (JSON.parse(str)+1) + ']';
  else if (str === str.toUpperCase())
    return (globalInclude ? '' : 'shell.') + 'env.' + str; // assume it's an environmental variable
  else
    return str;
}

var globalInclude = true;
var globalEnvironment = {};

var source2sourceSemantics = {
  Cmd: function(e) {
    return this.interval.contents && e.toJS(this.args.indent);
  },
  SemicolonCmd: function(c) { return c.toJS(this.args.indent) + ';'; },
  NoSemicolonCmd: function(c) {
    return c.toJS(this.args.indent);
  },
  IfCommand: function(ic, eit, elc, ef) {
    return ic.toJS(this.args.indent) +
      eit.toJS(this.args.indent) +
      elc.toJS(this.args.indent) +
      ef.toJS(this.args.indent);
  },
  IfCase: function(iws, cond, _sc, _tws, cmds) {
    return 'if (' + cond.toJS(this.args.indent) + ') {' + nl(this.args.indent+1) +
        cmds.toJS(this.args.indent+1);
  },
  ElseIfThen: function(_sc1, eiws, cond, _sc2, _tws, cmd) {
    return nl(this.args.indent) + '} else if (' + cond.toJS(this.args.indent) +
        ') {' + nl(this.args.indent+1) + cmd.toJS(this.args.indent+1);
  },
  ElseCase: function(_sc, ews, cmd) {
    return nl(this.args.indent) + '} else {' + nl(this.args.indent+1) +
        cmd.toJS(this.args.indent+1);
  },
  EndIf: function(_sc, _fi) {
    return nl(this.args.indent) + '}';
  },
  ForCommand: function(f) { return f.toJS(this.args.indent); },
  ForCommand_c_style: function(_for, _op, ctrlstruct, _cp, _sc3, _dws, cmd, done) {
    return 'for (' + ctrlstruct.toJS(0) + ') {' +
        nl(this.args.indent+1) + cmd.toJS(this.args.indent+1) +
        nl(this.args.indent) + '}';
  },
  ControlStruct: function(assign, _sc1, id, binop, val, _sc2, update) {
    return assign.toJS(0) + ';' + id.interval.contents + binop.toJS(0) + val.toJS(0) +
      ';' + update.interval.contents;
  },
  ForCommand_for_each: function(_for, id, _in, call, _sc, _dws, cmd2, done) {
    return call.toJS(this.args.indent) + '.forEach(function (' + id.interval.contents + ') {' +
        nl(this.args.indent+1) + cmd2.toJS(this.args.indent+1) +
        nl(this.args.indent) + '});';
  },
  WhileCommand: function(_wws, cond, _sc, _dws, cmd, done) {
    return 'while (' + cond.toJS(this.args.indent) + ') {' +
        nl(this.args.indent+1) + cmd.toJS(this.args.indent+1) +
        done.toJS(this.args.indent);
  },
  Done: function(_sc, _) {
    return nl(this.args.indent) + '}';
  },
  TestCmd_unary: function(_, negate, unop, bw) {
    return negate.interval.contents +
        "test('" + unop.interval.contents + "', " + bw.toJS(0) +")";
  },
  TestCmd_binary: function(_, negate, bw1, binop, bw2) {
    var ret = bw1.toJS(this.args.indent) + ' ' + binop.toJS(this.args.indent) + ' ' + bw2.toJS(this.args.indent);
    return negate.interval.contents
        ? "!(" + ret + ")"
        : ret;
  },
  TestCmd_unaryBracket: function(_ob, negate, unop, bw, _cb) {
    return negate.interval.contents +
        "test('" + unop.interval.contents + "', " + bw.toJS(0) +")";
  },
  TestCmd_binaryBracket: function(_ob, negate, bw1, binop, bw2, _cb) {
    var ret = bw1.toJS(this.args.indent) + ' ' + binop.toJS(this.args.indent) + ' ' + bw2.toJS(this.args.indent);
    return negate.interval.contents
        ? "!(" + ret + ")"
        : ret;
  },
  Conditional_test: function(sc) {
    var ret = sc.toJS(0);
    if (!globalInclude && ret.indexOf('test') > -1)
      ret = ret.replace('test(', 'shell.test(')
    return ret;
  },
  Conditional_cmd: function(sc) {
    return sc.toJS(0) + '.code === 0';
  },
  BinaryOp: function(op) { return op.toJS(this.args.indent); },
  Equal: function(_) { return '==='; },
  NotEqual: function(_) { return '!=='; },
  LessThan: function(_) { return '<'; },
  GreaterThan: function(_) { return '>'; },
  LessThanEq: function(_) { return '<='; },
  GreaterThanEq: function(_) { return '>='; },
  Script: function(shebang, space, cmds, _trailing) {
    // Always reset the global environment to empty
    globalEnvironment = {};
    return (this.interval.contents.match(/^(\s)*$/)
          ? ''
          : shebang.toJS(this.args.indent) +
        space.interval.contents +
        cmds.toJS(this.args.indent));
  },
  Shebang: function(_a, _b, _c) {
    if (this.interval.contents)
      return "#!/usr/bin/env node\n" +
          (globalInclude ? "require('shelljs/global');" : "var shell = require('shelljs');") +
          "\n";
    else {
      return '';
    }
  },
  CmdSequence: function(list) {
    return list.toJS(this.args.indent).join(nl(this.args.indent));
  },
  PipeCmd: function(c1, _, spaces, c2) {
    var newlines = spaces.interval.contents.replace(/[^\n]/g, '');
    return c1.toJS(this.args.indent) +
        (newlines ? newlines + ind(this.args.indent+1) : '') +
        '.' +
        c2.toJS(0).replace(/^shell\./, '');
  },
  SimpleCmd: function(scb, redirects) {
    return scb.toJS(this.args.indent) +
        redirects.toJS(this.args.indent).join('');
  },
  SimpleCmdBase: function(specific_cmd) {
    return (globalInclude ? '' : 'shell.') +
        specific_cmd.toJS(this.args.indent);
  },
  Redirect: function(arrow, bw) {
    return (arrow.interval.contents.match('>>') ? '.toEnd(' : '.to(') +
        bw.toJS(0) + ')';
  },
  CmdWithComment: function(cmd, comment) {
    return cmd.toJS(this.args.indent) + '; ' + comment.toJS(this.args.indent);
  },
  CdCmd: function(_, arg) {
    return "cd(" +
        (arg.interval.contents ? arg.toJS(0) : '') +
        ")";
  },
  PwdCmd: function(_) { return 'pwd()'; },
  LsCmd: function(_, opts, args) {
    return 'ls(' + cmd_helper(opts, args) + ')';
  },
  FindCmd: function(_, args) {
    return "find(" + cmd_helper(null, args) + ")";
  },
  BasicCmd: function(cname, opts, args) {
    return cname.interval.contents.trim() + '(' + cmd_helper(opts, args) + ')';
  },
  CatCmd: function(_, args) {
    return 'cat(' + cmd_helper(null, args) + ')';
  },
  WhichCmd: function(_, arg) {
    return 'which(' + arg.toJS(0) + ')';
  },
  EchoCmd: function(_, args) {
    return 'echo(' + cmd_helper(null, args) + ')';
  },
  HeadCmd: function(_, opts, args) {
    return 'head(' + cmd_helper(opts, args) + ')';
  },
  PushdCmd: function(_, opts, args) {
    return 'pushd(' + cmd_helper(opts, args) + ')';
  },
  PopdCmd: function(_, opts, args) {
    return 'popd(' + cmd_helper(opts, args) + ')';
  },
  DirsCmd: function(_, args) {
    return 'dirs(' + cmd_helper(null, args) + ')';
  },
  LnCmd: function(_, opts, src, dest) {
    var params = [];
    if (opts.interval.contents)
      params.push(opts.toJS(this.args.indent));
    params.push(src.toJS(this.args.indent));
    params.push(dest.toJS(this.args.indent));
    return 'ln(' + params.join(', ') + ')';
  },
  ExitCmd: function(_, code) {
    return 'exit(' + code.toJS(0) + ')';
  },
  ChmodCmd: function(_, arg1, arg2) {
    return 'chmod(' + cmd_helper(arg1, arg2) + ')';
  },
  TouchCmd: function(_, opts, arg) {
    return 'touch(' + cmd_helper(opts, arg) + ')';
  },
  SortCmd: function(_, opts, args) {
    return 'sort(' + cmd_helper(opts, args) + ')';
  },
  ExecCmd: function(firstword, args) {
    return "exec('" +
        this.interval.contents
          .replace(/\\/g, '\\\\') // back slashes
          .replace(/'/g, "\\'") +   // quotes
          "')";
  },
  SetCmd: function(_, opts) {
    return "set('" +
        opts.interval.contents +
        "')";
  },
  SedCmd: function(_prefix, sRegex, files) {
    return "sed(" +
        sRegex.toJS(0) +
        (files.interval.contents ? ', ' + files.toJS(0).join(', ') : '') +
        ')';
  },
  sedRegex: function(_prefix, pat, _sl1, sub, _sl2, g, _qu) {
    return ('/' + pat.interval.contents +
        (g.interval.contents || '/') +
        ", '" +
        sub.interval.contents +
        "'").replace(/\\\+/g, '+');
  },
  Arglist: function(_) {
    return this.interval.contents;
  },
  options: function(_minus, _letters) { return "'" + this.interval.contents + "'"; },
  // TODO(nate): make this preserve leading whitespace
  comment: function(leadingWs, _, msg) { return leadingWs.interval.contents + '//' + msg.interval.contents; },
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
    return '$$' + id.toJS(0) + '.substr(' + dig.interval.contents +
        (dig2.interval.contents ? ', ' + dig2.interval.contents : '') +
        ')';
  },
  reference_substit: function(_ob, id, _sl1, pat, _sl2, sub, _cb) {
    var patStr = _sl1.interval.contents === "//"
        ? new RegExp(pat.interval.contents, 'g').toString()
        : JSON.stringify(pat.interval.contents);
    return '$$' + id.toJS(0) + '.replace(' +
        patStr + ', ' +
        JSON.stringify((sub.interval.contents) || '') + ')';
  },
  notDoubleQuote_escape: function(_, _2) { return this.interval.contents; },
  bareWord: function(w) {
    var ret = '';
    w.toJS(0).forEach(function (atom) {
      if (atom.substr(0, 2) === '$$') { // a hack
        // This is a variable
        ret += "' + " + atom.slice(2) + " + '";
      } else {
        // This is just a character in the bareWord
        ret += atom;
      }
    });
    // Clean it up
    ret = ("'" + ret + "'").replace(/^'' \+ /g, '').replace(/ \+ ''/g, '');
    return ret;
  },
  stringLiteral: function(string) { return string.toJS(this.args.indent); },
  singleString: function(_sq, val, _eq) {
    return "'" + val.interval.contents.replace(/\n/g, '\\n') + "'";
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
    return this.interval.contents;
  },
  id: function(_) {
    var ret = envGuess(this.interval.contents);
    if (reservedWords.indexOf(ret) > -1)
      ret = '_$' + ret; // this can't be a valid bash id, so we avoid conflicts
    return ret;
  },
  id_std: function(_1, _2) {
    var ret = envGuess(this.interval.contents);
    if (reservedWords.indexOf(ret) > -1)
      ret = '_$' + ret; // this can't be a valid bash id, so we avoid conflicts
    return ret;
  },
  idEqual: function(id, _) {
    return id.toJS(0) + '=';
  },
  Call: function(_s, cmd, _e) { return cmd.toJS(0).replace(/;$/, ''); },
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
        assign_str
  },
  Assignment: function(varType, nameEqual, expr) {
    // Check if this variable is assigned already. If not, stick it in the
    // environment
    var ret;
    var varName = nameEqual.toJS(0).trim().slice(0, -1); // trim off '='
    if (varName.match(/^(shell.)?env.|^process.argv./) || globalEnvironment[varName]) {
      ret = '';
    } else {
      ret = varType.interval.contents.indexOf('readonly') > -1 ? 'const ' : 'var ';
      globalEnvironment[varName] = true; // mark it as declared
    }

    ret += varName + " = " +
        (expr.toJS(this.args.indent).toString()
          ? expr.toJS(this.args.indent)
          : "''");
    return ret;
  },
  allwhitespace: function(_) {
    return this.interval.contents;
  },
  NonemptyListOf: function(x, sep, xs) {
    return [x.toJS(this.args.indent)].concat(xs.toJS(this.args.indent));
  },
  EmptyListOf: function() {
    return [];
  },
  number: function(_1, _2) { return this.interval.contents; },
  semicolon: function(_) {
    if (true)
      return 'foo';
    else
      return this.interval.contents;
  }
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports.source2sourceSemantics = source2sourceSemantics;
  module.exports.globalInclude = globalInclude;
}
