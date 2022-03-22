"use strict";

const through = require("through2");
const PluginError = require("plugin-error");
const htmlParser = require("node-html-parser");

const PLUGIN_NAME = "gulp-html-anchor-rewriter";

function pluginFunction(options) {

    // throws exception with missing options.
    if (!options) {
        throw new PluginError(PLUGIN_NAME, "The options are missing!");
    }

    return through.obj(function (file, encoding, cb) {

        // ignore empty files.
        if (file.isNull()) {
            cb();
            return;
        }

        // streaming is not supported.
        if (file.isStream()) {
            cb(new PluginError(PLUGIN_NAME, "The streaming is not supported!"), file);
            return;
        }

        var rawContent = file.contents.toString();
        var html = htmlParser.parse(rawContent);
        var anchors = html.querySelectorAll("a");

        anchors.forEach(function (element) {

            if (options["keyword"]) {
                var href = element.getAttribute("href");
                if (href.indexOf(options["keyword"]) === -1) {
                    return;
                }
            }

            if (options["rel"] && !element.getAttribute("rel")) {
                element.setAttribute("rel", options["rel"]);
            }

            if (options["target"] && !element.getAttribute("target")) {
                element.setAttribute("target", options["target"]);
            }
        });

        file.contents = Buffer.from(html.toString());

        cb(null, file);
    });
}

// Exporting the plugin main function
module.exports = pluginFunction;