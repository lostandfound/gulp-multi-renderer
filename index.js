/* jshint node:true */
"use strict";

var gutil = require("gulp-util");
var PluginError = gutil.PluginError;
var through = require("through2");
var fs = require("fs");
var ejs = require("ejs");
var mustache = require("mustache");
var jade = require("jade");

/**
 * Default options for this module.
 * @type {{property: string, target: string, templateDir: string}}
 */
var defaultOptions = {
    property: "frontMatter",
    target: "wrap",
    templateDir: "./layouts"
};

function renderTemplate(template, data, engine) {
    return new Buffer(require(engine).render(template, data));
}

function findTemplate(data, layout, dir) {
    return renderTemplate(fs.readFileSync(dir + "/" + layout + "." + data.engine), data, data.engine, "utf-8");
}

function gulpMultiRenderer(options) {
    return through.obj(function (file, encoding, callback) {
        // Only try to process the stream if it actually _is_ a stream.
        if (!file.isNull() || !file.isStream()) {
            var merge = require("merge");

            // Merge default with user supplied options.
            options = merge(defaultOptions, options);

            // initialize local data
            var local = {};
            local[options.property] = file[options.property];
            local[options.property].engine = typeof local[options.property].engine === "undefined" ? "ejs" : local[options.property].engine;

            // render template within the file.contents
            if (options.target === "content") {
                file.contents = renderTemplate(String(file.contents), local, local[options.property].engine);
                this.push(file);
                return callback();
            }

            // render template file to wrap the file.contents
            if (options.target === "wrap") {
                var layout = typeof local[options.property].layout === "undefined" ? "default" : local[options.property].layout;
                local.contents = file.contents;

                file.contents = findTemplate(local, layout, options.templateDir);
                this.push(file);
                return callback();
            }
        }

        this.push(file);
        return callback();
    });
}

module.exports = gulpMultiRenderer;
