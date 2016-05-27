var path = require('path');
var gulp = require('gulp');
require('shelljs/global');

gulp.task('default', function() {
  exec('node ' + [
      path.join(__dirname, 'node_modules', '.bin', 'ohm-builder.js'),
      path.join(__dirname, 'src/index.generator.html'),
      path.join(__dirname, 'index.html')
    ].join(' '));
});
