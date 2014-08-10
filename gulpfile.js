var gulp = require('gulp');
var coffee = require('gulp-coffee');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var paths = {
  scripts : {
    destoroyah : './src/destoroyah/main.coffee',
    karma : './src/karma/*.coffee'
  }
};

gulp.task('build-destoroyah', function() {
  return gulp.src(paths.scripts.destoroyah, {read : false})
  .pipe(browserify({
    transform : ['coffeeify'],
    extensions : ['.coffee']
  }))
  .pipe(rename('destoroyah.js'))
  .pipe(gulp.dest('./lib'));
});

gulp.task('build-karma', function() {
  return gulp.src(paths.scripts.karma)
  .pipe(coffee())
  .pipe(gulp.dest('./lib'));
});

gulp.task('default', ['build-destoroyah', 'build-karma']);

gulp.task('watch', ['default'], function() {
  gulp.watch(paths.scripts.destoroyah, ['build-destoroyah']);
  gulp.watch(paths.scripts.karma, ['build-karma']);
});
