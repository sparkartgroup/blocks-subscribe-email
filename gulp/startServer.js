var gulp = require('gulp');
var http = require('http');
var ecstatic = require('ecstatic');

gulp.task('startServer', function() {
  http.createServer(
    ecstatic({ root: './' })
  ).listen(8080);

  console.log('Listening on :8080');
});