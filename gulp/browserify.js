var browserify   = require('browserify');
var bundleLogger = require('./util/bundleLogger');
var gulp         = require('gulp');
var handleErrors = require('./util/handleErrors');
var source       = require('vinyl-source-stream');

gulp.task('browserify', function() {
  var bundler = browserify({
    entries: ['./src/subscribe-email.js'],
    extensions: ['.hbs'],
    standalone: 'SubscribeEmail'
  });

  var bundle = function() {
    bundleLogger.start();

    return bundler
      .bundle()
      .on('error', handleErrors)
      .pipe(source('subscribe-email.js'))
      .pipe(gulp.dest('./build/'))
      .on('end', bundleLogger.end);
  };

  return bundle();
});