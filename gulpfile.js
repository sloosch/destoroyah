var gulp = require('gulp');
var coffee = require('gulp-coffee');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var header = require('gulp-header');
var paths = {
  scripts : {
    destoroyah : './src/destoroyah/*.coffee',
    destoroyahWeb : './src/destoroyah/index.coffee',
    destoroyahBin : './src/bin/*.coffee',
    karma : './src/karma/*.coffee',
    reporter : './src/reporter/*.coffee',
    runner : './src/runner/*.coffee'
  }
};

gulp.task('destoroyah-web', function() {
  return gulp.src(paths.scripts.destoroyahWeb, {read : false})
  .pipe(browserify({
    transform : ['coffeeify'],
    extensions : ['.coffee']
  }))
  .pipe(rename('destoroyah.js'))
  .pipe(gulp.dest('./lib/destoroyah/web'));
});

gulp.task('destoroyah', function() {
  return gulp.src(paths.scripts.destoroyah)
  .pipe(coffee({bare : true}))
  .pipe(gulp.dest('./lib/destoroyah'));
});

gulp.task('destoroyah-bin', function() {
  return gulp.src(paths.scripts.destoroyahBin)
  .pipe(coffee({bare : true}))
  .pipe(rename(function(path) {path.extname = '';}))
  .pipe(header('#!/usr/bin/env node\n'))
  .pipe(gulp.dest('./bin'));
});

gulp.task('reporter', function() {
  return gulp.src(paths.scripts.reporter)
  .pipe(coffee({bare : true}))
  .pipe(gulp.dest('./lib/reporter'));
});

gulp.task('karma', function() {
  return gulp.src(paths.scripts.karma)
  .pipe(coffee())
  .pipe(gulp.dest('./lib/destoroyah/web/karma'));
});

gulp.task('runner', function() {
  return gulp.src(paths.scripts.runner)
  .pipe(coffee({bare : true}))
  .pipe(gulp.dest('./lib/runner'));
});

gulp.task('default', ['destoroyah', 'destoroyah-bin', 'reporter', 'runner', 'destoroyah-web', 'karma']);

gulp.task('watch', ['default'], function() {
  gulp.watch(paths.scripts.destoroyah, ['destoroyah', 'destoroyah-web']);
  gulp.watch(paths.scripts.destoroyahBin, ['destoroyah-bin']);
  gulp.watch(paths.scripts.karma, ['karma']);
  gulp.watch(paths.scripts.reporter, ['reporter']);
  gulp.watch(paths.scripts.runner, ['runner']);
});
