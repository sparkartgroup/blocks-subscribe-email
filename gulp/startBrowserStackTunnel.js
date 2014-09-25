var gulp = require('gulp');
var BrowserStackTunnel = require('browserstacktunnel-wrapper');

gulp.task('BrowserStackTunnel', function(cb) {
  var browserStackTunnel = new BrowserStackTunnel({
    key: '***REMOVED***',
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