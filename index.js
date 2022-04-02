"use strict";

const through = require("through2");
const PluginError = require("plugin-error");
const htmlParser = require("node-html-parser");

const PLUGIN_NAME = "gulp-html-anchor-rewriter";

class Plugin {

    /**
    * The plugin config object.
    * @typedef {Object} PluginConfig
    * @property {string | Array.<string>} keyword For searching the anchor element href attribute value. If the href contains the keyword, the anchor will be processed.
    * @property {string} rel For adding rel attribute.
    * @property {string} target For adding target attribute.
    * @property {boolean} whiteList Indicates whether the white-list mode is enabled.
    */

    /**
     * @type {PluginConfig}
     */
    #options;

    /**
     * Creates a new instance of the plugin.
     * @param {PluginConfig} options The configuration object.
     */
    constructor(options) {
        this.#options = options;
    }

    /**
     * @returns {string}
     */
    get #keyword() {
        return this.#options["keyword"];
    }

    /**
     * @returns {string}
     */
    get #rel() {
        return this.#options["rel"];
    }

    /**
     * @returns {string}
     */
    get #target() {
        return this.#options["target"];
    }

    /**
     * @returns {boolean}
     */
    get #whiteList() {
        return this.#options["whiteList"];
    }

    /**
     * Runs the plugin logic.
     * @param {string} content The raw content of the file.
     * @returns {string}
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

    /**
     * Validates the configuration options.
     * @returns {PluginError}
     */
    validate() {
        if (!this.#options) {
            return new PluginError(PLUGIN_NAME, "The options are missing!");
        }

        if (this.#keyword) {
            let isValid = Array.isArray(this.#keyword) || typeof this.#keyword === "string";
            if (!isValid) {
                return new PluginError(PLUGIN_NAME, "The keyword must be string or array of the strings!");
            }
        }
    }

    /**
     * Processes the rules for an anchor element.
     * @param {htmlParser.HTMLElement} anchorElement The anchor element.
     * @param {string | Array.<string>} keyword The keyword.
     * @param {string} rel The rel attribute.
     * @param {string} target The target attribute.
     * @param {boolean} whiteList Indicates whether the white-list mode is enabled.
     */
    #processAnchor(anchorElement, keyword, rel, target, whiteList) {

        if (!keyword) {
            this.#setAttribute(anchorElement, rel, target);
            return;
        }

        let keywords = keyword;
        if (typeof keyword === "string") {
            keywords = [keyword];
        }

        if (!this.#canExecute(anchorElement, keywords, whiteList)) {
            return;
        }

        this.#setAttribute(anchorElement, rel, target);
    }

    /**
     * Sets the anchor attributes.
     * @param {htmlParser.HTMLElement} anchorElement The anchor element.
     * @param {string} rel The rel attribute.
     * @param {string} target The target attribute. 
     */
    #setAttribute(anchorElement, rel, target) {
        if (rel && !anchorElement.getAttribute("rel")) {
            anchorElement.setAttribute("rel", rel);
        }

        if (target && !anchorElement.getAttribute("target")) {
            anchorElement.setAttribute("target", target);
        }
    }

    /**
     * Determines an anchor element will be re-write or not.
     * @param {htmlParser.HTMLElement} anchorElement The anchor element.
     * @param {string | Array.<string>} keywords The array of the keywords.
     * @param {boolean} whiteList Indicates whether the white-list mode is enabled.
     * @returns {boolean}
     */
    #canExecute(anchorElement, keywords, whiteList) {
        var href = anchorElement.getAttribute("href");

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

        let validationResult = plugin.validate();
        if (validationResult) {
            cb(validationResult, file);
            return;
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

        let content = file.contents.toString();
        let pluginOutput = plugin.run(content);

        file.contents = Buffer.from(pluginOutput);

        cb(null, file);
    });
}

// Exporting the plugin main function
module.exports = pluginFunction;