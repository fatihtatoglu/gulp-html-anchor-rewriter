# Html Anchor Rewriter Gulp Plugin

This is the simple plugin to re-write anchor elements such as adding new attributes.

## Motivation

While developing another gulp plugin ([1]), I have needed re-writing anchor elements for the SEO. After reading some articles, I decided develop a gulp plugin for re-writing anchor elements.

[![HitCount](https://hits.dwyl.com/fatihtatoglu/gulp-html-anchor-rewriter.svg?style=flat-square&show=unique)](http://hits.dwyl.com/fatihtatoglu/gulp-html-anchor-rewriter) ![GitHub](https://img.shields.io/github/license/fatihtatoglu/enginaer) ![npm](https://img.shields.io/npm/v/gulp-html-anchor-rewriter)

## Challenges

The gulp system has dynamic and usefull plugin system. However, some times finding a plugin will be a challenge and writing a custom plugin is already a challenge.

The gulp suggets a guideline for writing a plugin. This time, I want to follow it ([2]). In this challenge, I wrote tests for validating plugin and I have used [Mocha]([3]) and [Chai]([4]).

!["NodeJS"](./docs/nodejs.png) !["Gulp"](./docs/gulp.png) !["Mocha"](./docs/mocha.png) !["Chai"](./docs/chai.png)

## Installation

```bash
npm install --save-dev gulp-html-anchor-rewriter
```

## Usage

```js
const { src, dest } = require("gulp");
const anchorRewriter = require("gulp-html-anchor-rewriter");

exports.default = function () {

    return src("./test/*.html")
        .pipe(anchorRewriter({
            "rel": "nofollow"
        }))
        .pipe(dest("./output"));
};
```

## Options

Without any options plugin throws an exception.

| Name | Type | Description |
|---|---|---|
| keyword | String | For searcing the anchor element href attribute value. If the href contains the keyword, the anchor will be processed. |
| rel | String | For adding rel attribute. |
| target | String | For adding target attribute. |

[1]: https://github.com/fatihtatoglu/enginaer
[2]: https://github.com/gulpjs/gulp/tree/master/docs/writing-a-plugin
[3]: https://mochajs.org/
[4]: https://www.chaijs.com/

## Support

For supporting me, you can add an issue for bug cases or new feature requests.