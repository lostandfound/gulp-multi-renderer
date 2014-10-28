var gulp = require('gulp');
var debug = require('gulp-debug');
var frontMatter = require('gulp-front-matter');
var marked = require('gulp-marked');

var renderer = require('./index');

gulp.task('site', function() {
  gulp.src('./src/*.md')
  .pipe(frontMatter({
    remove: true
  }))
  .pipe(renderer({
    process: "pre"
  }))
  .pipe(marked())
  .pipe(renderer({
    process: "post"
  }))
  .pipe(gulp.dest('dest'))
  .pipe(debug({verbose: true}))
});

gulp.task('default', ['site'], function() {
});