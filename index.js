/* jshint node:true */
"use strict";

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

function gulpMultiRenderer(options) {
    return require("through2").obj(function (file, encoding, callback) {
        // Only try to process the stream if it actually _is_ a stream.
        if (!file.isNull() || !file.isStream()) {
            var merge = require("merge");

            // Merge default with user supplied options.
            options = merge(defaultOptions, options);

            // Merge default front matter with extracted options.
            file[options.property] = merge(defaultFrontMatterOptions, file[options.property]);

            // Allow direct access of front matter options.
            var template = file[options.property];

            try {
                // We only want to process the markdown file.
                if (options.target === "content") {
                    file.contents = String(file.contents);
                }
                // We want to process the actual template with the desired renderer.
                else if (options.target === "wrap") {
                    file.contents = require("fs").readFileSync(
                        options.templateDir + "/" + template.layout + "." + template.engine,
                        encoding
                    );
                }

                // Let the actual rendering engine perform its magic.
                file.contents = new Buffer(require(template.engine).render(file.contents, file));
            } catch (e) {
                require("gulp-util").PluginError("gulp-multi-renderer", e);
            }
        }

        this.push(file);
        return callback();
    });
}

module.exports = gulpMultiRenderer;
