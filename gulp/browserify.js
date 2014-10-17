var browserify   = require('browserify');
var bundleLogger = require('./util/bundleLogger');
var gulp         = require('gulp');
var handleErrors = require('./util/handleErrors');
var source       = require('vinyl-source-stream');
var derequire    = require('gulp-derequire');

var hbsfy = require('hbsfy');

gulp.task('browserify', function() {
  var bundler = browserify({
    entries: ['./src/subscribe-email.js'],
    standalone: 'SubscribeEmail'
  });

  var bundle = function() {
    bundleLogger.start();

    return bundler
      .transform(hbsfy)
      .bundle()
      .on('error', handleErrors)
      .pipe(source('subscribe-email.js'))
      .pipe(derequire())
      .pipe(gulp.dest('./build/'))
      .on('end', bundleLogger.end);
  };

  return bundle();
});