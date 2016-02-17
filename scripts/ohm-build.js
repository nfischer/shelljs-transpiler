#!/usr/bin/env node
require('shelljs/global');

config.fatal = true;

if (process.argv.length < 4) {
  echo('Usage: ' + process.argv[1] + ' <html_input> <html_output>');
  exit(1);
}

var html_input = process.argv[2];
var output_file = process.argv[3];

if (html_input === output_file) {
  echo('Must provide different file names');
  exit(2);
}

// Replace all ohm tags with inlining the code


var matchString = '<script src=".*.ohm" type="text/ohm-js"></script>';
var oput = grep(matchString, html_input);
if (!oput) {
  matchString = '<script type="text/ohm-js" src=".*.ohm"></script>';
  oput = grep(matchString, html_input);
}
if (!oput) {
  echo('Could not find script tag');
  exit(3);
}
var ohm_file = oput.match(/src="(.*)"/)[1];
var ohm_grammar = cat(ohm_file);
var newTag = oput.replace('></script>', '>\n' + ohm_grammar + '\n</script>').replace(/\s+src=".*"/, '');
console.log(newTag);
console.log(matchString);
console.log(html_input);
var output = sed(oput, newTag, html_input);
if (output === cat(html_input)) {
  echo('No replacement was made. Internal error.');
  exit(4);
}

output.to(output_file);
echo('Success!');
