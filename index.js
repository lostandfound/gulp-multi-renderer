/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Bas van Driel
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Gulp multi renderer node.js module.
 *
 * @author Hiroshi Takase <itshustletime@gmail.com>
 * @author Richard Fussenegger <richard@fussenegger.info>
 * @copyright 2014 Hiroshi Takase
 * @license http://en.wikipedia.org/wiki/MIT_License MIT
 * @link https://github.com/lostandfound/gulp-multi-renderer
 */
var fs = require('fs');
var gutil = require('gulp-util');
var merge = require('merge');
var through = require('through2');

/**
 * Name of the gulp plugin.
 *
 * @type {string}
 */
const PLUGIN_NAME = 'gulp-multi-renderer';

/**
 * Content target.
 *
 * @var {string}
 */
const TARGET_CONTENT = 'content';
module.exports.TARGET_CONTENT = TARGET_CONTENT;

/**
 * Wrap target.
 *
 * @var {string}
 */
const TARGET_WRAP = 'wrap';
module.exports.TARGET_WRAP = TARGET_WRAP;

/**
 * Default options for front matter module.
 *
 * @type {{engine: string, layout: string}}
 */
var defaultFrontMatterOptions = {
    engine: 'ejs',
    layout: 'default'
};

/**
 * Default options for this module.
 *
 * @type {{property: string, target: string, templateDir: string}}
 */
var defaultOptions = {
    property: 'frontMatter',
    target: TARGET_WRAP,
    templateDir: './layouts'
};

/**
 * Handle gulp stream.
 *
 * @param {{property: string, target: string, templateDir: string}|string} options - User defined options for this module.
 * @return {Stream} - The handled gulp stream.
 */
module.exports = function gulpMultiRenderer(options) {
    if (typeof options === 'string') {
        options = { target: options };
    }

    options = merge({}, defaultOptions, options);

    return through.obj(function (file, encoding, callback) {
        var self = this;

        if (file.isNull()) {
            callback(null, file);
            return;
        }

        // TODO: Handle streams as well.
        if (file.isStream()) {
            throw new gutil.PluginError(PLUGIN_NAME, 'Streaming is not supported.');
        }

        file[options.property] = merge({}, defaultFrontMatterOptions, file[options.property]);

        var template = file[options.property];

        if (options.target === TARGET_CONTENT) {
            file.filename = file.path;
            file.contents = new Buffer(require(template.engine).render(file.contents.toString(), file));

            this.push(file);
            callback();
        } else if (options.target === TARGET_WRAP) {
            file.filename = options.templateDir + '/' + template.layout + '.' + template.engine;

            fs.readFile(file.filename, { encoding: encoding }, function (error, data) {
                if (error) {
                    throw new gutil.PluginError(PLUGIN_NAME, error, { file: file.path });
                }

                file.contents = new Buffer(require(template.engine).render(data, file));

                self.push(file);
                callback();
            });
        } else {
            gutil.log(gutil.colors.cyan(PLUGIN_NAME), 'unknown target supplied "', gutil.colors.red(options.target), '".');

            this.push(file);
            callback();
        }
    });
};
