var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('mocha', function () {
    return gulp.src('tests/mocha-test.js', {read: false})
        .pipe(mocha({timeout: 55000}));
});