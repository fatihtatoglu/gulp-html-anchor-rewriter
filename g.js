const { src, dest } = require("gulp");
const anchorRewriter = require("gulp-html-anchor-rewriter");

exports.default = function () {

    return src("./test/*.html")
        .pipe(anchorRewriter({
            "rel": "nofollow"
        }))
        .pipe(dest("./output"));
};
