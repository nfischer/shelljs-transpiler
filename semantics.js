function cmd_helper(opts, args, indent) {
  var params = [];
  if (opts && opts.interval.contents)
    params.push(opts.toJS(indent));
  if (args && args.interval.contents) {
    args.toJS(indent).forEach(function(word) {
      params.push(word);
    });
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

module.exports = {
  Cmd: function(e) { return e.toJS(this.args.indent); },
  IfCommand: function(ic, eit, elc, ef) { return ic.toJS(this.args.indent) + eit.toJS(this.args.indent)+ elc.toJS(this.args.indent) + ef.toJS(this.args.indent); },
  IfCase: function(iws, cond, _sc, _tws, cmd) {
    return 'if (' + cond.toJS(this.args.indent) + ') {' + nl(this.args.indent) + cmd.toJS(this.args.indent+1) + ';';
  },
  ElseIfThen: function(_sc1, eiws, cond, _sc2, _tws, cmd) {
    return nl(this.args.indent) + '} else if (' + cond.toJS(this.args.indent) + ') {' + nl(this.args.indent) + cmd.toJS(this.args.indent+1) + ';';
  },
  ElseCase: function(_sc, ews, cmd) {
    return nl(this.args.indent) + '} else {' + nl(this.args.indent) + cmd.toJS(this.args.indent);
  },
  EndIf: function(_sc, _fi) {
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
  // IfOneArm: function(it, sc, ef) { return it.toJS(this.args.indent) + '\n' + sc.toJS(this.args.indent) + ef.toJS(this.args.indent); },
  // IfTwoArm: function(it, sc, el, sc2, ef) { return it.toJS(this.args.indent) + '\n' + sc.toJS(this.args.indent) + '\n' + el.toJS(this.args.indent) + '\n' + sc2.toJS(this.args.indent) + '\n' + ef.toJS(this.args.indent); },
  // IfThen: function(iw, sc, nl, _) { return 'if ' + sc.toJS(this.args.indent) + ' (\n'; },

  // Else = semicolon "else"
  // EndIf = semicolon "fi"
  // ifwithspace = "if" space+
  // spaceyfi = space+ "fi"
  Script: function(shebang, _, scriptcode) {
    return shebang.toJS(this.args.indent) + scriptcode.toJS(this.args.indent);
  },
  Shebang: function(_) {
  if (this.interval.contents)
    return "#!/usr/bin/env node\nrequire('shelljs/global');\n\n";
  else
    return '';
  },
  ScriptCode: function(cmd) { return cmd.toJS(this.args.indent); },
  SequenceCmd: function(c1, sc, c2) {
    var mysc = sc.toJS(this.args.indent);
    var ret = c1.toJS(this.args.indent) + mysc;
    if (mysc === '\n')
      ret += ind(this.args.indent);
    ret += c2.toJS(this.args.indent);
    return ret;
  },
  PipeCmd: function(c1, _, c2) { return c1.toJS(this.args.indent) + '.pipe().' + c2.toJS(this.args.indent); },
  SimpleCmd: function(specific_cmd) {
    return ind(this.args.indent) + specific_cmd.toJS(this.args.indent);
  },
  CmdWithComment: function(cmd, comment) {
    return cmd.toJS(this.args.indent) + '; ' + comment.toJS(this.args.indent);
  },
  // SimpleCmd: function(firstword, args) {
  //   return firstword.interval.contents + '(' + args.toJS(this.args.indent) + ')';
  // },
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
    return 'cat(' + cmd_helper(null, args) + ')';
  },
  WhichCmd: function(_, arg) {
    return 'which(' + arg.interval.contents + ')';
  },
  EchoCmd: function(_, args) {
    return 'echo(' + cmd_helper(null, args) + ')';
  },
  PushdCmd: function(_, opts, args) {
    return 'pushd(' + cmd_helper(opts, args, this.args.indent) + ')';
  },
  PopdCmd: function(_, opts, args) {
    return 'popd(' + cmd_helper(opts, args, this.args.indent) + ')';
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
    return 'exit(' + code.interval.contents + ')';
  },
  ChmodCmd: function(_, arg1, arg2) {
    return 'touch(' + cmd_helper(arg1, arg2) + ')';
  },
  TouchCmd: function(_, opts, args) {
    return 'touch(' + cmd_helper(opts, args, this.args.indent) + ')';
  },
  ExecCmd: function(firstword, args) {
    return "exec('" + this.interval.contents + "')";
  },
  Arglist: function(_) {
    return this.interval.contents;
  },
  options: function(_minus, _letters) { return "'" + this.interval.contents + "'"; },
  comment: function(_, msg) { return '//' + msg.interval.contents; },
  bashword: function(val) { return val.toJS(this.args.indent); },
  reference_simple: function(_, id) { return id.interval.contents; },
  reference_smart: function(_ob, id, _cb) { return id.interval.contents; },
  bareWord: function(_) { return "'" + this.interval.contents + "'"; },
  stringLiteral: function(string) { return string.toJS(this.args.indent); },
  singleString: function(_sq, val, _eq) { return "'" + val.interval.contents + "'"; },
  doubleString: function(_sq, val, _eq) {
    return "'" + val.interval.contents.replace(/\\"/,  '"').replace(/'/, "\\'") + "'";
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
