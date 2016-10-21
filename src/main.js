// This code is meant to be run in the browser only

if (typeof process !== 'undefined' && process.version && process.execPath) {
  throw new Error('Do not run this in NodeJS');
}

var editor;
var jscode;
$(document).ready(function () {
  // Initialize the text areas
  var code = $('.codemirror-textarea')[0];
  editor = CodeMirror.fromTextArea(code, {
    mode: 'shell',
    lineNumbers: true
  });
  var output = $('.codemirror-textarea')[1];
  jscode = CodeMirror.fromTextArea(output, {
    readOnly: true,
    mode: 'javascript',
    lineNumbers: true
  });
});
function selectAll(id) {
  document.getElementById(id).select();
}
var bash = ohm.grammarFromScriptElement();
var s = bash.createSemantics();
var errMessage;
var warned = false;
s.addOperation(
  'toJS(indent, ctx)',
  source2sourceSemantics);

function loadTranslatedText() {
  // Load in the plugins that are in use
  plugins.reset();
  $('.pluginCheckbox:checked').each(function (_idx, node) {
    plugins.enable(node.value);
  });

  // Note: must keep `globalInclude` in global namespace for now
  globalInclude.value = document.getElementById('checkbox1').checked;
  var script = editor.getValue().trim() + '\n';
  var m = bash.match(script);
  errMessage = m.failed() ? m.message : null;
  warned = false;
  if (!errMessage) {
    var n = s(m);
    var replacementText = n.toJS(0, {}).trimRight();
    jscode.setValue(replacementText);
  }
}

$(document).ready(function () {
  // Create checkboxes for each plugin
  var table = document.getElementById('main-table');
  var row = table.insertRow(1);
  var mydiv = document.createElement('div');
  row.appendChild(mydiv);
  $('<span>Plugins: </span>').appendTo($(mydiv));
  Object.keys(plugins.knownPlugins).forEach(function (name) {
    var box = $('<input/>', {
      class: 'pluginCheckbox',
      type: 'checkbox',
      name: name,
      value: name,
    }).after(name);
    box.click(loadTranslatedText);
    box.appendTo($(mydiv));
  });

  editor.on('change', loadTranslatedText);
  $('#checkbox1').change(loadTranslatedText);
  var timeout;
  $('#bashcode').keypress(function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(function () {
      if (errMessage) {
        console.error(errMessage);
        warned = true;
      }
    }, 3000);
  });
  loadTranslatedText();

  // Load in a hint
  var idx = Math.floor(Math.random() * hints.length);
  document.getElementById('hint-body').innerHTML = hints[idx];
});
