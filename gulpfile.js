var gulp = require('gulp');
var runSequence = require('run-sequence');
var browserify = require('browserify');
var hbsfy = require('hbsfy');
var source = require('vinyl-source-stream');
var derequire = require('gulp-derequire');
var http = require('http');
var ecstatic = require('ecstatic');
var BrowserStackTunnel = require('browserstacktunnel-wrapper');
var mocha = require('gulp-spawn-mocha');

function handleError(err) {
  console.log(err.message);
  this.emit('end');
}

// Task groups
gulp.task('default', ['build', 'build-tests', 'start-server']);

gulp.task('test', function(cb) {
  runSequence(
    ['build', 'build-tests', 'start-server', 'start-browserstack-tunnel'],
    'run-selenium',
    ['stop-test-server', 'stop-browserstack-tunnel'],
    cb
  );
});

gulp.task('manual-test', ['default', 'start-browserstack-tunnel'])

gulp.task('build', function() {
  var bundler = browserify({
    entries: ['./src/subscribe-email.js'],
    standalone: 'SubscribeEmail'
  });
  var bundle = function() {
    return bundler
      .transform(hbsfy)
      .bundle()
      .pipe(source('subscribe-email.js'))
      .pipe(derequire())
      .pipe(gulp.dest('./build/'));
  };
  return bundle();
});

gulp.task('build-tests', function() {
  var bundler = browserify({
    entries: ['./test/tests.js']
  });
  var bundle = function() {
    return bundler
      .transform({global: true}, hbsfy)
      .bundle()
      .pipe(source('tests.js'))
      .pipe(derequire())
      .pipe(gulp.dest('./test/mocha/'));
  };
  return bundle();
});

var devServer;
gulp.task('start-server', function(cb) {
  devServer = http.createServer(
    ecstatic({ root: './' })
  ).listen(8080);
  console.log('Listening on :8080');
  cb();
});

gulp.task('stop-test-server', function(cb) {
  devServer.close(cb);
});

var browserStackTunnel;
gulp.task('start-browserstack-tunnel', function(cb) {
  browserStackTunnel = new BrowserStackTunnel({
    key: '',
    hosts: [{
      name: 'localhost',
      port: 3000,
      sslFlag: 0
    }],
    v: true
  });
  browserStackTunnel.start(function(error) {
    if (error) {
      console.log(error);
    } else {
      console.log('BrowserStack Tunnel Started');
      cb();
    }
  });
});

gulp.task('stop-browserstack-tunnel', function(cb) {
  browserStackTunnel.stop(cb);
});

gulp.task('run-selenium', function () {
  return gulp.src('test/selenium-driver.js', {read: false})
    .pipe(mocha({timeout: 55000}))
    .on('error', handleError);
});