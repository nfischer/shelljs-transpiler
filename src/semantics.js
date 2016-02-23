function cmd_helper(opts, args, indent) {
  var params = [];
  if (opts && opts.interval.contents)
    params.push(opts.toJS(indent));
  if (args && args.interval.contents) {
    var js_args = args.toJS(indent);
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
  if (str === '?')
    return (globalInclude ? '' : 'shell.') + 'error()';
  else if (str === str.toUpperCase())
    return (globalInclude ? '' : 'shell.') + 'env.' + str; // assume it's an environmental variable
  else
    return str;
}

var globalInclude = true;
var globalEnvironment = {};

var source2sourceSemantics = {
  Cmd: function(e) { return e.toJS(this.args.indent); },
  NoSemicolonCmd: function(c) { return c.toJS(this.args.indent); },
  IfCommand: function(ic, eit, elc, ef) {
    return ic.toJS(this.args.indent) +
      eit.toJS(this.args.indent) +
      elc.toJS(this.args.indent) +
      ef.toJS(this.args.indent);
  },
  IfCase: function(iws, cond, _sc, _tws, cmd) {
    return 'if (' + cond.toJS(this.args.indent) + ') {' + nl(this.args.indent) + cmd.toJS(this.args.indent+1) + ';';
  },
  ElseIfThen: function(_sc1, eiws, cond, _sc2, _tws, cmd) {
    return nl(this.args.indent) + '} else if (' + cond.toJS(this.args.indent) + ') {' + nl(this.args.indent) + cmd.toJS(this.args.indent+1) + ';';
  },
  ElseCase: function(_sc, ews, cmd) {
    return nl(this.args.indent) + '} else {' + nl(this.args.indent+1) + cmd.toJS(this.args.indent) + ';';
  },
  EndIf: function(_sc, _fi) {
    return nl(this.args.indent) + '}';
  },
  ForCommand: function(fc, _done) {
    var controlStr = fc.toJS(this.args.indent);
    return controlStr +
      nl(this.args.indent) + '}' +
      (controlStr.indexOf('forEach') > -1 ? ');' : '');
  },
  ForControl: function(f) { return f.toJS(this.args.indent); },
  ForControl_c_style: function(_for, _op, ctrlstruct, _cp, _sc3, _dws, cmd) {
    return 'for (' + ctrlstruct.toJS(0) + ') {' +
      nl(this.args.indent + 1) + cmd.toJS(this.args.indent) + ';';
  },
  ControlStruct: function(assign, _sc1, id, binop, val, _sc2, update) {
    return assign.toJS(0) + ';' + id.interval.contents + binop.toJS(0) + val.toJS(0) +
      ';' + update.interval.contents;
  },
  ForControl_for_each: function(_for, id, _in, call, _sc, _dws, cmd2) {
    return call.toJS(this.args.indent) + '.forEach(function (' + id.interval.contents + ') {' +
      nl(this.args.indent + 1) + cmd2.toJS(this.args.indent) + ';';
  },
  WhileCommand: function(wc, done) {
    return wc.toJS(this.args.indent) +
      done.toJS(this.args.indent);
  },
  WhileControl: function(_wws, cond, _sc, _dws, cmd) {
    return 'while (' + cond.toJS(this.args.indent) + ') {' +
      nl(this.args.indent + 1) + cmd.toJS(this.args.indent) + ';';
  },
  Done: function(_sc, _) {
    return nl(this.args.indent) + '}';
  },
  TestCmd_unary: function(_, unop, bw) {
    return "test('" + unop.interval.contents + "', " + bw.toJS(0) +")";
  },
  TestCmd_binary: function(_, bw1, binop, bw2) {
    return bw1.toJS(this.args.indent) + ' ' + binop.toJS(this.args.indent) + ' ' + bw2.toJS(this.args.indent);
  },
  TestCmd_unaryBracket: function(_ob, unop, bw, _cb) {
    return "test('" + unop.interval.contents + "', " + bw.toJS(0) +")";
  },
  TestCmd_binaryBracket: function(_ob, bw1, binop, bw2, _cb) {
    return bw1.toJS(this.args.indent) + ' ' + binop.toJS(this.args.indent) + ' ' + bw2.toJS(this.args.indent);
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
  Script: function(prefix, shebang, _, scriptcode) {
    // Always reset the global environment to empty
    globalEnvironment = {};
    return prefix.toJS(this.args.indent).join('') +
        (this.interval.contents.match(/^(\s)*$/)
          ? ''
          : shebang.toJS(this.args.indent) + scriptcode.toJS(this.args.indent));
  },
  Shebang: function(_a, _b, _c) {
    if (this.interval.contents)
      return "#!/usr/bin/env node\n" +
          (globalInclude ? "require('shelljs/global');" : "var shell = require('shelljs');") +
          "\n\n";
    else {
      return '';
    }
  },
  ScriptCode: function(cmd) { return cmd.toJS(this.args.indent); },
  SequenceCmd: function(x) { return x.toJS(this.args.indent); },
  SequenceCmd_std: function(c1, sc, c2) {
    var mysc = sc.toJS(this.args.indent);
    var ret = c1.toJS(this.args.indent) + mysc;
    if (mysc === '\n')
      ret += ind(this.args.indent);
    ret += c2.toJS(this.args.indent);
    return ret;
  },
  SequenceCmd_noscNull: function(c1, sc) {
    var mysc = sc.toJS(this.args.indent);
    var ret = c1.toJS(this.args.indent) + '\n';
    return ret;
  },
  SequenceCmd_null: function(c1, sc) {
    var mysc = sc.toJS(this.args.indent);
    var ret = c1.toJS(this.args.indent) + ';\n';
    return ret;
  },
  SequenceCmd_nosemicolon: function(c1, sc, c2) {
    var mysc = sc.toJS(this.args.indent);
    var ret = c1.toJS(this.args.indent);
    var secondIndent;
    if (sc.interval.contents.indexOf(';') === -1) {
      ret += sc.interval.contents;
      secondIndent = this.args.indent;
    } else {
      ret += '; ';
      secondIndent = 0;
    }
    ret += c2.toJS(secondIndent);
    return ret;
  },
  PipeCmd: function(c1, _, c2) {
    return c1.toJS(this.args.indent) +
        '.' +
        c2.toJS(0).replace(/^shell\./, '');
  },
  SimpleCmd: function(scb, redirects) {
    return ind(this.args.indent) +
        scb.toJS(this.args.indent) +
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
  CdCmd: function(_, arg) { return "cd('" + arg.interval.contents + "')"; },
  PwdCmd: function(_) { return 'pwd()'; },
  LsCmd: function(_, opts, args) {
    return 'ls(' + cmd_helper(opts, args, this.args.indent) + ')';
  },
  FindCmd: function(_, args) {
    return "find('" + args.interval.contents + "')";
  },
  BasicCmd: function(cname, opts, args) {
    return cname.interval.contents.trim() + '(' + cmd_helper(opts, args, this.args.indent) + ')';
  },
  CatCmd: function(_, args) {
    return 'cat(' + cmd_helper(null, args, this.args.indent) + ')';
  },
  WhichCmd: function(_, arg) {
    return 'which(' + arg.interval.contents + ')';
  },
  EchoCmd: function(_, args) {
    return 'echo(' + cmd_helper(null, args, this.args.indent) + ')';
  },
  PushdCmd: function(_, opts, args) {
    return 'pushd(' + cmd_helper(opts, args, this.args.indent) + ')';
  },
  PopdCmd: function(_, opts, args) {
    return 'popd(' + cmd_helper(opts, args, this.args.indent) + ')';
  },
  DirsCmd: function(_, args) {
    return 'dirs(' + cmd_helper(null, args, this.args.indent) + ')';
  },
  LnCmd: function(_, opts, src, dest) {
    var params = [];
    if (opts.interval.contents)
      params.push(opts.toJS(this.args.indent));
    params.push(src.toJS(this.args.indent));
    params.push(dest.toJS(this.args.indent));
    return 'ln(' + params.join(', ') + ')';
  },
  ExitCmd: function(_, neg, code) {
    return 'exit(' + (code.interval.contents.trim() || '0') + ')';
  },
  ChmodCmd: function(_, arg1, arg2) {
    return 'chmod(' + cmd_helper(arg1, arg2, this.args.indent) + ')';
  },
  TouchCmd: function(_, opts, arg) {
    return 'touch(' + cmd_helper(opts, arg, this.args.indent) + ')';
  },
  ExecCmd: function(firstword, args) {
    return "exec('" +
        this.interval.contents.replace(/'/g, "\\'") +
        "')";
  },
  SedCmd: function(_prefix, sRegex, file) {
    return "sed(" +
        sRegex.toJS(0) +
        (file.interval.contents ? ', ' + file.toJS(0) : '') +
        ')';
  },
  sedRegex: function(_prefix, pat, _sl1, sub, _sl2, g, _qu) {
    return '/' + pat.interval.contents +
        (g.interval.contents || '/') +
        ", '" +
        sub.interval.contents +
        "'";
  },
  Arglist: function(_) {
    return this.interval.contents;
  },
  options: function(_minus, _letters) { return "'" + this.interval.contents + "'"; },
  // TODO(nate): make this preserve leading whitespace
  comment: function(leadingWs, _, msg) { return leadingWs.interval.contents + '//' + msg.interval.contents; },
  Bashword: function(val) { return val.toJS(this.args.indent); },
  reference_simple: function(_, id) {
    return env(id.interval.contents);
  },
  reference_wrapped: function(_ob, id, _cb) {
    return env(id.interval.contents);
  },
  bareWord: function(_) { return "'" + this.interval.contents + "'"; },
  stringLiteral: function(string) { return string.toJS(this.args.indent); },
  singleString: function(_sq, val, _eq) { return "'" + val.interval.contents + "'"; },
  doubleString: function(_sq, val, _eq) {
    return "'" + val.interval.contents.replace(/\\"/g,  '"').replace(/'/g, "\\'") + "'";
  },
  id: function(_) {
    return env(this.interval.contents);
  },
  idEqual: function(id, _) {
    return id.toJS(0) + '=';
  },
  Call: function(_s, cmd, _e) { return cmd.toJS(0) },
  Assignment: function(varType, nameEqual, expr) {
    // Check if this variable is assigned already. If not, stick it in the
    // environment
    var ret;
    var varName = nameEqual.toJS(0).trim().slice(0, -1); // trim off '='
    if (varName.match(/^(shell.)?env./) || globalEnvironment[varName]) {
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
  semicolon: function(_) {
    if (this.interval.contents.match(/^;+$/))
      return '; ';
    else
      return ';' + this.interval.contents;
  }
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports.source2sourceSemantics = source2sourceSemantics;
  module.exports.globalInclude = globalInclude;
}
