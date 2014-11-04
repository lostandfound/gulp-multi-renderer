"use strict";

var gulp = require('gulp');
var gutil = require('gulp-util');
var debug = require('gulp-debug');
var frontMatter = require('gulp-front-matter');

var expect = require('chai').expect;

var es = require('event-stream');
var fs = require('fs');
var path = require('path');
var stream = require('stream');

var renderer = require('../');

var srcDir = __dirname + '/fixtures/src/';
var destDir = __dirname + '/fixtures/dest/';
var templateDir = __dirname + '/fixtures/layouts/';

function test (input, options, check) {

  if(options.property) {
    var property = options.property;
  } else {
    var property = "frontMatter";
  }

  return function (done) {
    gulp.src(input)
      // Keep original contents
      .pipe(es.map(function (file, cb) {
        file.originalContents = file.contents;
        cb(null, file);
      }))
      .pipe(frontMatter({
        remove: true,
        property: property
      }))
      // Execute plugin
      .pipe(renderer(options))
      // Test
      .pipe(es.map(check).on('end', done));
  };
}

describe('gulp-multi-renderer', function() {

  it('should keep contents unchanged if file has no template markup', test(srcDir + 'sample.md', {target: "content"}, function (file, cb) {
    expect(String(file.originalContents)).to.equal(String(file.contents));
    cb();
  }));

  it('should render EJS template within the contents', test(srcDir + 'content-ejs.md', {target: "content"}, function (file, cb) {
    var result = fs.readFileSync(destDir + "content.md", 'utf-8');
    expect(String(file.contents)).to.equal(result);
    cb();
  }));

  it('should render Mustache template within the contents', test(srcDir + 'content-mustache.md', {target: "content"}, function (file, cb) {
    var result = fs.readFileSync(destDir + "content.md", 'utf-8');
    expect(String(file.contents)).to.equal(result);
    cb();
  }));

  it('should be able to customize property name', test(srcDir + 'custom-prop.md', {target: "content", property: "page"}, function (file, cb) {
    var result = fs.readFileSync(destDir + "content.md", 'utf-8');
    expect(String(file.contents)).to.equal(result);
    cb();
  }));

  it('should render default EJS template file', test(srcDir + 'wrap-default.md', {target: "wrap", templateDir: templateDir}, function (file, cb) {
    var result = fs.readFileSync(destDir + "wrap-default.html", 'utf-8');
    expect(String(file.contents)).to.equal(result);
    cb();
  }));

  it('should render EJS template file', test(srcDir + 'wrap-ejs.md', {target: "wrap", templateDir: templateDir}, function (file, cb) {
    var result = fs.readFileSync(destDir + "wrap-default.html", 'utf-8');
    expect(String(file.contents)).to.equal(result);
    cb();
  }));

  it('should render Mustache template file', test(srcDir + 'wrap-mustache.md', {target: "wrap", templateDir: templateDir}, function (file, cb) {
    var result = fs.readFileSync(destDir + "wrap-default.html", 'utf-8');
    expect(String(file.contents)).to.equal(result);
    cb();
  }));

  it('should render Jade template file', test(srcDir + 'wrap-jade.md', {target: "wrap", templateDir: templateDir}, function (file, cb) {
    var result = fs.readFileSync(destDir + "wrap-jade.html", 'utf-8');
    expect(String(file.contents)).to.equal(result);
    cb();
  }));

  it ('should get stream file through', function (done) {
    var streamFile = new gutil.File({ contents: new stream.Stream() });
    var res = renderer()
      .on('data', function (file) {
        expect(file).to.be.equal(streamFile);
      })
      .on('end', done);
    res.write(streamFile);
    res.end();
  });

  it ('should get null file through', function (done) {
    var nullFile = new gutil.File();
    var res = renderer()
      .on('data', function (file) {
        expect(file).to.be.equal(nullFile);
      })
      .on('end', done);
    res.write(nullFile);
    res.end();
  });
});
