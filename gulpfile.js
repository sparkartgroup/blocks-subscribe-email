/*
  gulpfile.js
  ===========
  Rather than manage one giant configuration file responsible
  for creating multiple tasks, each task has been broken out into
  its own file in `/gulp`. Any file in that folder gets automatically
  required below.

  To add a new task, simply add a new task file to the `/gulp` directory.
*/
var gulp = require('gulp');
var requireDir = require('require-dir');
var runSequence = require('run-sequence');

// Require all tasks in gulp/tasks, including subfolders
requireDir('./gulp', { recurse: true });

// Task groups
gulp.task('default', ['build', 'startServer']);
gulp.task('test', function(callback) {
  runSequence('default',
              'BrowserStackTunnel',
              'mocha',
              callback);
});
gulp.task('build', ['browserify']);