"use strict";

const through = require("through2");
const PluginError = require("plugin-error");
const htmlParser = require("node-html-parser");

const PLUGIN_NAME = "gulp-html-anchor-rewriter";

class Plugin {

    #options;

    constructor(options) {
        this.#validateOption(options);
        this.#options = options;
    }

    get #keyword() {
        return this.#options["keyword"];
    }

    get #rel() {
        return this.#options["rel"];
    }

    get #target() {
        return this.#options["target"];
    }

    get #whiteList() {
        return this.#options["whiteList"];
    }

    /**
     * Runs the plugin logic.
     * @param {String} content The raw content of the file.
     * @returns {String}
     */
    run(content) {
        let that = this;
        let html = htmlParser.parse(content);
        let anchors = html.querySelectorAll("a");

        anchors.forEach(function (element) {
            that.#processAnchor(element, that.#keyword, that.#rel, that.#target, that.#whiteList);
        });

        return html.toString();
    }

    #validateOption(options) {
        if (!options) {
            throw new PluginError(PLUGIN_NAME, "The options are missing!");
        }

        if (options["keyword"]) {
            var isValid = Array.isArray(options["keyword"]) || typeof options["keyword"] === "string";
            if (!isValid) {
                throw new PluginError(PLUGIN_NAME, "The keyword must be string or array of the strings!");
            }
        }
    }

    #processAnchor(element, keyword, rel, target, whiteList) {

        if (!keyword) {
            this.#setAttribute(element, rel, target);
            return;
        }

        var keywords = keyword;
        if (typeof keyword === "string") {
            keywords = [keyword];
        }

        if (!this.#canExecute(element, keywords, whiteList)) {
            return;
        }

        this.#setAttribute(element, rel, target);
    }

    #setAttribute(element, rel, target) {
        if (rel && !element.getAttribute("rel")) {
            element.setAttribute("rel", rel);
        }

        if (target && !element.getAttribute("target")) {
            element.setAttribute("target", target);
        }
    }

    #canExecute(element, keywords, whiteList) {
        var href = element.getAttribute("href");

        var result = keywords.some(function (k) {
            return href.indexOf(k) >= 0;
        });

        if (!whiteList) {
            return result;
        }

        return !result;
    }
}

function pluginFunction(options) {

    var plugin = new Plugin(options);

    return through.obj(function (file, _encoding, cb) {

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

        let rawContent = file.contents.toString();
        let pluginOutput = plugin.run(rawContent);

        file.contents = Buffer.from(pluginOutput);

        cb(null, file);
    });
}

// Exporting the plugin main function
module.exports = pluginFunction;