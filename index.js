/* jshint node:true */

/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Bas van Driel
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
"use strict";

/**
 * Gulp multi renderer node.js module.
 *
 * @author lost_and_found <?>
 * @author Richard Fussenegger <richard@fussenegger.info>
 * @copyright 2014 lost_and_found
 * @license MIT
 * @link https://github.com/Fleshgrinder/gulp-multi-renderer
 */

/**
 * Default options for front matter module.
 * @type {{engine: string, layout: string}}
 */
var defaultFrontMatterOptions = {
    engine: "ejs",
    layout: "default"
};

/**
 * Default options for this module.
 * @type {{property: string, target: string, templateDir: string}}
 */
var defaultOptions = {
    property: "frontMatter",
    target: "wrap",
    templateDir: "./layouts"
};

/**
 * Handle gulp stream.
 * @param {{property: string, target: string, templateDir: string}} options - User defined options for this module.
 * @return {Stream} - The handled gulp stream.
 */
function gulpMultiRenderer(options) {
    return require("through2").obj(function (file, encoding, callback) {
        // Only try to process the stream if it actually _is_ a stream.
        if (!file.isNull() && !file.isStream()) {
            var merge = require("merge");

            // Merge default with user supplied options.
            options = merge({}, defaultOptions, options);

            // Merge default front matter with extracted options.
            file[options.property] = merge({}, defaultFrontMatterOptions, file[options.property]);

            // Allow direct access of front matter options.
            var template = file[options.property];

            try {
                // We only want to process the markdown file.
                if (options.target === "content") {
                    template.contents = String(file.contents);
                }
                // We want to process the actual template with the desired renderer.
                else if (options.target === "wrap") {
                    template.contents = require("fs").readFileSync(
                        options.templateDir + "/" + template.layout + "." + template.engine,
                        encoding
                    );
                }

                // Let the actual rendering engine perform its magic.
                file.contents = new Buffer(require(template.engine).render(template.contents, file));
            } catch (e) {
                console.error(e);
            }
        }

        this.push(file);
        return callback();
    });
}

// Export the module.
module.exports = gulpMultiRenderer;
