'use strict';

var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var through = require('through2');
var fs = require('fs');

var ejs = require('ejs');
var mustache = require('mustache');
var jade = require('jade');


function renderTemplate(template, data, engine) {

  engine = engine || 'ejs';

  // Jade
  if(engine == 'jade') {
    try {
      return new Buffer(jade.render(template, data));
    } catch (e) {}
  }

  // mustache
  if(engine == 'mustache') {
    try {
      return new Buffer(mustache.render(template, data));
    } catch (e) {}
  }

  // EJS
  if(engine == 'ejs') {
    try {
      return new Buffer(ejs.render(template, data));
    } catch (e) {}
  }

  return new Buffer(template);
}

function findTemplate(data, layout, dir) {

  var template;

  // Jadeのレイアウト
  try {
    template = fs.readFileSync(dir + "/" + layout + ".jade", 'utf-8');
    return renderTemplate(template, data, "jade");
  } catch (e) {}

  // Mustacheのレイアウト
  try {
    template = fs.readFileSync(dir + "/" + layout + ".mustache", 'utf-8');
    return renderTemplate(template, data, "mustache");
  } catch (e) {}

  // EJSのレイアウト
  try {
    template = fs.readFileSync(dir + "/" + layout + ".ejs", 'utf-8');
    return renderTemplate(template, data, "ejs");
  } catch (e) {}

  // デフォルトレイアウト
  try {
    template = fs.readFileSync(dir + "/" + "default.ejs", 'utf-8');
    return renderTemplate(template, data, "ejs");
  } catch (e) {
    console.log(e.toString());
  }
}

function gulpMultiRenderer(options) {

  var output = through.obj(function (file, enc, callback) {

    // inital values for options
    options = options || {};
    options.target = typeof options.target === "undefined" ? "wrap" : options.target;
    options.property = typeof options.property === "undefined" ? "frontMatter" : options.property;
    options.templateDir = typeof options.templateDir === "undefined" ? "./layouts/" : options.templateDir;

    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    if (file.isStream()) {
      this.push(file);
      return callback();
    }

    // initialize local data
    var local =  {};
    local[options.property] = file[options.property];
    local[options.property].engine = typeof local[options.property].engine === "undefined" ? "ejs" : local[options.property].engine;

    // render template within the file.contents
    if(options.target == 'content') {
       file.contents = renderTemplate(String(file.contents), local, local[options.property].engine);
       this.push(file);
       return callback();
    }

    // render template file to wrap the file.contents
    if(options.target == 'wrap') {
      var layout = typeof local[options.property].layout === "undefined" ? "default" : local[options.property].layout;
      local.contents = file.contents;

      file.contents = findTemplate(local, layout, options.templateDir);
      this.push(file);
      return callback();
    }

    this.push(file);
    return callback();
  });

   return output;
};

module.exports = gulpMultiRenderer;
