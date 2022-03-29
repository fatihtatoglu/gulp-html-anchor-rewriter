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
            processAnchor(element, options["keyword"], options["rel"], options["target"], options["whiteList"])
        });

        file.contents = Buffer.from(html.toString());

        cb(null, file);
    });

    function processAnchor(element, keyword, rel, target, whiteList) {
        if (typeof keyword === "string") {
            var href = element.getAttribute("href");
            if (!canExecute(element, keyword, whiteList)) {
                return;
            }

            setAttribute(element, rel, target);
        }
        else if (Array.isArray(keyword)) {
            keyword.forEach(function (k) {
                processAnchor(element, k, rel, target, whiteList);
            });
        }

        if (!keyword) {
            setAttribute(element, rel, target);
        }
    }

    function setAttribute(element, rel, target) {
        if (rel && !element.getAttribute("rel")) {
            element.setAttribute("rel", rel);
        }

        if (target && !element.getAttribute("target")) {
            element.setAttribute("target", target);
        }
    }

    function canExecute(element, keyword, whiteList) {
        var href = element.getAttribute("href");

        if (!whiteList) {
            if (href.indexOf(keyword) === -1) {
                return false;
            }
        }
        else {
            if (href.indexOf(keyword) > -1) {
                return false;
            }
        }

        return true;
    }
}

// Exporting the plugin main function
module.exports = pluginFunction;