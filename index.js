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

    return through.obj(function (file, _encoding, cb) {

        if (options["keyword"]) {
            var isValid = Array.isArray(options["keyword"]) || typeof options["keyword"] === "string";
            if (!isValid) {
                cb(new PluginError(PLUGIN_NAME, "The keyword must be string or array of the strings!", file));
                return;
            }
        }

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
            processAnchor(element, options["keyword"], options["rel"], options["target"], options["whiteList"])
        });

        file.contents = Buffer.from(html.toString());

        cb(null, file);
    });

    function processAnchor(element, keyword, rel, target, whiteList) {

        if (!keyword) {
            setAttribute(element, rel, target);
            return;
        }

        var keywords = keyword;
        if (typeof keyword === "string") {
            keywords = [keyword];
        }

        if (!canExecute(element, keywords, whiteList)) {
            return;
        }

        setAttribute(element, rel, target);
    }

    function setAttribute(element, rel, target) {
        if (rel && !element.getAttribute("rel")) {
            element.setAttribute("rel", rel);
        }

        if (target && !element.getAttribute("target")) {
            element.setAttribute("target", target);
        }
    }

    function canExecute(element, keywords, whiteList) {
        var href = element.getAttribute("href");

        var result = keywords.some(function (k) {
            return href.indexOf(k) >= 0;
        });

        if (!whiteList) {
            return result;
        }
        else {
            return !result;
        }
    }
}

// Exporting the plugin main function
module.exports = pluginFunction;