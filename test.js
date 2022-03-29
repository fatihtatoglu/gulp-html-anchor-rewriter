"use strict";

const anchor = require("./index");

const Vinyl = require("vinyl");
const { src } = require("gulp");

const assert = require("stream-assert");
const should = require('chai').should();

const defaultOptions = {
    keyword: "",
    rel: "nofollow",
    target: "_new"
};

describe("gulp-html-anchor-rewriter", function () {
    it("should throw exception when option is missing.", function () {
        anchor.should.throw("The options are missing!");
    });

    it("should throw exception with invalid type of the keyword", function (done) {
        src("./test/test.html")
            .pipe(anchor({ keyword: 3 }))
            .once("error", function (e) {
                e.message.should.equal("The keyword must be string or array of the strings!");
                done();
            });
    });

    it("should ignore when file is empty.", function (done) {
        var stream = anchor(defaultOptions);
        stream
            .pipe(assert.length(0))
            .pipe(assert.end(done));

        stream.write(new Vinyl());
        stream.end();
    });

    it("should throw exception when file is streaming.", function (done) {
        src(["./test/*.html"], { buffer: false })
            .pipe(anchor(defaultOptions))
            .once("error", function (e) {
                e.message.should.equal("The streaming is not supported!");
                done();
            });
    });

    it("should not throw exception when parsing non-HTML formatted file.", function (done) {
        src(["./test/sample.txt"])
            .pipe(anchor(defaultOptions))
            .pipe(assert.end(done));
    });

    describe("rel attribute", function () {
        it("should add rel attribute to the anchor for one anchor.", function (done) {
            src("./test/test.html")
                .pipe(anchor({
                    rel: "nofollow"
                }))
                .pipe(assert.first(function (file) {
                    file.contents.toString().should.have.string("<a href=\"https://www.example.com\" rel=\"nofollow\">Example</a>");
                }))
                .pipe(assert.end(done));
        });

        it("should not add rel attribute to the anchor when a rel attribute is already existed.", function (done) {
            src("./test/test2.html")
                .pipe(anchor({
                    rel: "nofollow"
                }))
                .pipe(assert.first(function (file) {
                    file.contents.toString().should.have.string("<a href=\"https://github.com/fatihtatoglu/\" target=\"_new\" rel=\"external\"\r\n                title=\"Fatih Tatoğlu\">Fatih Tatoğlu</a>");
                }))
                .pipe(assert.end(done));
        });
    });

    describe("target attribute", function () {
        it("should add target attribute to the anchor.", function (done) {
            src("./test/test.html")
                .pipe(anchor({
                    target: "_new"
                }))
                .pipe(assert.first(function (file) {
                    file.contents.toString().should.have.string("<a href=\"https://www.example.com\" target=\"_new\">Example</a>");
                }))
                .pipe(assert.end(done));
        });

        it("should not add target attribute to the anchor when a rel attribute is already existed.", function (done) {
            src("./test/test2.html")
                .pipe(anchor({
                    target: "_new"
                }))
                .pipe(assert.first(function (file) {
                    file.contents.toString().should.have.string("<a href=\"https://github.com/fatihtatoglu/\" target=\"_new\" rel=\"external\"\r\n                title=\"Fatih Tatoğlu\">Fatih Tatoğlu</a>");
                }))
                .pipe(assert.end(done));
        });
    });

    describe("multiple anchors", function () {
        it("should add required attributes to all anchors", function (done) {
            src(["./test/test3.html", "./test/test4.html"])
                .pipe(anchor({
                    target: "_new",
                    rel: "nofollow"
                }))
                .pipe(assert.first(function (file) {
                    file.contents.toString().should.have.string("<a href=\"https://www.example.com\" rel=\"nofollow\" target=\"_new\">Example</a>");
                    file.contents.toString().should.have.string("<a href=\"https://www.test.com\" rel=\"nofollow\" target=\"_new\">Test</a>");
                }))
                .pipe(assert.second(function (file) {
                    file.contents.toString().should.have.string("<a href=\"https://www.example.com\" rel=\"nofollow\" target=\"_new\">Example</a>");
                    file.contents.toString().should.have.string("<a href=\"https://www.test.com\" rel=\"nofollow\" target=\"_new\">Test</a>");
                    file.contents.toString().should.have.string("<a href=\"https://www.example.com\" title=\"Example with Title\" rel=\"nofollow\" target=\"_new\">Example with Title</a>");
                }))
                .pipe(assert.end(done));
        });
    });

    describe("keyword", function () {
        it("should only edit anchor whose href matched with keyword", function (done) {
            src("./test/test3.html")
                .pipe(anchor({
                    keyword: "example.com",
                    rel: "nofollow"
                }))
                .pipe(assert.first(function (file) {
                    file.contents.toString().should.have.string("<a href=\"https://www.example.com\" rel=\"nofollow\">Example</a>");
                    file.contents.toString().should.have.string("<a href=\"https://www.test.com\">Test</a>");
                }))
                .pipe(assert.end(done));
        });

        it("should edit multiple anchors with given keyword array", function (done) {
            src("./test/test5.html")
                .pipe(anchor({
                    keyword: ["twitter.com", "instagram.com", "github.io"],
                    rel: "nofollow"
                }))
                .pipe(assert.first(function (file) {
                    file.contents.toString().should.have.string("<a href=\"https://www.twitter.com\" rel=\"nofollow\">Twitter</a>");
                    file.contents.toString().should.have.string("<a href=\"https://www.instagram.com\" rel=\"nofollow\">Insta</a>");
                    file.contents.toString().should.have.string("<a href=\"https://www.medium.com\" title=\"Medium with title\">Medium with title</a>");
                    file.contents.toString().should.have.string("<a href=\"https://github.io/test\" title=\"GitHub IO\" rel=\"nofollow\">GitHub IO</a>");
                    file.contents.toString().should.have.string("<a href=\"https://github.io/fatihtatoglu\" rel=\"nofollow\">GitHub IO</a>");
                }))
                .pipe(assert.end(done));
        });

        it("should not re-write given keyword in white-list mode", function (done) {
            src("./test/whitelist.html")
                .pipe(anchor({
                    keyword: "www.example.com",
                    rel: "nofollow",
                    target: "_new",
                    whiteList: true
                }))
                .pipe(assert.first(function (file) {
                    file.contents.toString().should.have.string("<a href=\"https://twitter.com\" rel=\"nofollow\" target=\"_new\">Twitter</a>");
                    file.contents.toString().should.have.string("<a href=\"https://www.example.com\">Home Example</a>");
                    file.contents.toString().should.have.string("<a href=\"https://image.example.com\" rel=\"nofollow\" target=\"_new\">Image Example</a>");
                }))
                .pipe(assert.end(done))
        });

        it("should not re-write given multiple keywords in white-list mode", function (done) {
            src("./test/whitelist.html")
                .pipe(anchor({
                    keyword: ["www.example.com", "image.example.com"],
                    rel: "nofollow",
                    target: "_new",
                    whiteList: true
                }))
                .pipe(assert.first(function (file) {
                    file.contents.toString().should.have.string("<a href=\"https://twitter.com\" rel=\"nofollow\" target=\"_new\">Twitter</a>");
                    file.contents.toString().should.have.string("<a href=\"https://www.example.com\">Home Example</a>");
                    file.contents.toString().should.have.string("<a href=\"https://image.example.com\">Image Example</a>");
                }))
                .pipe(assert.end(done))
        });
    });
});