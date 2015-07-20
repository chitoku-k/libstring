gulp   = require("gulp")
ts     = require("gulp-typescript")
uglify = require("gulp-uglify")
rename = require("gulp-rename")
run    = require("run-sequence")

gulp.task("compile", ->
    gulp.src("./src/*.ts")
        .pipe(ts(noEmitOnError: true, noImplicitAny: true, module: "commonjs")).js
        .pipe(gulp.dest("./dist/"))
)

gulp.task("minify", ->
    gulp.src(["./dist/*.js", "!**/*.min.js"])
        .pipe(uglify(preserveComments: "some"))
        .pipe(rename(extname: ".min.js"))
        .pipe(gulp.dest("./dist/"))
)

gulp.task("watch", ->
    gulp.watch("./src/*.ts", ["default"])
)

gulp.task("default", (cb) -> run("compile", "minify", cb))
