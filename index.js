'use strict';

var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var through = require('through2');
var fs = require('fs');

var ejs = require('ejs');
var mustache = require('mustache');
var jade = require('jade');

function renderTemplate(dir, layout, data) {

  var template = null

  // Jadeのレイアウト
  try {
    template = fs.readFileSync(dir + "/" + layout + ".jade", 'utf-8');
    return new Buffer(jade.render(template, data));
  } catch (e) {}

  // Mustacheのレイアウト
  try {
    template = fs.readFileSync(dir + "/" + layout + ".mustache", 'utf-8');
    return new Buffer(mustache.render(template, data));
  } catch (e) {}

  // EJSのレイアウト
  try {
    template = fs.readFileSync(dir + "/" + layout + ".ejs", 'utf-8');
    return new Buffer(ejs.render(template, data));
  } catch (e) {}

  // デフォルトレイアウト
  try {
    template = fs.readFileSync(dir + "/" + "default.ejs", 'utf-8');
    return new Buffer(ejs.render(template, data));
  } catch (e) {
    console.log(e.toString());
  }
}

function gulpMultiRenderer(options, settings)  {

  // inital values for options
  options = options || {};
  options.process = typeof options.process === "undefined" ? "post" : options.process;
  options.property = typeof options.property === "undefined" ? "frontMatter" : options.property;
  options.templateDir = typeof options.templateDir === "undefined" ? "./layouts/" : options.templateDir;

  // inital values for settings
  settings = settings || {};

  var output = through.obj(function (file, enc, callback) {

    if (file.isNull()) {
      this.push(file); // 入力なしの場合は何もしない
      return callback();
    }

    if (file.isStream()) {
      this.push(file); // ストリームの場合は何もしない
      return callback();
    }

    // initialize data
    var data =  {};
    data[options.property] = file[options.property];
    data[options.property].local = typeof data[options.property].local === "undefined" ? "ejs" : data[options.property].local;

    // 前処理
    if(options.process == 'pre') {

      // Mustacheテンプレート
      if(data[options.property].local == 'mustache') {
        try {
          file.contents = new Buffer(mustache.render(file.contents.toString(), data));
        } catch (e) {
          this.emit('error', new gutil.PluginError('gulp-multi-renderer', e.toString()));
        }

        this.push(file);
        return callback();
      }

      // EJSテンプレート
      if(data[options.property].local == 'ejs') {
        try {
          file.contents = new Buffer(ejs.render(file.contents.toString(), data));
        } catch (e) {
          this.emit('error', new gutil.PluginError('gulp-multi-renderer', e.toString()));
        }
        
        this.push(file);
        return callback();
      }

      // 何もしない
      this.push(file);
      return callback();
    }

    // 後処理
    if(options.process == 'post') {
      var layout = typeof data[options.property].layout === "undefined" ? "default" : data[options.property].layout;
      data.contents = file.contents;

      var bf = renderTemplate(options.templateDir, layout, data);

      if (Buffer.isBuffer(bf)) {
        file.contents = bf;
      }

      this.push(file);
      return callback();
    }

    this.push(file);  // 処理の指定がpre/postでなければ何もしない
    return callback();
  });

  return output;
};

// プラグイン関数をエクスポート
module.exports = gulpMultiRenderer;