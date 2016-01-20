#!/usr/bin/env node
var ohm = require('ohm-js');
var fs = require('fs');
require('shelljs/global');
var contents = fs.readFileSync('bash.ohm');
var bash = ohm.grammar(contents);

var script = cat('input.sh');

var m = bash.match(script);
if (m.succeeded()) {
  console.log('It works!');
} else {
  console.error('Invalid script');
  exit(1);
}

var s = bash.semantics();

function cmd_helper(opts, args) {
  var params = [];
  if (opts && opts.interval.contents)
    params.push("'" + opts.interval.contents + "'");
  // if (args && args.interval.contents)
  //   params.push("'" + args.interval.contents + "'");
  if (args && args.interval.contents) {
    args.toJS().forEach(function(word) {
      params.push("'" + word + "'");
    });
  }
  return params.join(', ');
}

s.addOperation(
  'toJS',
  {

    Cmd: function(e) { return e.toJS(); },
    // IfCommand: function(e) { return e.toJS(); },
    // IfOneArm: function(it, sc, ef) { return it.toJS() + '\n' + sc.toJS() + ef.toJS(); },
    // IfTwoArm: function(it, sc, el, sc2, ef) { return it.toJS() + '\n' + sc.toJS() + '\n' + el.toJS() + '\n' + sc2.toJS() + '\n' + ef.toJS(); },
    // IfThen: function(iw, sc, nl, _) { return 'if ' + sc.toJS() + ' (\n'; },

    // Else = semicolon "else"
    // EndIf = semicolon "fi"
    // ifwithspace = "if" space+
    // spaceyfi = space+ "fi"
    Script: function(shebang, _, scriptcode) {
      return shebang.toJS() + scriptcode.toJS();
    },
    Shebang: function(_) {
    if (this.interval.contents)
      return "#!/usr/bin/env node\nrequire('shelljs/global');\n\n";
    else
      return '';
    },
    ScriptCode: function(cmd) { return cmd.toJS(); },
    SequenceCmd: function(c1, sc, c2) {
      return c1.toJS() + sc.toJS() + c2.toJS();
    },
    PipeCmd: function(c1, _, c2) { return c1.toJS() + '.pipe().' + c2.toJS(); },
    SimpleCmd: function(specific_cmd) {
      return specific_cmd.toJS();
    },
    CmdWithComment: function(cmd, comment) {
      return cmd.toJS() + '; ' + comment.toJS();
    },
    // SimpleCmd: function(firstword, args) {
    //   return firstword.interval.contents + '(' + args.toJS() + ')';
    // },
    CdCmd: function(_, arg) { return "cd('" + arg.interval.contents + "')"; },
    PwdCmd: function(_) { return 'pwd()'; },
    LsCmd: function(_, opts, args) {
      return 'ls(' + cmd_helper(opts, args) + ')';
    },
    FindCmd: function(_, args) {
      return "find('" + args.interval.contents + "')";
    },
    CpCmd: function(_, opts, args) {
      return 'cp(' + cmd_helper(opts, args) + ')';
    },
    RmCmd: function(_, opts, args) {
      return 'rm(' + cmd_helper(opts, args) + ')';
    },
    MvCmd: function(_, args) {
      return 'mv(' + cmd_helper(null, args) + ')';
    },
    MkdirCmd: function(_, opts, args) {
      return 'mkdir(' + cmd_helper(opts, args) + ')';
    },
    CatCmd: function(_, args) {
      return 'cat(' + cmd_helper(null, args) + ')';
    },
    SedCmd: function(_, opts, args) {
      return 'sed(' + cmd_helper(opts, args) + ')';
    },
    GrepCmd: function(_, opts, args) {
      return 'grep(' + cmd_helper(opts, args) + ')';
    },
    WhichCmd: function(_, arg) {
      return 'which(' + arg.interval.contents + ')';
    },
    EchoCmd: function(_, args) {
      return 'echo(' + cmd_helper(null, args) + ')';
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
        params.push(opts.interval.contents);
      parms.push(src);
      parms.push(dest);
      return 'ln(' + params.join(', ') + ')';
    },
    ExitCmd: function(_, code) {
      return 'exit(' + code.interval.contents + ')';
    },
    ChmodCmd: function(_, arg1, arg2) {
      return 'touch(' + cmd_helper(arg1, arg2) + ')';
    },
    TouchCmd: function(_, opts, args) {
      return 'touch(' + cmd_helper(opts, args) + ')';
    },
    ExecCmd: function(firstword, args) {
      return "exec('" + firstword.interval.contents + args.toJS() + "')";
    },
    Arglist: function(_) {
      return this.interval.contents;
    },
    comment: function(_, msg) { return '//' + msg.interval.contents; },
    bashword: function(_) { return this.interval.contents; },
    // assignment = id "=" alnum*
    // id = alnum+
    id: function(name) {
      return this.interval.contents;
    },
    assignment: function(name, _, expr) {
      return 'var ' + name.toJS() + ' = "' + expr.interval.contents + '"';
    },
    // allwhitespace = space | "\n"
    semicolon: function(_) {
      if (this.interval.contents === ';')
        return '; ';
      else
        return ';\n';
    }
  });
var n = s(m);

echo('-------------');
console.log(n.toJS());
echo('-------------');
