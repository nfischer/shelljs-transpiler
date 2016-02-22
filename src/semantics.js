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

var globalInclude = true;

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
  ForCommand: function(fc, done) {
    return fc.toJS(this.args.indent) +
      done.toJS(this.args.indent);
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
  ForControl_for_each: function(_for, id, _in, _bt1, cmd1, _bt2, _sc, _dws, cmd2) {
    return 'for (' + 'var ' + id.interval.contents +
      ' of ' + cmd1.toJS(0) + ') {' +
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
  Conditional_binary: function(_ob, bw1, binop, bw2, _cb) {
    return bw1.toJS(this.args.indent) + ' ' + binop.toJS(this.args.indent) + ' ' + bw2.toJS(this.args.indent);
  },
  BinaryOp: function(op) { return op.toJS(this.args.indent); },
  Equal: function(_) { return '==='; },
  NotEqual: function(_) { return '!=='; },
  LessThan: function(_) { return '<'; },
  GreaterThan: function(_) { return '>'; },
  LessThanEq: function(_) { return '<='; },
  GreaterThanEq: function(_) { return '>='; },
  Script: function(shebang, _, scriptcode) {
    return shebang.toJS(this.args.indent) + scriptcode.toJS(this.args.indent);
  },
  Shebang: function(_a, _b, _c) {
  if (this.interval.contents)
    return "#!/usr/bin/env node\n" +
        (globalInclude ? "require('shelljs/global');" : "var shell = require('shelljs');") +
        "\n\n";
  else {
    alert('foo');
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
    // alert("<" + mysc + ">");
    var secondIndent;
    if (sc.interval.contents.indexOf(';') === -1) {
      ret += nl(this.args.indent);
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
    return cname.interval.contents + '(' + cmd_helper(opts, args, this.args.indent) + ')';
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
  ExitCmd: function(_, code) {
    return 'exit(' + code.interval.contents + ')';
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
  sedCmd: function(_prefix, pat, _sl1, sub, _sl2, g, _qu, _space, file) {
    return "sed(/" +
        pat.interval.contents +
        (g.interval.contents || '/') +
        ", '" +
        sub.interval.contents +
        "'" +
        (file.interval.contents ? ', ' + file.interval.contents.trim() : '') +
        ')';
  },
  Arglist: function(_) {
    return this.interval.contents;
  },
  options: function(_minus, _letters) { return "'" + this.interval.contents + "'"; },
  comment: function(_, msg) { return '//' + msg.interval.contents; },
  bashword: function(val) { return val.toJS(this.args.indent); },
  reference_simple: function(_, id) { return id.interval.contents; },
  reference_smart: function(_ob, id, _cb) { return id.interval.contents; },
  reference_quotesimple: function(_oq, id, _cq) { return id.interval.contents; },
  reference_quotesmart: function(_oq, id, _cq) { return id.interval.contents; },
  bareWord: function(_) { return "'" + this.interval.contents + "'"; },
  stringLiteral: function(string) { return string.toJS(this.args.indent); },
  singleString: function(_sq, val, _eq) { return "'" + val.interval.contents + "'"; },
  doubleString: function(_sq, val, _eq) {
    return "'" + val.interval.contents.replace(/\\"/g,  '"').replace(/'/g, "\\'") + "'";
  },

  id: function(name) {
    return this.interval.contents;
  },
  assignment: function(name, _, expr) {
    var ret = 'var ' + name.toJS(this.args.indent) + " = ";
    ret += expr.toJS(this.args.indent).toString() ? expr.toJS(this.args.indent) : "''";
    return ret;
  },
  semicolon: function(_) {
    if (this.interval.contents.match(/^;+$/))
      return '; ';
    else
      return ';\n';
  }
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports.source2sourceSemantics = source2sourceSemantics;
  module.exports.globalInclude = globalInclude;
}
